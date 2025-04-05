import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive');
  });
});
