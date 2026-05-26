/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppealButton } from '../AppealButton';
import type { Claim } from '@/lib/schemas/vote';

const mockClaim: Claim = {
  claim_id: '123',
  policy_id: '456',
  claimant: 'GABC1234WXYZ5678GABC1234WXYZ5678GABC1234WXYZ5678GABC1234',
  amount: '1000000000',
  details: 'Test claim',
  evidence: [],
  status: 'Rejected',
  voting_deadline_ledger: 1000000,
  approve_votes: 5,
  reject_votes: 10,
  filed_at: 900000,
  total_voters: 20,
};

describe('AppealButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Visibility', () => {
    it('shows button for rejected claim when wallet matches claimant', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
        />,
      );
      expect(screen.getByRole('button', { name: /appeal/i })).toBeInTheDocument();
    });

    it('hides button when claim is not rejected', () => {
      const approvedClaim = { ...mockClaim, status: 'Approved' as const };
      render(
        <AppealButton
          claim={approvedClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('hides button when wallet is not connected', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={null}
          onClick={mockOnClick}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('hides button when wallet does not match claimant', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress="GXYZ9876ABCD1234GXYZ9876ABCD1234GXYZ9876ABCD1234GXYZ9876"
          onClick={mockOnClick}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole('button', { name: /appeal/i });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when submitting', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
          submitting={true}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows submitting text when submitting', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
          submitting={true}
        />,
      );

      expect(screen.getByText(/submitting appeal/i)).toBeInTheDocument();
    });

    it('shows normal text when not submitting', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
          submitting={false}
        />,
      );

      expect(screen.getByText(/appeal decision/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label', () => {
      render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
        />,
      );

      expect(screen.getByLabelText(/appeal this rejected claim/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <AppealButton
          claim={mockClaim}
          walletAddress={mockClaim.claimant}
          onClick={mockOnClick}
          className="custom-class"
        />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Status Variations', () => {
    const statuses: Array<Claim['status']> = [
      'Processing',
      'Pending',
      'Approved',
      'Paid',
      'Withdrawn',
    ];

    statuses.forEach((status) => {
      it(`hides button for ${status} status`, () => {
        const claim = { ...mockClaim, status };
        render(
          <AppealButton
            claim={claim}
            walletAddress={mockClaim.claimant}
            onClick={mockOnClick}
          />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });
});
