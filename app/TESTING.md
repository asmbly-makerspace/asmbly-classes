# Unit Testing Guide

This project uses unit tests following the pattern from the NeonIntegrations repository - **mocking only the network, not the business logic**.

## Testing Philosophy

The tests are designed to:
1. **Mock only external dependencies** (API calls, database, email services)
2. **Test the actual business logic** without modification
3. **Verify behavior through assertions** on mock calls and state changes

This approach ensures that:
- Tests validate the real code paths
- Business logic bugs are caught
- External dependencies don't cause test failures
- Tests run quickly without network/database overhead

## Test Structure

### Test Location
Tests are colocated with the code they test, using the `.test.js` suffix:
- `src/routes/api/class-registration/+server.test.js`
- `src/routes/api/class-cancellation/+server.test.js`
- `src/routes/newsletter-signup/+page.server.test.js`
- `src/routes/(data-pages)/event/[eventTypeId]/+page.server.test.js`

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (for CI)
npm test -- --run

# Run tests for a specific file
npm test -- class-registration
```

## Mock Helpers

The `tests/helpers/apiMocker.js` provides utilities for mocking:

### `createMockPrisma()`
Creates a mock Prisma client that simulates database operations in-memory:

```javascript
const mockPrisma = createMockPrisma();

// Set up test data
mockPrisma._setData('neonEventInstance', eventId, {
  eventId,
  eventTypeId: 1,
  attendeeCount: 5,
  capacity: 10,
  startDateTime: new Date('2026-03-01T10:00:00Z')
});

// Verify data changes
const updated = mockPrisma._getData('neonEventInstance', eventId);
expect(updated.attendeeCount).toBe(6);
```

### `createMockFetch()`
Creates a mock fetch function for external API calls:

```javascript
const mockFetch = createMockFetch();

// Add a mock response
mockFetch.addMock(
  '/v2/accounts/456',
  { individualAccount: { ... } },
  200
);

// Verify calls were made
expect(mockFetch.calls.length).toBe(1);
```

### `NeonWebhookMock`
Helper to create webhook payloads from Neon:

```javascript
const webhook = new NeonWebhookMock(eventId, registrantId, {
  status: 'SUCCEEDED',
  apiKey: 'test-api-key'
});

const request = {
  json: async () => webhook.toRequest()
};
```

### `NeonAccountMock`
Helper to create mock Neon account responses:

```javascript
const account = new NeonAccountMock(accountId, {
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
});

const response = account.toNeonResponse();
```

## Test Examples

### Testing Successful Operations

```javascript
it('increments attendee count on successful registration', async () => {
  // Setup test data
  mockPrisma._setData('neonEventInstance', eventId, {
    eventId,
    attendeeCount: 5,
    ...
  });

  // Execute the handler
  const webhook = new NeonWebhookMock(eventId, registrantId);
  const response = await POST({ request: { json: async () => webhook.toRequest() } });

  // Verify results
  expect(response.status).toBe(200);
  const updated = mockPrisma._getData('neonEventInstance', eventId);
  expect(updated.attendeeCount).toBe(6);
});
```

### Testing Error Cases

```javascript
it('returns 401 when API key is invalid', async () => {
  const webhook = new NeonWebhookMock(123, 456, { apiKey: 'wrong-key' });
  
  try {
    await POST({ request: { json: async () => webhook.toRequest() } });
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error.status).toBe(401);
  }
});
```

### Testing External Service Interactions

```javascript
it('sends notification emails to waitlist when seat opens', async () => {
  // Setup: waitlist requesters
  mockPrisma._setData('neonEventInstanceRequest', requester1Id, {
    id: requester1Id,
    eventId,
    fulfilled: false,
    requester: { email: 'waitlist@example.com', ... }
  });

  // Execute
  const response = await POST({ request: ... });

  // Verify email was sent
  expect(mockSendMIMEmessage).toHaveBeenCalledTimes(1);
  expect(mockSendMIMEmessage.mock.calls[0][0].to).toBe('waitlist@example.com');
  
  // Verify request was fulfilled
  const request = mockPrisma._getData('neonEventInstanceRequest', requester1Id);
  expect(request.fulfilled).toBe(true);
});
```

## Vitest Configuration

Tests are configured in `vite.config.js`:

```javascript
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

## Best Practices

1. **Reset mocks before each test**: Use `beforeEach()` to clear mock data and call histories
2. **Test one behavior per test**: Keep tests focused and easy to understand
3. **Use descriptive test names**: Clearly state what behavior is being tested
4. **Verify both success and failure paths**: Test error handling, not just happy paths
5. **Mock at the boundary**: Mock external services (network, email), not internal functions
6. **Avoid implementation details**: Test behavior, not internal implementation

## Common Patterns

### Setting up mocks with vi.mock

```javascript
import { createMockPrisma } from '$tests/helpers/apiMocker.js';

let mockPrisma;

vi.mock('$lib/postgres.js', () => ({
  get prisma() {
    return mockPrisma;
  }
}));

// Import AFTER mocks are set up
const { POST } = await import('./+server.js');

describe('tests', () => {
  beforeEach(() => {
    mockPrisma = createMockPrisma();
  });
});
```

This pattern uses getters to avoid Vitest hoisting issues, allowing mocks to be re-initialized in `beforeEach()`.

The `$tests` alias is configured in `vite.config.js` and points to the `tests/` directory, keeping test utilities separate from production code.

## Testing Coverage

Current test coverage includes:

### API Endpoints
- ✅ API authentication (valid/invalid keys)
- ✅ Event registration (increment attendee count)
- ✅ Waitlist fulfillment (matching registrants)
- ✅ Event cancellation (decrement attendee count)
- ✅ Duplicate cancellation prevention
- ✅ Waitlist notifications on seat opening
- ✅ Email failure handling
- ✅ Refund vs cancellation status handling

### Page Actions
- ✅ Newsletter signup (Flodesk API integration)
- ✅ Private class requests (email notifications)
- ✅ Full class waitlist requests
- ✅ Notification requests for class types
- ✅ On-demand class requests
- ✅ Form validation failures
- ✅ Database operations (upsert, transactions)

### Page Load Functions
- ✅ Event page data loading
- ✅ 404 handling for missing events
- ✅ Cache header configuration
- ✅ Event instances with filters

## CI/CD Integration

### Automated Testing on Pull Requests

Tests are automatically run on every pull request to the `main` branch via GitHub Actions (`.github/workflows/test-pr.yml`).

The workflow:
1. **Triggers** on PRs that modify files in the `app/` directory
2. **Runs all tests** with `npm test -- --run`
3. **Generates coverage reports** with `npm test -- --run --coverage`
4. **Uploads coverage artifacts** for review
5. **Comments coverage results** directly on the PR

### Viewing Test Results

- Test results appear in the GitHub Actions tab for each PR
- Coverage reports are uploaded as artifacts and can be downloaded
- Coverage summary is automatically commented on the PR
- Failed tests will block the PR merge if required status checks are enabled

### Local vs CI Testing

Both local and CI environments run the same tests:
- **Local**: `npm test` (watch mode for development)
- **CI**: `npm test -- --run` (single run for automated checks)

This ensures consistency between development and production testing.

## Future Enhancements

Consider adding tests for:
- More helper functions in `src/lib/helpers/`
- Model classes (`NeonEventType`, `NeonEventInstance`)
- Server-side authentication logic
- Additional API endpoints as they are created

