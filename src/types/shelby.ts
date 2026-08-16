import { AccountAddress } from "@aptos-labs/ts-sdk"
import type { FullObjectMetadata } from "@shelby-protocol/sdk/browser"

export type { FullObjectMetadata }

export type ViewMode = "grid" | "list"

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
