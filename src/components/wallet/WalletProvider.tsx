"use client"

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"
import type { PropsWithChildren } from "react"
import { APTOS_API_KEY, APTOS_NETWORK } from "@/lib/constants"

export function WalletProvider({ children }: PropsWithChildren) {
	return (
		<AptosWalletAdapterProvider
			autoConnect={false}
			dappConfig={{
				network: APTOS_NETWORK,
				aptosApiKeys: APTOS_API_KEY
					? { shelbynet: APTOS_API_KEY }
					: undefined,
			}}
			onError={(error) => {
				if (process.env.NODE_ENV !== "production") {
					console.error("Wallet error:", error)
				}
			}}
		>
			{children}
		</AptosWalletAdapterProvider>
	)
}
