import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AuthForm from './AuthForm';

describe('AuthForm Component', () => {
  it('renders correctly with initial state', () => {
    render(<AuthForm />);
    
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    // Use selector to avoid matching the toggle button's aria-label
    expect(screen.getByLabelText('Contraseña', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('validates email on blur', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    
    // Invalid email
    await user.type(emailInput, 'invalid-email');
    await user.tab(); // Trigger blur
    
    expect(await screen.findByText(/formato inválido/i)).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('validates password length on blur', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    
    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    
    // Short password
    await user.type(passwordInput, '123');
    await user.tab(); // Trigger blur
    
    expect(await screen.findByText(/al menos 8 caracteres/i)).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears error on focus/change', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    
    // Trigger error
    await user.type(emailInput, 'bad');
    await user.tab();
    expect(screen.getByText(/formato inválido/i)).toBeInTheDocument();
    
    // Fix error
    await user.type(emailInput, '@test.com');
    // Error should disappear immediately (progressive validation)
    // Check specifically for the email error message
    expect(screen.queryByText(/formato inválido/i)).not.toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<AuthForm />);
    
    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Ocultar contraseña');
    
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('prevents submission with invalid data', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<AuthForm onSubmit={handleSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);
    
    expect(handleSubmit).not.toHaveBeenCalled();
    // Should show errors for empty fields
    const alerts = await screen.findAllByRole('alert');
    expect(alerts).toHaveLength(2); // Email and Password required
  });

  it('shows loading state and disables button during submission', async () => {
    const user = userEvent.setup();
    // Mock submit that takes time
    const handleSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 500)));
    render(<AuthForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText('Correo Electrónico'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña', { selector: 'input' }), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/procesando/i);
    
    await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
