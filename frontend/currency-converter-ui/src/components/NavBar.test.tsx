import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import NavBar from './NavBar';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderNavBar = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('NavBar', () => {
  it('renders navigation links', () => {
    renderNavBar();

    expect(screen.getByText('Convert')).toBeInTheDocument();
    expect(screen.getByText('Latest Rates')).toBeInTheDocument();
    expect(screen.getByText('Historical')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderNavBar();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    renderNavBar();

    const convertLink = screen.getByText('Convert').closest('a');
    const latestLink = screen.getByText('Latest Rates').closest('a');
    const historicalLink = screen.getByText('Historical').closest('a');

    expect(convertLink).toHaveAttribute('href', '/convert');
    expect(latestLink).toHaveAttribute('href', '/latest');
    expect(historicalLink).toHaveAttribute('href', '/history');
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    renderNavBar();

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    await user.click(logoutButton);

    // Token should be cleared from localStorage
    expect(localStorage.getItem('token')).toBeNull();
  });
});
