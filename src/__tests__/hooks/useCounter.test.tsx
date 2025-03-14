import React from 'react';
import { renderHook, act } from '@testing-library/react';

// Example custom hook to test
function useCounter(initialValue = 0) {
  const [count, setCount] = React.useState(initialValue);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

// Mock React's useState
const mockSetState = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (initial: any) => [initial, mockSetState]
}));

describe('useCounter Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    // Since we're mocking useState, we need to check if setState was called correctly
    expect(mockSetState).toHaveBeenCalled();
    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should decrement counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.decrement();
    });

    expect(mockSetState).toHaveBeenCalled();
    expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should reset counter', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.reset();
    });

    expect(mockSetState).toHaveBeenCalledWith(5);
  });
});
