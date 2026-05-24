"use client"

import { ShelbyClient } from "@shelby-protocol/sdk/browser"
import { APTOS_NETWORK, SHELBY_API_KEY, SHELBYNET } from "./constants"

export type { BlobMetadata as ShelbyBlobMetadata } from "@shelby-protocol/sdk/browser"

let _client: ShelbyClient | null = null

/**
 * Singleton ShelbyClient for the browser. SDK ≥0.3.1 ships with the correct
 * deployer address baked in, so we no longer override it.
 *
 * We still pin `rpc.baseUrl` because we use the same host for direct blob
 * downloads via `getBlobUrl()` and want a single source of truth.
 *
 * We do NOT override `indexer.baseUrl`: the SDK's default points at the
 * blob indexer (the one with `blobs` / `blob_activities` queries); the
 * `api.shelbynet.shelby.xyz/v1/graphql` endpoint is the Aptos full-node
 * indexer, which doesn't have those fields.
 */
export const getShelbyClient = (): ShelbyClient => {
	if (!_client) {
		_client = new ShelbyClient({
			network: APTOS_NETWORK,
			apiKey: SHELBY_API_KEY,
			rpc: { baseUrl: SHELBYNET.rpcUrl, apiKey: SHELBY_API_KEY },
		})
	}
	return _client
}
