import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// This is a simple example form component
const SimpleForm = ({ onSubmit = (data: any) => {} }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} data-testid="simple-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          data-testid="name-input"
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          data-testid="email-input"
        />
      </div>

      <button type="submit" data-testid="submit-button">
        Submit
      </button>
    </form>
  );
};

// Tests for the SimpleForm component
describe('SimpleForm', () => {
  it('renders the form correctly', () => {
    render(<SimpleForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('updates input values on change', () => {
    render(<SimpleForm />);

    const nameInput = screen.getByTestId('name-input');
    const emailInput = screen.getByTestId('email-input');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('calls onSubmit with form data when submitted', () => {
    const handleSubmit = jest.fn();
    render(<SimpleForm onSubmit={handleSubmit} />);

    // Fill in data
    fireEvent.change(screen.getByTestId('name-input'), {
      target: { value: 'John Doe' }
    });
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'john@example.com' }
    });

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check that onSubmit was called with the correct data
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  it('handles user interactions correctly with userEvent', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    render(<SimpleForm onSubmit={handleSubmit} />);

    // Type in the inputs using userEvent (more realistic than fireEvent)
    await user.type(screen.getByTestId('name-input'), 'Jane Smith');
    await user.type(screen.getByTestId('email-input'), 'jane@example.com');

    // Click the submit button
    await user.click(screen.getByTestId('submit-button'));

    // Check that onSubmit was called with the correct data
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'Jane Smith',
      email: 'jane@example.com'
    });
  });
});
