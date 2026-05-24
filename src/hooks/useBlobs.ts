"use client"

import { AccountAddress } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useAccountBlobs } from "@shelby-protocol/react"
import type { BlobMetadata } from "@shelby-protocol/sdk/browser"
import { useMemo } from "react"
import { addressToString } from "@/types/shelby"

export interface UseBlobsResult {
	blobs: BlobMetadata[]
	isLoading: boolean
	error: string | null
	refetch: () => void
	totalSize: number
}

/**
 * Thin adapter over `useAccountBlobs` that
 *   - reads the address from the wallet adapter,
 *   - filters out expired and deleted blobs,
 *   - precomputes the total stored bytes for the quota banner.
 */
export const useBlobs = (): UseBlobsResult => {
	const { account } = useWallet()
	const addressStr = account?.address
		? addressToString(account.address)
		: null
	const accountAddr = useMemo(
		() => (addressStr ? AccountAddress.from(addressStr) : null),
		[addressStr],
	)

	const { data, isLoading, error, refetch } = useAccountBlobs({
		account: accountAddr ?? AccountAddress.ONE,
		enabled: Boolean(accountAddr),
	})

	const active = useMemo(() => {
		if (!data) return []
		const nowMs = Date.now()
		return data.filter(
			(b) => !b.isDeleted && b.expirationMicros / 1000 > nowMs,
		)
	}, [data])

	const totalSize = useMemo(
		() => active.reduce((acc, b) => acc + (b.size ?? 0), 0),
		[active],
	)

	return {
		blobs: active,
		isLoading,
		error: error ? error.message : null,
		refetch,
		totalSize,
	}
}
