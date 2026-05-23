import { AccountAddress } from "@aptos-labs/ts-sdk"
import type { BlobMetadata } from "@shelby-protocol/sdk/browser"
import type { ShelbyBlobMetadata } from "@/lib/shelby"

export type { BlobMetadata }

export interface DriveBlob extends ShelbyBlobMetadata {
	downloadUrl: string
	explorerUrl: string
	isExpired: boolean
}

export type ViewMode = "grid" | "list"

export interface UploadedFile {
	file: File
	name: string
	size: number
	type: string
}

/**
 * Render a `Uint8Array` (the on-chain merkle root) as a 0x-prefixed hex string.
 */
export const merkleRootToHex = (root: Uint8Array | string): string => {
	if (typeof root === "string") {
		return root.startsWith("0x") ? root : `0x${root}`
	}
	let hex = "0x"
	for (const byte of root) {
		hex += byte.toString(16).padStart(2, "0")
	}
	return hex
}

/**
 * Wallet adapter exposes account addresses as strings or `AccountAddress`
 * instances depending on version. Normalise to a string with a leading `0x`.
 */
export const addressToString = (
	address: AccountAddress | string | { toString(): string },
): string => {
	if (typeof address === "string") return address
	if (address instanceof AccountAddress) return address.toString()
	return address.toString()
}
