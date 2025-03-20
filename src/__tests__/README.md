# Testing Guide for Pay Dashboard

This directory contains test files for the Pay Dashboard application. We use Jest as our test runner and React Testing Library for testing React components.

## What We've Accomplished

1. **Set up Jest and React Testing Library** for testing React components and utilities.
2. **Created configuration files**:
   - `jest.config.js`: Main Jest configuration
   - `jest.setup.js`: Setup file with global mocks
   - `tsconfig.jest.json`: TypeScript configuration for Jest
3. **Added test scripts** to package.json:
   - `npm test`: Run all tests
   - `npm run test:watch`: Run tests in watch mode
   - `npm run test:coverage`: Run tests with coverage report
4. **Created example tests** for different types of components and functions:
   - Utility functions (`formatters.test.ts`)
   - React components (`Button.test.tsx`, `Form.test.tsx`)
   - API functions (`example.test.ts`)
   - Custom hooks (`useCounter.test.tsx`)
   - Next.js pages (`HomePage.test.tsx`)
5. **Set up mocks** for external dependencies:
   - Next.js router
   - next-intl
   - API calls

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

## Writing Tests

### Testing Utility Functions

```typescript
import { myFunction } from '@/lib/utils';

describe('myFunction', () => {
  it('should do something specific', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Forms

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyForm from '@/components/MyForm';

describe('MyForm', () => {
  it('updates input values on change', () => {
    render(<MyForm />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput).toHaveValue('John Doe');
  });

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
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import useMyHook from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('should update state when action is called', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

## Mocking

### Mocking API Calls

```typescript
import { fetchData } from '@/services/api';

// Mock the API module
jest.mock('@/services/api', () => ({
  fetchData: jest.fn()
}));

describe('Component using API', () => {
  beforeEach(() => {
    // Reset mock before each test
    jest.clearAllMocks();
  });

  it('should fetch and display data', async () => {
    // Setup mock return value
    fetchData.mockResolvedValueOnce({ data: 'test data' });

    // Test component that uses fetchData
    // ...

    expect(fetchData).toHaveBeenCalledTimes(1);
  });
});
```

### Mocking Next.js Router

Next.js router is already mocked in the `jest.setup.js` file. You can use it directly in your tests.

## Best Practices

1. Test behavior, not implementation details
2. Write tests that are resilient to changes
3. Use meaningful test descriptions
4. Keep tests simple and focused
5. Use setup and teardown functions for common test setup
6. Mock external dependencies
7. Test edge cases and error scenarios
8. Use data-testid attributes for elements that need to be selected in tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
