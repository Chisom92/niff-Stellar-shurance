'use client'

import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getConfig } from '@/config/env'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  label: string
  href: string
  type: 'policy' | 'claim'
}

async function searchPolicies(query: string, apiUrl: string): Promise<SearchResult[]> {
  const res = await fetch(`${apiUrl}/api/policies?search=${encodeURIComponent(query)}&limit=5`)
  if (!res.ok) return []
  const data: Array<{ id: string | number; description?: string }> = await res.json().catch(() => [])
  return data.map((p) => ({
    id: String(p.id),
    label: p.description ? `${p.id} — ${p.description}` : `Policy ${p.id}`,
    href: `/policies/${p.id}`,
    type: 'policy' as const,
  }))
}

async function searchClaims(query: string, apiUrl: string): Promise<SearchResult[]> {
  const res = await fetch(`${apiUrl}/api/claims?search=${encodeURIComponent(query)}&limit=5`)
  if (!res.ok) return []
  const data: Array<{ id: string | number; description?: string }> = await res.json().catch(() => [])
  return data.map((c) => ({
    id: String(c.id),
    label: c.description ? `${c.id} — ${c.description}` : `Claim ${c.id}`,
    href: `/claims/${c.id}`,
    type: 'claim' as const,
  }))
}

export function GlobalSearchBar({ className }: { className?: string }) {
  const router = useRouter()
  const { apiUrl } = getConfig()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResults([]); setOpen(false); return }
      setLoading(true)
      try {
        const [policies, claims] = await Promise.all([
          searchPolicies(q, apiUrl),
          searchClaims(q, apiUrl),
        ])
        setResults([...policies, ...claims])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [apiUrl],
  )

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => runSearch(query), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, runSearch])

  const select = useCallback(
    (result: SearchResult) => {
      setOpen(false)
      setQuery('')
      router.push(result.href)
    },
    [router],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); select(results[activeIdx]) }
    else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1) }
  }

  const policies = results.filter((r) => r.type === 'policy')
  const claims = results.filter((r) => r.type === 'claim')

  return (
    <div className={cn('relative', className)} role="search">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="global-search-listbox"
          aria-activedescendant={activeIdx >= 0 ? `search-result-${activeIdx}` : undefined}
          placeholder="Search policies & claims…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1) }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => { if (results.length) setOpen(true) }}
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }}
            className="absolute right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <ul
          id="global-search-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-muted-foreground" role="status">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">No results found.</li>
          )}
          {!loading && policies.length > 0 && (
            <Group label="Policies" results={policies} offset={0} activeIdx={activeIdx} onSelect={select} />
          )}
          {!loading && claims.length > 0 && (
            <Group label="Claims" results={claims} offset={policies.length} activeIdx={activeIdx} onSelect={select} />
          )}
        </ul>
      )}
    </div>
  )
}

function Group({
  label,
  results,
  offset,
  activeIdx,
  onSelect,
}: {
  label: string
  results: SearchResult[]
  offset: number
  activeIdx: number
  onSelect: (r: SearchResult) => void
}) {
  return (
    <>
      <li role="presentation" className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </li>
      {results.map((r, i) => {
        const idx = offset + i
        return (
          <li
            key={r.id}
            id={`search-result-${idx}`}
            role="option"
            aria-selected={activeIdx === idx}
            onMouseDown={() => onSelect(r)}
            className={cn(
              'cursor-pointer px-3 py-2 text-sm',
              activeIdx === idx ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {r.label}
          </li>
        )
      })}
    </>
  )
}
