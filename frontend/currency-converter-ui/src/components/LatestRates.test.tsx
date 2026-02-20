import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LatestRates } from './LatestRates';
import * as apiClient from '../api/client';

vi.mock('../api/client');

describe('LatestRates', () => {
  const mockRatesResponse = {
    data: {
      base: 'USD',
      rates: {
        EUR: 0.925,
        GBP: 0.79,
        JPY: 149.5,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.default.get).mockResolvedValue(mockRatesResponse);
  });

  it('renders the component with title', () => {
    render(<LatestRates />);
    expect(screen.getByText('Latest Rates')).toBeInTheDocument();
  });

  it('renders base currency input', () => {
    render(<LatestRates />);
    expect(screen.getByDisplayValue('USD')).toBeInTheDocument();
  });

  it('fetches rates on mount', async () => {
    render(<LatestRates />);

    await waitFor(() => {
      expect(apiClient.default.get).toHaveBeenCalledWith(
        '/rates/latest',
        expect.objectContaining({
          params: { base: 'USD' },
        })
      );
    });
  });

  it('displays loaded rates', async () => {
    render(<LatestRates />);

    await waitFor(() => {
      expect(screen.getByText('EUR: 0.925')).toBeInTheDocument();
      expect(screen.getByText('GBP: 0.79')).toBeInTheDocument();
      expect(screen.getByText('JPY: 149.5')).toBeInTheDocument();
    });
  });

  it('shows loader while fetching', async () => {
    vi.mocked(apiClient.default.get).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<LatestRates />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    const error = {
      response: {
        data: {
          message: 'Invalid base currency',
        },
      },
    };

    vi.mocked(apiClient.default.get).mockRejectedValueOnce(error);

    render(<LatestRates />);

    await waitFor(() => {
      expect(
        screen.getByText('Invalid base currency')
      ).toBeInTheDocument();
    });
  });

  it('fetches new rates when base currency changes', async () => {
    const user = userEvent.setup();
    render(<LatestRates />);

    const baseInput = screen.getByDisplayValue('USD');
    await user.clear(baseInput);
    await user.type(baseInput, 'EUR');

    await waitFor(() => {
      expect(apiClient.default.get).toHaveBeenLastCalledWith(
        '/rates/latest',
        expect.objectContaining({
          params: { base: 'EUR' },
        })
      );
    });
  });

  it('clears error when successfully fetching new rates', async () => {
    const error = {
      response: {
        data: {
          message: 'Initial error',
        },
      },
    };

    vi.mocked(apiClient.default.get).mockRejectedValueOnce(error);

    render(<LatestRates />);

    await waitFor(() => {
      expect(screen.getByText('Initial error')).toBeInTheDocument();
    });

    // Mock successful response for next call
    vi.mocked(apiClient.default.get).mockResolvedValueOnce(mockRatesResponse);

    const user = userEvent.setup();
    const baseInput = screen.getByDisplayValue('USD');
    await user.clear(baseInput);
    await user.type(baseInput, 'EUR');

    await waitFor(() => {
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });
  });
});
