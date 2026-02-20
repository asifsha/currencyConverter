import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyForm } from './CurrencyForm';
import * as apiClient from '../api/client';

vi.mock('../api/client');

describe('CurrencyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with default values', () => {
    render(<CurrencyForm />);

    expect(screen.getByText('Currency Conversion')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EUR')).toBeInTheDocument();
  });

  it('shows error when amount is zero or negative', async () => {
    const user = userEvent.setup();
    render(<CurrencyForm />);

    const button = screen.getByRole('button', { name: 'Convert' });
    await user.click(button);

    expect(
      screen.getByText('Amount must be greater than zero.')
    ).toBeInTheDocument();
  });

  it('renders loader during API call', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.get).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<CurrencyForm />);

    const amountInput = screen.getByPlaceholderText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    const button = screen.getByRole('button', { name: 'Convert' });
    await user.click(button);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays result after successful conversion', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        from: 'USD',
        to: 'EUR',
        amount: 100,
        result: 92.5,
      },
    };

    vi.mocked(apiClient.default.get).mockResolvedValueOnce(mockResponse);

    render(<CurrencyForm />);

    const amountInput = screen.getByPlaceholderText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    const button = screen.getByRole('button', { name: 'Convert' });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Result: 92.5')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    const user = userEvent.setup();
    const error = {
      response: {
        data: {
          message: 'Invalid currency',
        },
      },
    };

    vi.mocked(apiClient.default.get).mockRejectedValueOnce(error);

    render(<CurrencyForm />);

    const amountInput = screen.getByPlaceholderText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    const button = screen.getByRole('button', { name: 'Convert' });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Invalid currency')).toBeInTheDocument();
    });
  });

  it('displays generic error when API response lacks message', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.get).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<CurrencyForm />);

    const amountInput = screen.getByPlaceholderText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, '100');

    const button = screen.getByRole('button', { name: 'Convert' });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Conversion failed.')).toBeInTheDocument();
    });
  });

  it('updates from and to currency values', async () => {
    const user = userEvent.setup();
    render(<CurrencyForm />);

    const fromInput = screen.getByDisplayValue('USD');
    const toInput = screen.getByDisplayValue('EUR');

    await user.clear(fromInput);
    await user.type(fromInput, 'GBP');

    await user.clear(toInput);
    await user.type(toInput, 'JPY');

    expect(fromInput).toHaveValue('GBP');
    expect(toInput).toHaveValue('JPY');
  });

  it('makes API call with correct parameters', async () => {
    const user = userEvent.setup();
    vi.mocked(apiClient.default.get).mockResolvedValueOnce({
      data: {
        from: 'USD',
        to: 'EUR',
        amount: 50,
        result: 46.25,
      },
    });

    render(<CurrencyForm />);

    const amountInput = screen.getByPlaceholderText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, '50');

    const button = screen.getByRole('button', { name: 'Convert' });
    await user.click(button);

    await waitFor(() => {
      expect(apiClient.default.get).toHaveBeenCalledWith(
        '/rates/convert',
        expect.objectContaining({
          params: {
            from: 'USD',
            to: 'EUR',
            amount: 50,
          },
        })
      );
    });
  });
});
