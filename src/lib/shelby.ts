"use client"

import {
	createDefaultErasureCodingProvider,
	type ErasureCodingProvider,
	ShelbyClient,
} from "@shelby-protocol/sdk/browser"
import {
	APTOS_NETWORK,
	SHELBY_API_KEY,
	SHELBY_RPC_URL,
	SHELBYNET,
} from "./constants"

export type { FullObjectMetadata as ShelbyBlobMetadata } from "@shelby-protocol/sdk/browser"

let _client: ShelbyClient | null = null
let _provider: Promise<ErasureCodingProvider> | null = null

/**
 * Singleton ShelbyClient for the browser. SDK ≥0.3.1 ships with the correct
 * deployer address baked in, so we no longer override it.
 *
 * We pin `rpc.baseUrl` to the environment-aware canonical endpoint used for
 * encrypted uploads and downloads.
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
			rpc: { baseUrl: SHELBY_RPC_URL, apiKey: SHELBY_API_KEY },
			aptos: {
				network: APTOS_NETWORK,
				fullnode: SHELBYNET.fullnodeUrl,
			},
		})
	}
	return _client
}

export const getErasureCodingProvider = (): Promise<ErasureCodingProvider> => {
	if (!_provider) {
		_provider = createDefaultErasureCodingProvider()
	}
	return _provider
}
