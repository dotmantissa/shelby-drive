"use client"

import { AccountAddress } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useAccountBlobs, useShelbyClient } from "@shelby-protocol/react"
import { type FullObjectMetadata, Order_By } from "@shelby-protocol/sdk/browser"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { BLOBS_PAGE_SIZE } from "@/lib/constants"
import { addressToString } from "@/types/shelby"

export interface UseBlobsResult {
	blobs: FullObjectMetadata[]
	isLoading: boolean
	error: string | null
	refetch: () => Promise<void>
	totalSize: number
	totalFiles: number
	pageCount: number
}

export const useBlobs = (page: number): UseBlobsResult => {
	const { account } = useWallet()
	const client = useShelbyClient()
	const addressStr = account?.address
		? addressToString(account.address)
		: null
	const accountAddr = useMemo(
		() => (addressStr ? AccountAddress.from(addressStr) : null),
		[addressStr],
	)
	const ownerWhere = useMemo(
		() =>
			accountAddr
				? {
						owner: { _eq: accountAddr.toString() },
						is_deleted: { _eq: "0" },
						expires_at: { _gt: String(Date.now() * 1000) },
					}
				: undefined,
		[accountAddr],
	)

	const listQuery = useAccountBlobs({
		account: accountAddr ?? AccountAddress.ONE,
		enabled: Boolean(accountAddr),
		pagination: {
			limit: BLOBS_PAGE_SIZE,
			offset: page * BLOBS_PAGE_SIZE,
		},
		orderBy: { created_at: Order_By.Desc },
		where: ownerWhere,
	})

	const statsQuery = useQuery({
		queryKey: ["account-blob-stats", addressStr],
		enabled: Boolean(ownerWhere),
		queryFn: async () => {
			const [totalFiles, totalSize] = await Promise.all([
				client.coordination.getBlobsCount({ where: ownerWhere }),
				client.coordination.getTotalBlobsSize({ where: ownerWhere }),
			])
			return { totalFiles, totalSize }
		},
	})

	const refetch = async () => {
		await Promise.all([listQuery.refetch(), statsQuery.refetch()])
	}

	const totalFiles = statsQuery.data?.totalFiles ?? 0
	return {
		blobs: listQuery.data ?? [],
		isLoading: listQuery.isLoading || statsQuery.isLoading,
		error: listQuery.error?.message ?? statsQuery.error?.message ?? null,
		refetch,
		totalSize: statsQuery.data?.totalSize ?? 0,
		totalFiles,
		pageCount: Math.max(1, Math.ceil(totalFiles / BLOBS_PAGE_SIZE)),
	}
}
