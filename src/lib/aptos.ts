import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk"
import { APTOS_API_KEY, APTOS_NETWORK, SHELBYNET } from "./constants"

export const aptosClient = new Aptos(
	new AptosConfig({
		network: APTOS_NETWORK,
		fullnode: SHELBYNET.fullnodeUrl,
		indexer: SHELBYNET.indexerUrl,
		clientConfig: APTOS_API_KEY
			? { API_KEY: APTOS_API_KEY }
			: undefined,
	}),
)
