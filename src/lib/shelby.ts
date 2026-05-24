"use client"

import { AccountAddress } from "@aptos-labs/ts-sdk"
import { ShelbyClient } from "@shelby-protocol/sdk/browser"
import {
	APTOS_NETWORK,
	SHELBY_API_KEY,
	SHELBY_DEPLOYER_ADDRESS,
	SHELBYNET,
} from "./constants"

export type { BlobMetadata as ShelbyBlobMetadata } from "@shelby-protocol/sdk/browser"

let _client: ShelbyClient | null = null

/**
 * Lazily constructs the Shelby browser client. Two overrides:
 *
 * 1. `rpc.baseUrl`: pin to the canonical Shelbynet RPC.
 * 2. `deployer`: SDK 0.0.9 hardcodes the OLD Shelby deployer that has no
 *    modules on the current Shelbynet — explicitly point at the new
 *    deployer so coordination (blob_metadata::*) calls find the module.
 *
 * Note: we do NOT override `indexer.baseUrl`. The SDK's default
 * (api.shelbynet.aptoslabs.com/nocode/...) is the only endpoint that
 * exposes the `blobs` / `blob_activities` GraphQL fields.
 */
export const getShelbyClient = (): ShelbyClient => {
	if (!_client) {
		_client = new ShelbyClient({
			network: APTOS_NETWORK,
			apiKey: SHELBY_API_KEY,
			deployer: AccountAddress.from(SHELBY_DEPLOYER_ADDRESS),
			rpc: { baseUrl: SHELBYNET.rpcUrl, apiKey: SHELBY_API_KEY },
		})
	}
	return _client
}
