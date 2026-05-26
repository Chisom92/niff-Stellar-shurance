'use client'

import { ExternalLink } from 'lucide-react'

import { getConfig } from '@/config/env'
import { stellarExpertUrl, type StellarExplorerType } from '@/features/wallet/utils/stellarExpert'
import { cn } from '@/lib/utils'

export interface StellarExplorerLinkProps {
  type: StellarExplorerType
  value: string
  /** Display text; defaults to a truncated `value`. */
  label?: string
  className?: string
}

/**
 * Wraps any Stellar identifier with the correct Stellar Expert explorer URL.
 * Network is derived from app config (NEXT_PUBLIC_NETWORK).
 */
export function StellarExplorerLink({ type, value, label, className }: StellarExplorerLinkProps) {
  const { network } = getConfig()
  const href = stellarExpertUrl(type, value, network)
  const displayLabel = label ?? `${value.slice(0, 8)}…${value.slice(-4)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-flex items-center gap-1 text-sm underline-offset-2 hover:underline', className)}
      aria-label={`View ${type} ${value} on Stellar Expert`}
    >
      {displayLabel}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  )
}
