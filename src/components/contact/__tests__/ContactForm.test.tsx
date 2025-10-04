import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import ContactForm from '../ContactForm';

// Mock the form submission handler
const mockSubmit = jest.fn();

// Mock the reCAPTCHA component
jest.mock('react-google-recaptcha', () => {
  return {
    __esModule: true,
    default: ({ onChange }: { onChange: (token: string | null) => void }) => (
      <div data-testid="mock-recaptcha" onClick={() => onChange('test-token')}>
        Mock reCAPTCHA
      </div>
    ),
  };
});

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactForm onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    
    // Check for validation errors
    expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/subject must be at least 5 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/message must be at least 10 characters/i)).toBeInTheDocument();
    
    // Form submission should not be called
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Enter an invalid email
    const emailInput = screen.getByLabelText(/email/i);
    userEvent.type(emailInput, 'invalid-email');
    
    // Trigger validation
    fireEvent.blur(emailInput);
    
    // Check for email validation error
    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill out the form
    userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    userEvent.type(screen.getByLabelText(/message/i), 'This is a test message with more than 10 characters.');
    
    // Complete reCAPTCHA
    fireEvent.click(screen.getByTestId('mock-recaptcha'));
    
    // Submit the form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    
    // Check if the form was submitted with the correct data
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with more than 10 characters.'
      });
    });
  });

  it('shows loading state when submitting', async () => {
    // Create a promise that we can resolve later
    let resolveSubmit: (value?: any) => void;
    const submitPromise = new Promise(resolve => {
      resolveSubmit = resolve;
    });
    
    mockSubmit.mockImplementation(() => submitPromise);
    
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill out the form
    userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    userEvent.type(screen.getByLabelText(/message/i), 'This is a test message with more than 10 characters.');
    fireEvent.click(screen.getByTestId('mock-recaptcha'));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    
    // Check if the button is in loading state
    expect(screen.getByRole('button', { name: /sending.../i })).toBeDisabled();
    
    // Resolve the promise
    await act(async () => {
      resolveSubmit();
      await submitPromise;
    });
  });

  it('shows success message after successful submission', async () => {
    mockSubmit.mockResolvedValueOnce({});
    
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill out and submit the form
    userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    userEvent.type(screen.getByLabelText(/message/i), 'This is a test message.');
    fireEvent.click(screen.getByTestId('mock-recaptcha'));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    
    // Check for success message
    expect(await screen.findByText(/message sent successfully/i)).toBeInTheDocument();
  });

  it('shows error message when submission fails', async () => {
    const errorMessage = 'Failed to send message';
    mockSubmit.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<ContactForm onSubmit={mockSubmit} />);
    
    // Fill out and submit the form
    userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    userEvent.type(screen.getByLabelText(/message/i), 'This is a test message.');
    fireEvent.click(screen.getByTestId('mock-recaptcha'));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    });
    
    // Check for error message
    expect(await screen.findByText(/error sending message/i)).toBeInTheDocument();
  });
});
