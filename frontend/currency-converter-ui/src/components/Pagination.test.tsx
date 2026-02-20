import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders pagination with correct page numbers', () => {
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        page={1}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('enables previous button when not on first page', () => {
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        page={5}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });

  it('calls onPageChange with correct page number when previous is clicked', async () => {
    const user = userEvent.setup();
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        page={3}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with correct page number when next is clicked', async () => {
    const user = userEvent.setup();
    const mockOnPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={mockOnPageChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
});
