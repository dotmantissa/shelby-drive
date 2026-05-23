"use client"

import { ShelbyClient } from "@shelby-protocol/sdk/browser"
import { APTOS_NETWORK, SHELBY_API_KEY, SHELBYNET } from "./constants"

export type { BlobMetadata as ShelbyBlobMetadata } from "@shelby-protocol/sdk/browser"

let _client: ShelbyClient | null = null

/**
 * Lazily constructs the Shelby browser client. Overrides the SDK's default
 * indexer URL (the older `api.shelbynet.aptoslabs.com/nocode/...` endpoint)
 * with Shelby's new self-hosted indexer at
 * `api.shelbynet.shelby.xyz/v1/graphql`.
 */
export const getShelbyClient = (): ShelbyClient => {
	if (!_client) {
		_client = new ShelbyClient({
			network: APTOS_NETWORK,
			apiKey: SHELBY_API_KEY,
			rpc: { baseUrl: SHELBYNET.rpcUrl, apiKey: SHELBY_API_KEY },
			indexer: { baseUrl: SHELBYNET.indexerUrl, apiKey: SHELBY_API_KEY },
		})
	}
	return _client
}
