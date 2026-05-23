"use client"

import { ShelbyClient } from "@shelby-protocol/sdk/browser"
import { APTOS_NETWORK, SHELBY_API_KEY } from "./constants"

/**
 * Re-export the SDK's BlobMetadata so consumers don't have to import from the
 * SDK directly. The shape matches `BlobMetadata` from
 * `@shelby-protocol/sdk/browser`.
 */
export type { BlobMetadata as ShelbyBlobMetadata } from "@shelby-protocol/sdk/browser"

let _client: ShelbyClient | null = null

/**
 * Lazily constructs the Shelby browser client. The constructor itself is
 * cheap — what's expensive is the WASM-backed erasure coding provider that
 * gets created on first upload (see useUpload).
 */
export const getShelbyClient = (): ShelbyClient => {
	if (!_client) {
		_client = new ShelbyClient({
			network: APTOS_NETWORK,
			apiKey: SHELBY_API_KEY,
		})
	}
	return _client
}
