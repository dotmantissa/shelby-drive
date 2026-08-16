import type { Network } from "@aptos-labs/ts-sdk"

const SHELBY_KEY = process.env.NEXT_PUBLIC_SHELBY_API_KEY ?? ""
const APTOS_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY ?? ""

/** Canonical Shelbynet endpoints. The live chain moved from ID 113 to 118. */
export const SHELBYNET = {
	chainId: Number(process.env.NEXT_PUBLIC_SHELBY_CHAIN_ID ?? 118),
	name: "Shelbynet",
	fullnodeUrl: "https://api.shelbynet.shelby.xyz/v1",
	indexerUrl: "https://api.shelbynet.shelby.xyz/v1/graphql",
	rpcUrl: "https://api.shelbynet.shelby.xyz/shelby",
	faucetUrl: "https://faucet.shelbynet.shelby.xyz",
} as const

export const APTOS_NETWORK = "shelbynet" as Network.SHELBYNET
export const SHELBY_API_KEY = SHELBY_KEY
export const APTOS_API_KEY = APTOS_KEY

const configuredRpc = process.env.NEXT_PUBLIC_SHELBY_RPC_URL?.replace(
	/\/+$/,
	"",
)
export const SHELBY_RPC_URL = configuredRpc
	? configuredRpc.endsWith("/shelby")
		? configuredRpc
		: `${configuredRpc}/shelby`
	: SHELBYNET.rpcUrl

export const SHELBY_EXPLORER_URL =
	process.env.NEXT_PUBLIC_SHELBY_EXPLORER_URL ??
	"https://explorer.shelby.xyz/shelbynet"

/** Hard limits enforced client-side before the upload mutation runs. */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB per file
export const MAX_TOTAL_STORAGE_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB total
export const BLOBS_PAGE_SIZE = 24

/**
 * Chain ID is the most reliable signal that a wallet is on Shelbynet.
 * The `name` field varies across wallets (Petra may say "Shelbynet",
 * other wallets may say "Custom" or report the SDK's enum string).
 */
export const isShelbynet = (
	network:
		| {
				name?: string | null
				chainId?: string | number | null
		  }
		| null
		| undefined,
	expectedChainId = SHELBYNET.chainId,
): boolean => {
	if (!network) return false
	if (network.chainId !== null && network.chainId !== undefined) {
		return String(network.chainId) === String(expectedChainId)
	}
	const name = network.name?.toString().toLowerCase()
	return name === "shelbynet"
}

/** Default blob lifetime: 30 days, expressed in microseconds since epoch. */
export const BLOB_EXPIRATION_MICROS = (): number =>
	(Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000

export const getShelbyExplorerAccountUrl = (address: string): string =>
	`${SHELBY_EXPLORER_URL}/account/${address}`

export const getShelbyFaucetUrl = (address: string): string =>
	`${SHELBYNET.faucetUrl}?address=${encodeURIComponent(address)}`

export const SHELBY_DOCS_URL = "https://docs.shelby.xyz"
export const SHELBY_GITHUB_URL = "https://github.com/shelby-protocol"

export const APP_NAME = "Shelby | DRIVE"
export const APP_TAGLINE = "Shelby Drive"
export const APP_DESCRIPTION =
	"Files are stored as SDBLOB01 AES-256-GCM ciphertext. The owning wallet derives the key used for downloads and previews."

export const isShelbyConfigured = (): boolean => SHELBY_KEY.length > 0
