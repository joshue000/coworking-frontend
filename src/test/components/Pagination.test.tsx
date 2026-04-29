import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={5} pageSize={10} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} total={0} pageSize={10} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows correct item range on first page', () => {
    render(<Pagination page={1} totalPages={3} total={25} pageSize={10} onPageChange={vi.fn()} />);
    expect(screen.getByText(/1–10/)).toBeInTheDocument();
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('shows correct item range on last page', () => {
    render(<Pagination page={3} totalPages={3} total={25} pageSize={10} onPageChange={vi.fn()} />);
    expect(screen.getByText(/21–25/)).toBeInTheDocument();
  });

  it('calls onPageChange with next page when next button is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} total={25} pageSize={10} onPageChange={onPageChange} />
    );
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];
    await userEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with previous page when prev button is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={2} totalPages={3} total={25} pageSize={10} onPageChange={onPageChange} />
    );
    const [prevButton] = screen.getAllByRole('button');
    await userEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('disables prev button on first page', () => {
    render(<Pagination page={1} totalPages={3} total={25} pageSize={10} onPageChange={vi.fn()} />);
    const [prevButton] = screen.getAllByRole('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={3} totalPages={3} total={25} pageSize={10} onPageChange={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when a numbered page button is clicked', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination page={1} totalPages={3} total={25} pageSize={10} onPageChange={onPageChange} />
    );
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
