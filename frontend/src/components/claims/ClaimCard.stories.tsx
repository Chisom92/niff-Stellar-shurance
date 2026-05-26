import type { Meta, StoryObj } from '@storybook/react'

import { ClaimCard } from './ClaimCard'

const meta: Meta<typeof ClaimCard> = {
  title: 'Claims/ClaimCard',
  component: ClaimCard,
  tags: ['autodocs'],
  args: {
    claimId: 42,
    policyId: 7,
    currentLedger: 1000,
    deadlineLedger: 2000,
    quorumPct: 60,
    status: 'pending',
  },
}
export default meta
type Story = StoryObj<typeof ClaimCard>

export const Pending: Story = { args: { status: 'pending', quorumPct: 40 } }
export const UnderReview: Story = { args: { status: 'under_review', quorumPct: 75 } }
export const Approved: Story = { args: { status: 'approved', quorumPct: 100 } }
export const Rejected: Story = { args: { status: 'rejected', quorumPct: 100 } }
export const Expired: Story = { args: { status: 'expired', quorumPct: 30, deadlineLedger: 500 } }

export const HighFraudScore: Story = {
  args: { status: 'under_review', quorumPct: 50, fraudScore: 85 },
}
export const LowFraudScore: Story = {
  args: { status: 'pending', quorumPct: 20, fraudScore: 30 },
}
export const NoFraudScore: Story = {
  args: { status: 'pending', quorumPct: 20 },
}
export const DeadlinePassed: Story = {
  args: { status: 'pending', quorumPct: 55, deadlineLedger: 500, currentLedger: 1000 },
}
export const QuorumReached: Story = {
  args: { status: 'approved', quorumPct: 100 },
}
