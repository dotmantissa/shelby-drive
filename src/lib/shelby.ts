"use client"

import { ShelbyClient } from "@shelby-protocol/sdk/browser"
import { APTOS_NETWORK, SHELBY_API_KEY, SHELBYNET } from "./constants"

export type { BlobMetadata as ShelbyBlobMetadata } from "@shelby-protocol/sdk/browser"

let _client: ShelbyClient | null = null

/**
 * Lazily constructs the Shelby browser client.
 *
 * Override the RPC base URL because the SDK's default for SHELBYNET assumes
 * that's where putBlob/getBlob live. We do NOT override the blob indexer:
 * the SDK's default (api.shelbynet.aptoslabs.com/nocode/...) is the only
 * endpoint that exposes the `blobs` GraphQL field — the indexer at
 * api.shelbynet.shelby.xyz/v1/graphql is the Aptos full-node indexer
 * (account_transactions, current_aptos_names, etc.), not the blob indexer.
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
