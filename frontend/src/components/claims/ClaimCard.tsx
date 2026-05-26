'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge, type InsuranceStatus } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'

export interface ClaimCardProps {
  claimId: string | number
  policyId: string | number
  status: InsuranceStatus
  /** Quorum progress as a percentage 0–100. */
  quorumPct: number
  /** Target ledger for the voting deadline. */
  deadlineLedger: number
  /** Current ledger (used to compute countdown). */
  currentLedger?: number
  /** Fraud score 0–100; badge shown only when provided. */
  fraudScore?: number
  className?: string
}

const FRAUD_HIGH_THRESHOLD = 70

function FraudBadge({ score }: { score: number }) {
  const isHigh = score >= FRAUD_HIGH_THRESHOLD
  return (
    <Badge
      variant={isHigh ? 'destructive' : 'warning'}
      aria-label={`Fraud score: ${score}${isHigh ? ' — high risk' : ''}`}
    >
      Fraud {score}%{isHigh ? ' ⚠' : ''}
    </Badge>
  )
}

function DeadlineCountdown({ deadlineLedger, currentLedger }: { deadlineLedger: number; currentLedger: number }) {
  const remaining = deadlineLedger - currentLedger
  if (remaining <= 0) return <span className="text-xs text-muted-foreground">Deadline passed</span>
  // ~5 s per ledger
  const seconds = remaining * 5
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0 || days > 0) parts.push(`${hours}h`)
  parts.push(`${minutes}m`)
  return (
    <span className="text-xs tabular-nums text-muted-foreground" title={`Deadline ledger: ${deadlineLedger}`}>
      ~{parts.join(' ')} left
    </span>
  )
}

export function ClaimCard({
  claimId,
  policyId,
  status,
  quorumPct,
  deadlineLedger,
  currentLedger = 0,
  fraudScore,
  className,
}: ClaimCardProps) {
  const clamped = Math.min(100, Math.max(0, quorumPct))

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Claim</p>
            <p className="font-semibold leading-tight">#{claimId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={status} />
            {fraudScore !== undefined && <FraudBadge score={fraudScore} />}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Policy #{policyId}</p>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-2">
        {/* Quorum progress */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Quorum</span>
            <span className="tabular-nums font-medium">{clamped}%</span>
          </div>
          <Progress
            value={clamped}
            aria-label={`Quorum progress: ${clamped}%`}
            className={clamped >= 100 ? '[&>div]:bg-green-500' : undefined}
          />
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Deadline</span>
          <DeadlineCountdown deadlineLedger={deadlineLedger} currentLedger={currentLedger} />
        </div>
      </CardContent>
    </Card>
  )
}
