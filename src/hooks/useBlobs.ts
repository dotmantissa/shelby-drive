"use client"

import { AccountAddress } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useCallback, useEffect, useState } from "react"
import { getShelbyClient, type ShelbyBlobMetadata } from "@/lib/shelby"
import { addressToString } from "@/types/shelby"

export interface UseBlobsResult {
	blobs: ShelbyBlobMetadata[]
	isLoading: boolean
	error: string | null
	refetch: () => void
	totalSize: number
}

export const useBlobs = (): UseBlobsResult => {
	const { account } = useWallet()
	const [blobs, setBlobs] = useState<ShelbyBlobMetadata[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchBlobs = useCallback(async () => {
		if (!account?.address) return
		setIsLoading(true)
		setError(null)
		try {
			const client = getShelbyClient()
			const addressStr = addressToString(account.address)
			const result = await client.coordination.getAccountBlobs({
				account: AccountAddress.from(addressStr),
			})
			const nowMs = Date.now()
			const active = result.filter(
				(b) => b.expirationMicros / 1000 > nowMs,
			)
			setBlobs(active)
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Failed to load files")
		} finally {
			setIsLoading(false)
		}
	}, [account?.address])

	useEffect(() => {
		fetchBlobs()
	}, [fetchBlobs])

	const totalSize = blobs.reduce((acc, b) => acc + (b.size ?? 0), 0)

	return { blobs, isLoading, error, refetch: fetchBlobs, totalSize }
}
