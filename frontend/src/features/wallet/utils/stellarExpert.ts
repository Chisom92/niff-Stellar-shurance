import type { AppNetwork } from '@/config/networkManifest'

const STELLAR_EXPERT_NETWORKS: Record<AppNetwork, string> = {
  mainnet: 'public',
  testnet: 'testnet',
  futurenet: 'futurenet',
}

function expertNet(network: AppNetwork): string {
  return STELLAR_EXPERT_NETWORKS[network] ?? 'testnet'
}

export type StellarExplorerType = 'tx' | 'account' | 'contract'

/**
 * Returns the Stellar Expert URL for a given identifier, type, and network.
 */
export function stellarExpertUrl(
  type: StellarExplorerType,
  value: string,
  network: AppNetwork,
): string {
  const net = expertNet(network)
  const path = type === 'contract' ? 'contract' : type === 'account' ? 'account' : 'tx'
  return `https://stellar.expert/explorer/${net}/${path}/${value}`
}

/**
 * Returns the Stellar Expert URL for a given account address and network.
 * https://stellar.expert/explorer/<network>/account/<address>
 */
export function stellarExpertAccountUrl(address: string, network: AppNetwork): string {
  return stellarExpertUrl('account', address, network)
}
