# Testing Guide for Pay Dashboard

This document provides an overview of the testing setup for the Pay Dashboard application.

## Testing Setup

We use the following tools for testing:

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **ts-jest**: For TypeScript support in Jest

## Running Tests

You can run tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in a directory structure that mirrors the source code:

- `__tests__/components/` - Tests for React components
- `__tests__/utils/` - Tests for utility functions
- `__tests__/hooks/` - Tests for custom hooks
- `__tests__/api/` - Tests for API functions
- `__tests__/pages/` - Tests for page components

## Test Examples

The project includes several example tests to demonstrate different testing scenarios:

1. **Utility Functions** (`src/__tests__/utils/formatters.test.ts`): Shows how to test pure JavaScript/TypeScript functions.

2. **React Components**:

   - `src/__tests__/components/Button.test.tsx`: Demonstrates testing React components, including rendering, user interactions, and checking props.
   - `src/__tests__/components/Form.test.tsx`: Shows how to test form components, including input changes and form submission.

3. **API Functions** (`src/__tests__/api/example.test.ts`): Shows how to mock API calls and test async functions.

4. **Custom Hooks** (`src/__tests__/hooks/useCounter.test.tsx`): Demonstrates testing React hooks using renderHook.

5. **Page Components** (`src/__tests__/pages/HomePage.test.tsx`): Shows how to test Next.js page components.

## Mocking

The test setup includes several mocks to help with testing:

- **Next.js Router**: Mocked in `jest.setup.js` to avoid router-related errors.
- **next-intl**: Mocked in `jest.setup.js` for internationalization.
- **API Calls**: Example of mocking axios in `src/__tests__/api/example.test.ts`.

## Configuration Files

- **jest.config.js**: Main Jest configuration file.
- **jest.setup.js**: Setup file that runs before tests, includes global mocks.
- **tsconfig.jest.json**: TypeScript configuration specific for Jest.

## Testing Forms

When testing forms, follow these patterns:

1. **Test rendering**: Verify that all form elements are rendered correctly.
2. **Test input changes**: Verify that input values update correctly when changed.
3. **Test form submission**: Verify that the form submits with the correct data.
4. **Test validation**: If applicable, verify that form validation works correctly.

Example:

```typescript
// Test input changes
it('updates input values on change', () => {
  render(<MyForm />);

  const nameInput = screen.getByTestId('name-input');
  fireEvent.change(nameInput, { target: { value: 'John Doe' } });

  expect(nameInput).toHaveValue('John Doe');
});

// Test form submission
it('calls onSubmit with form data when submitted', () => {
  const handleSubmit = jest.fn();
  render(<MyForm onSubmit={handleSubmit} />);

  // Fill in data
  fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });

  // Submit the form
  fireEvent.click(screen.getByTestId('submit-button'));

  // Check that onSubmit was called with the correct data
  expect(handleSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on testing what the component/function does, not how it does it.
2. **Keep Tests Simple**: Each test should test one thing.
3. **Use Descriptive Test Names**: Test names should describe what is being tested.
4. **Mock External Dependencies**: Use mocks for external services, APIs, etc.
5. **Test Edge Cases**: Include tests for error conditions and edge cases.
6. **Maintain Test Independence**: Tests should not depend on each other.
7. **Use data-testid Attributes**: Add data-testid attributes to elements that need to be selected in tests.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
