import { getConfig } from '@/config/env'
import {
  Claim,
  ClaimSchema,
  Eligibility,
  EligibilitySchema,
  VoteOption,
  VoteResponse,
  VoteResponseSchema,
} from '@/lib/schemas/vote'

const { apiUrl: API_BASE, explorerBase: EXPLORER_BASE } = getConfig()

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new VoteAPIError(err.code ?? 'REQUEST_FAILED', err.message ?? 'Request failed')
  }
  return res.json()
}

export class VoteAPIError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'VoteAPIError'
  }
}

export async function fetchClaim(claimId: string): Promise<Claim> {
  const res = await fetch(`${API_BASE}/api/claims/${claimId}`)
  const data = await handleResponse<unknown>(res)
  return ClaimSchema.parse(data)
}

export async function fetchEligibility(
  claimId: string,
  walletAddress: string,
): Promise<Eligibility> {
  const res = await fetch(
    `${API_BASE}/api/claims/${claimId}/eligibility?wallet=${encodeURIComponent(walletAddress)}`,
  )
  const data = await handleResponse<unknown>(res)
  return EligibilitySchema.parse(data)
}

/**
 * Simulate the vote transaction server-side before opening the wallet popup.
 * Returns null if simulation passes, or an error message string if it fails.
 */
export async function simulateVote(
  claimId: string,
  walletAddress: string,
  vote: VoteOption,
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/claims/${claimId}/vote/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, vote }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Simulation failed' }))
      return err.message ?? 'Transaction simulation failed'
    }
    return null
  } catch {
    return null // non-blocking: proceed to wallet if simulation endpoint unavailable
  }
}

export async function submitVote(
  claimId: string,
  walletAddress: string,
  vote: VoteOption,
  signedXdr: string,
): Promise<VoteResponse> {
  const res = await fetch(`${API_BASE}/api/claims/${claimId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, vote, signedXdr }),
  })
  const data = await handleResponse<unknown>(res)
  return VoteResponseSchema.parse(data)
}

export function explorerUrl(txHash: string): string {
  return `${EXPLORER_BASE}/${txHash}`
}

export const VOTE_ERROR_MESSAGES: Record<string, string> = {
  NOT_ELIGIBLE_VOTER: 'Your wallet is not in the eligible voter list for this claim.',
  DUPLICATE_VOTE: 'You have already cast a vote on this claim.',
  VOTING_WINDOW_CLOSED: 'The voting window for this claim has closed.',
  CLAIM_ALREADY_TERMINAL: 'This claim has already been resolved.',
  CLAIM_NOT_FOUND: 'Claim not found.',
  CLAIMS_PAUSED: 'Claim operations are currently paused by the contract admin.',
  REQUEST_FAILED: 'Request failed. Please try again.',
}

export function getVoteErrorMessage(error: VoteAPIError): string {
  return VOTE_ERROR_MESSAGES[error.code] ?? error.message
}

// ── Appeal API ──────────────────────────────────────────────────────────────

export interface AppealResponse {
  transactionHash: string;
  status: string;
  message: string;
}

/**
 * Check if an appeal has already been submitted for this claim.
 * Returns true if an appeal exists, false otherwise.
 */
export async function checkAppealStatus(claimId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/claims/${claimId}/appeal/status`)
    if (!res.ok) return false
    const data = await res.json()
    return data.appealSubmitted === true
  } catch {
    return false
  }
}

/**
 * Simulate the appeal transaction server-side before opening the wallet popup.
 * Returns null if simulation passes, or an error message string if it fails.
 */
export async function simulateAppeal(
  claimId: string,
  walletAddress: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/claims/${claimId}/appeal/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Simulation failed' }))
      return err.message ?? 'Appeal simulation failed'
    }
    return null
  } catch {
    return null // non-blocking: proceed to wallet if simulation endpoint unavailable
  }
}

/**
 * Submit an appeal for a rejected claim.
 * Opens a new voting window with elevated quorum requirements.
 */
export async function submitAppeal(
  claimId: string,
  walletAddress: string,
  signedXdr: string,
): Promise<AppealResponse> {
  const res = await fetch(`${API_BASE}/api/claims/${claimId}/appeal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, signedXdr }),
  })
  const data = await handleResponse<AppealResponse>(res)
  return data
}

export const APPEAL_ERROR_MESSAGES: Record<string, string> = {
  NOT_CLAIMANT: 'Only the claimant can appeal this claim.',
  CLAIM_NOT_REJECTED: 'Only rejected claims can be appealed.',
  APPEAL_ALREADY_SUBMITTED: 'An appeal has already been submitted for this claim.',
  APPEAL_WINDOW_CLOSED: 'The appeal window for this claim has closed.',
  CLAIM_NOT_FOUND: 'Claim not found.',
  CLAIMS_PAUSED: 'Claim operations are currently paused by the contract admin.',
  REQUEST_FAILED: 'Request failed. Please try again.',
}

export function getAppealErrorMessage(error: VoteAPIError): string {
  return APPEAL_ERROR_MESSAGES[error.code] ?? error.message
}
