/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppealConfirmModal } from '../AppealConfirmModal';
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

describe('AppealConfirmModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/appeal claim decision/i)).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <AppealConfirmModal
          open={false}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.queryByText(/appeal claim decision/i)).not.toBeInTheDocument();
    });

    it('does not render when claim is null', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={null}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.queryByText(/appeal claim decision/i)).not.toBeInTheDocument();
    });
  });

  describe('Appeal Rules Display', () => {
    it('displays one appeal per claim rule', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText(/one appeal per claim/i)).toBeInTheDocument();
    });

    it('displays elevated quorum rule', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText(/elevated quorum/i)).toBeInTheDocument();
    });

    it('displays new voting window rule', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText(/new voting window/i)).toBeInTheDocument();
    });

    it('displays final decision rule', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText(/final decision/i)).toBeInTheDocument();
    });
  });

  describe('Claim Details Display', () => {
    it('displays claim ID', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      const claimIdElements = screen.getAllByText(/#123/);
      expect(claimIdElements.length).toBeGreaterThan(0);
    });

    it('displays rejected status', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('displays policy ID', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText('456')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => btn.textContent?.includes('Confirm'));
      expect(confirmButton).toBeDefined();
      
      if (confirmButton) {
        await user.click(confirmButton);
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      }
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.includes('Cancel'));
      expect(cancelButton).toBeDefined();
      
      if (cancelButton) {
        await user.click(cancelButton);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      }
    });

    it('disables buttons when submitting', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(btn => btn.textContent?.includes('Submitting'));
      const cancelButton = buttons.find(btn => btn.textContent?.includes('Cancel'));

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('shows submitting text when submitting', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/submitting\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA description', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'appeal-description');
    });

    it('has proper ARIA label on confirm button', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByLabelText(/confirm and submit appeal/i)).toBeInTheDocument();
    });
  });

  describe('Warning Display', () => {
    it('displays wallet signing warning', () => {
      render(
        <AppealConfirmModal
          open={true}
          claim={mockClaim}
          submitting={false}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByText(/sign a transaction with your wallet/i)).toBeInTheDocument();
    });
  });
});
