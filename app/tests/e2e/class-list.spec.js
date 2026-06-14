import { expect, test } from '@playwright/test';

// Requires the test database to be running locally:
//   npm run test:db:up
// Then:
//   npm run test:ui

const HOME = '/';

test.describe.configure({ mode: 'serial' });

async function visibleCardCount(page) {
	return page.locator('[data-testid="class-card"]').count();
}

async function cardHeadings(page) {
	return page.locator('[data-testid="class-card"] h2').allTextContents();
}

async function visibleCategories(page) {
	return page
		.locator('[data-testid="class-card"]')
		.evaluateAll((cards) => cards.map((c) => c.dataset.category));
}

test.describe('class list page', () => {
	test('renders correctly', async ({ page }) => {
		const failedImageResponses = [];
		page.on('response', (response) => {
			if (response.request().resourceType() === 'image' && !response.ok()) {
				failedImageResponses.push(`${response.status()} ${response.url()}`);
			}
		});

		await page.goto(HOME);

		await expect(page).toHaveTitle('Asmbly | Classes');

		const cards = page.locator('[data-testid="class-card"]');
		await expect(cards.first()).toBeVisible();
		const count = await cards.count();
		expect(count).toBeGreaterThan(0);
		await expect(page.getByText('Sorry, no results found')).toBeHidden();

		for (let i = 0; i < count; i++) {
			const card = cards.nth(i);
			await expect(card.locator('img[alt$=" image"]')).toBeVisible();
			await expect(card.getByRole('heading', { level: 2 })).toBeVisible();
			await expect(card.getByRole('link', { name: /^learn more about/i })).toHaveAttribute(
				'href',
				/^\/event\/\d+\?eventId=\d+$/
			);
			await expect(card.getByText(/^Price:/)).toBeVisible();
		}

		const brokenImages = await page
			.locator('[data-testid="class-card"] img[alt$=" image"]')
			.evaluateAll(async (images) => {
				const failures = [];
				for (const image of images) {
					try {
						await image.decode();
					} catch {
						failures.push(`${image.alt}: decode failed`);
						continue;
					}
					if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
						failures.push(`${image.alt}: loaded with zero dimensions`);
					}
				}
				return failures;
			});

		expect(failedImageResponses).toEqual([]);
		expect(brokenImages).toEqual([]);
	});

	test('search works', async ({ page }) => {
		await page.goto(HOME);
		const baseline = await visibleCardCount(page);
		expect(baseline).toBeGreaterThan(0);

		const firstWord = (await cardHeadings(page))[0].match(/[A-Za-z0-9]+/)?.[0];
		expect(firstWord, 'first card heading should contain a word').toBeTruthy();

		const searchInput = page.getByPlaceholder('Search by class name...');

		await searchInput.fill(firstWord);
		await expect
			.poll(async () => {
				const current = await cardHeadings(page);
				return (
					current.length > 0 &&
					current.some((h) => h.toLowerCase().includes(firstWord.toLowerCase()))
				);
			})
			.toBe(true);

		await searchInput.fill('zzzqxnonsense');
		await expect(page.getByText('Sorry, no results found')).toBeVisible();

		const clearButton = page.getByRole('button', { name: 'Clear Search' });
		await expect(clearButton).toBeVisible();
		await clearButton.click();
		await expect.poll(async () => visibleCardCount(page)).toBe(baseline);
	});

	test('sort works', async ({ page }) => {
		await page.goto(HOME);

		await page.locator('select').selectOption('Name');

		await expect
			.poll(async () => {
				const current = await cardHeadings(page);
				const sorted = [...current].sort((a, b) =>
					a.toLowerCase().localeCompare(b.toLowerCase())
				);
				return current.length > 1 && JSON.stringify(current) === JSON.stringify(sorted);
			})
			.toBe(true);

		const asc = await cardHeadings(page);
		const expectedDesc = [...asc].reverse();

		await page.locator('label').filter({ hasText: 'Sort Order' }).click();

		await expect
			.poll(async () => {
				const current = await cardHeadings(page);
				return JSON.stringify(current) === JSON.stringify(expectedDesc);
			})
			.toBe(true);
	});

	test('filters work', async ({ page }) => {
		await page.goto(HOME);
		const baseline = await visibleCardCount(page);
		expect(baseline).toBeGreaterThan(0);

		const targetCategory = [...new Set(await visibleCategories(page))].find(Boolean);
		expect(targetCategory, 'expected at least one category among rendered cards').toBeTruthy();
		const categoryCheckbox = page.locator(`input[name="${targetCategory}"]`);

		await categoryCheckbox.check();
		await page.waitForURL(/archCategories=/);
		const filteredCategories = await visibleCategories(page);
		expect(filteredCategories.length).toBeGreaterThan(0);
		expect(filteredCategories.every((c) => c === targetCategory)).toBe(true);

		await categoryCheckbox.uncheck();
		await expect.poll(async () => visibleCardCount(page)).toBe(baseline);

		await page.getByLabel('Group By Class Type').uncheck();
		await expect.poll(async () => visibleCardCount(page)).toBeGreaterThanOrEqual(baseline);
		await page.getByLabel('Group By Class Type').check();
		await expect.poll(async () => visibleCardCount(page)).toBe(baseline);

		await page.getByLabel('Show Unscheduled Classes').uncheck();
		await expect.poll(async () => visibleCardCount(page)).toBeLessThanOrEqual(baseline);
	});

	test('navigation works', async ({ page }) => {
		await page.goto(HOME);

		await expect(page.getByRole('link', { name: 'Mentor Series' }).first()).toHaveAttribute(
			'href',
			'https://asmbly.org/classes-events/mentor-series/'
		);
		await expect(page.getByRole('link', { name: 'Classes FAQ' }).first()).toHaveAttribute(
			'href',
			'https://asmbly.org/faq/#classfaq'
		);

		const targetCategory = [...new Set(await visibleCategories(page))].find(Boolean);
		expect(targetCategory).toBeTruthy();
		await page.goto(`/?sortBy=Name&archCategories=${encodeURIComponent(targetCategory)}`);

		await expect(page.locator('select')).toHaveValue('Name');
		await expect(page.locator(`input[name="${targetCategory}"]`)).toBeChecked();
		const restored = await visibleCategories(page);
		expect(restored.length).toBeGreaterThan(0);
		expect(restored.every((c) => c === targetCategory)).toBe(true);

		await page.goto(HOME);
		await page
			.locator('[data-testid="class-card"]')
			.first()
			.getByRole('link', { name: /^learn more about/i })
			.click();
		await expect(page).toHaveURL(/^.*\/event\/\d+\?eventId=\d+$/);
	});
});
