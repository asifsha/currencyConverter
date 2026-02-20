import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loader } from './Loader';

describe('Loader', () => {
  it('renders loading message', () => {
    render(<Loader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Loader />);
    const loader = container.querySelector('.text-center');
    expect(loader).toBeInTheDocument();
  });
});
