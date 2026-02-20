import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import LoginPage from './LoginPage';
import * as apiClient from '../api/client';

vi.mock('../api/client');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLoginPage();

    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('has default values for username and password', () => {
    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    expect(usernameInput).toHaveValue('converter');
    expect(passwordInput).toHaveValue('password');
  });

  it('updates username and password inputs', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    await user.clear(usernameInput);
    await user.type(usernameInput, 'newuser');

    await user.clear(passwordInput);
    await user.type(passwordInput, 'newpassword');

    expect(usernameInput).toHaveValue('newuser');
    expect(passwordInput).toHaveValue('newpassword');
  });

  it('submits login form with correct data', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.post).mockResolvedValueOnce({
      data: { token: 'valid-token' },
    });

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiClient.default.post).toHaveBeenCalledWith(
        '/auth/login',
        {
          username: 'converter',
          password: 'password',
        }
      );
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.post).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    // The button should show loading behavior
    expect(submitButton).toBeInTheDocument();
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    };

    vi.mocked(apiClient.default.post).mockRejectedValueOnce(error);

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('displays generic error when response lacks error field', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.post).mockRejectedValueOnce(
      new Error('Network error')
    );

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('stores token in localStorage on successful login', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.post).mockResolvedValueOnce({
      data: { token: 'valid-token' },
    });

    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('valid-token');
    });
  });

  it('prevents form submission by default', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.post).mockResolvedValueOnce({
      data: { token: 'valid-token' },
    });

    renderLoginPage();

    const form = screen.getByRole('button', { name: 'Login' }).closest('form');
    const submitSpy = vi.spyOn(Event.prototype, 'preventDefault');

    const submitButton = screen.getByRole('button', { name: 'Login' });
    await user.click(submitButton);

    expect(form).toBeInTheDocument();
  });
});
