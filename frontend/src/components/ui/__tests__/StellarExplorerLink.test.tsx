/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import React from 'react'

import { stellarExpertUrl } from '@/features/wallet/utils/stellarExpert'
import { StellarExplorerLink } from '../StellarExplorerLink'

// Mock getConfig so the component doesn't need real env vars
jest.mock('@/config/env', () => ({
  getConfig: () => ({ network: 'testnet' }),
}))

describe('stellarExpertUrl', () => {
  it.each([
    ['tx', 'ABC123', 'testnet', 'https://stellar.expert/explorer/testnet/tx/ABC123'],
    ['account', 'GABC', 'testnet', 'https://stellar.expert/explorer/testnet/account/GABC'],
    ['contract', 'CABC', 'testnet', 'https://stellar.expert/explorer/testnet/contract/CABC'],
    ['tx', 'ABC123', 'mainnet', 'https://stellar.expert/explorer/public/tx/ABC123'],
    ['account', 'GABC', 'mainnet', 'https://stellar.expert/explorer/public/account/GABC'],
    ['contract', 'CABC', 'mainnet', 'https://stellar.expert/explorer/public/contract/CABC'],
    ['tx', 'ABC123', 'futurenet', 'https://stellar.expert/explorer/futurenet/tx/ABC123'],
  ] as const)('type=%s network=%s → %s', (type, value, network, expected) => {
    expect(stellarExpertUrl(type, value, network)).toBe(expected)
  })
})

describe('StellarExplorerLink', () => {
  it('renders a link with correct href for tx type', () => {
    render(<StellarExplorerLink type="tx" value="TXHASH123456789" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://stellar.expert/explorer/testnet/tx/TXHASH123456789')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders custom label', () => {
    render(<StellarExplorerLink type="account" value="GABC" label="View Account" />)
    expect(screen.getByText('View Account')).toBeInTheDocument()
  })

  it('truncates value as default label', () => {
    render(<StellarExplorerLink type="contract" value="CABCDEFGHIJKLMNOP" />)
    expect(screen.getByText('CABCDEFG…MNOP')).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<StellarExplorerLink type="tx" value="TXABC" />)
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'View tx TXABC on Stellar Expert')
  })
})
