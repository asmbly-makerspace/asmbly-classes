import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '../..');
const imageDirectory = path.resolve(testDirectory, '../src/lib/images');
const imagePathPrefix = 'app/src/lib/images/';
const supportedImageExtension = /\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$/;
const requiredFallbackImages = [
	'3dprintingDefault.jpg',
	'ceramicsDefault.jpg',
	'classDefault.jpg',
	'electronicsDefault.jpg',
	'lasersDefault.jpg',
	'metalworkingDefault.jpg',
	'textilesDefault.jpg',
	'woodworkingDefault.jpg'
];

function runGit(args) {
	try {
		const output = execFileSync('git', ['-C', repositoryRoot, ...args], {
			encoding: 'utf8'
		});

		return output.replace(/\s+$/, '');
	} catch {
		return '';
	}
}

function parseNameStatus(output) {
	return output
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [status, firstPath, secondPath] = line.split('\t');

			if (status.startsWith('R') || status.startsWith('C')) {
				return {
					status: status[0],
					path: firstPath,
					newPath: secondPath
				};
			}

			return {
				status,
				path: firstPath
			};
		})
		.filter((change) => change.path?.startsWith(imagePathPrefix));
}

function parsePorcelainStatus(output) {
	return output
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const status = line.slice(0, 2).trim() || line.slice(0, 2);
			const pathText = line.slice(3);
			const [oldPath, newPath] = pathText.split(' -> ');

			return {
				status,
				path: oldPath,
				newPath
			};
		})
		.filter((change) => change.path?.startsWith(imagePathPrefix));
}

function getImageChanges() {
	if (process.env.GITHUB_BASE_REF) {
		const baseDiff = runGit([
			'diff',
			'--name-status',
			'--find-renames=50%',
			`origin/${process.env.GITHUB_BASE_REF}...HEAD`,
			'--',
			imagePathPrefix
		]);

		if (baseDiff) {
			return parseNameStatus(baseDiff);
		}
	}

	return parsePorcelainStatus(runGit(['status', '--porcelain', '--', imagePathPrefix]));
}

function isAddedOrRenamed(change) {
	return change.status === 'A' || change.status === '??' || change.status === 'R';
}

function hasGeneratedVariantSuffix(filename) {
	const basename = filename.replace(supportedImageExtension, '');

	return [
		/^copy of /i,
		/\(\d+\)$/i,
		/(^|[ _-])copy([ _-]?\d+)?$/i,
		/(^|[ _-])(bak|backup|final|new|old|temp|tmp)$/i,
		/(^|[ _-])v\d+$/i,
		/[ _-]\d+$/
	].some((pattern) => pattern.test(basename));
}

test('required fallback class images exist', async () => {
	const actualImageFilenames = await readdir(imageDirectory);

	expect(actualImageFilenames).toEqual(expect.arrayContaining(requiredFallbackImages));
});

test('new class image filenames do not look like generated duplicate variants', () => {
	const generatedVariantFilenames = getImageChanges()
		.filter(isAddedOrRenamed)
		.map((change) => change.newPath ?? change.path)
		.filter((changedPath) => supportedImageExtension.test(changedPath))
		.map((changedPath) => path.basename(changedPath))
		.filter(hasGeneratedVariantSuffix);

	expect(
		generatedVariantFilenames,
		[
			'New image filenames should match class names instead of generated duplicate names.',
			'Examples that should fail: Woodshop_Safety_2.jpg, Woodshop_Safety copy.jpg, Woodshop_Safety (1).jpg.'
		].join('\n')
	).toEqual([]);
});
