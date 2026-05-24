import { Network } from "@aptos-labs/ts-sdk"

const SHELBY_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY ?? ""
const APTOS_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY ?? ""

/**
 * In SDK 0.0.9 only `Network.SHELBYNET` resolves to a working RPC URL.
 * The Aptos wallet adapter also accepts this network value.
 */
export const APTOS_NETWORK = Network.SHELBYNET
export const SHELBY_API_KEY = SHELBY_KEY
export const APTOS_API_KEY = APTOS_KEY

/**
 * Base host for the Shelby RPC. The SDK's
 * `NetworkToShelbyRPCBaseUrl.shelbynet = "https://api.shelbynet.shelby.xyz/shelby"`,
 * so we use the host as the base and append `/shelby/v1/blobs/...` for
 * direct downloads.
 */
export const SHELBY_RPC_URL =
	process.env.NEXT_PUBLIC_SHELBY_RPC_URL ??
	"https://api.shelbynet.shelby.xyz"

export const SHELBY_EXPLORER_URL =
	process.env.NEXT_PUBLIC_SHELBY_EXPLORER_URL ??
	"https://explorer.shelby.xyz/shelbynet"

/** Canonical Shelbynet endpoints — all live under api.shelbynet.shelby.xyz. */
export const SHELBYNET = {
	chainId: 113,
	name: "Shelbynet",
	fullnodeUrl: "https://api.shelbynet.shelby.xyz/v1",
	indexerUrl: "https://api.shelbynet.shelby.xyz/v1/graphql",
	rpcUrl: "https://api.shelbynet.shelby.xyz/shelby",
	faucetUrl: "https://faucet.shelbynet.shelby.xyz",
} as const

/**
 * Address that deploys the Shelby Move contract (blob_metadata,
 * global_metadata, etc.). SDK 0.0.9 hardcodes the OLD deployer
 * (0xc63d6a5e…) which has no modules on the current Shelbynet — the team
 * redeployed at this new address (taken from SDK 0.3.1). Override the
 * deployer everywhere the SDK accepts one.
 */
export const SHELBY_DEPLOYER_ADDRESS =
	"0x85fdb9a176ab8ef1d9d9c1b60d60b3924f0800ac1de1cc2085fb0b8bb4988e6a"

/**
 * Chain ID is the most reliable signal that a wallet is on Shelbynet —
 * the `name` field varies across wallets (Petra may say "Shelbynet",
 * other wallets may say "Custom" or report the SDK's enum string).
 */
export const isShelbynet = (network: {
	name?: string | null
	chainId?: string | number | null
} | null | undefined): boolean => {
	if (!network) return false
	if (String(network.chainId ?? "") === String(SHELBYNET.chainId)) return true
	const name = network.name?.toString().toLowerCase()
	return name === "shelbynet"
}

export const APTOS_EXPLORER_BASE = "https://explorer.aptoslabs.com/txn"

/** Default blob lifetime: 30 days, expressed in microseconds since epoch. */
export const BLOB_EXPIRATION_MICROS = (): number =>
	(Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000

/** Canonical Shelby blob URL: `{rpc}/shelby/v1/blobs/{account}/{blobName}` */
export const getBlobUrl = (address: string, blobName: string): string =>
	`${SHELBY_RPC_URL}/shelby/v1/blobs/${address}/${encodeURIComponent(blobName)}`

export const getAptosExplorerTxUrl = (hash: string): string =>
	`${APTOS_EXPLORER_BASE}/${hash}?network=shelbynet`

export const getShelbyExplorerAccountUrl = (address: string): string =>
	`${SHELBY_EXPLORER_URL}/account/${address}`

export const DISCORD_URL = "https://discord.gg/shelby"
export const SHELBY_DOCS_URL = "https://docs.shelby.xyz"
export const SHELBY_GITHUB_URL = "https://github.com/shelby-protocol"

export const APP_NAME = "Shelby | DRIVE"
export const APP_TAGLINE = "Your Files. Decentralized."
export const APP_DESCRIPTION =
	"Store, access, and own your data on the Shelby Protocol — cloud-grade speed, Web3-native control."

export const isShelbyConfigured = (): boolean => SHELBY_KEY.length > 0
