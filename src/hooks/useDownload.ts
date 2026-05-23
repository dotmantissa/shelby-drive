"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useCallback, useState } from "react"
import { getBlobUrl } from "@/lib/constants"
import { addressToString } from "@/types/shelby"

export const useDownload = () => {
	const { account } = useWallet()
	const [downloading, setDownloading] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const download = useCallback(
		async (blobName: string) => {
			if (!account?.address) return
			setDownloading(blobName)
			setError(null)
			try {
				const url = getBlobUrl(
					addressToString(account.address),
					blobName,
				)
				const response = await fetch(url)
				if (!response.ok) {
					throw new Error(`Download failed: ${response.statusText}`)
				}
				const blob = await response.blob()
				const objectUrl = URL.createObjectURL(blob)
				const link = document.createElement("a")
				link.href = objectUrl
				link.download = blobName
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				URL.revokeObjectURL(objectUrl)
			} catch (err: unknown) {
				const message =
					err instanceof Error ? err.message : "Download failed"
				setError(message)
				console.error("Download error:", err)
			} finally {
				setDownloading(null)
			}
		},
		[account?.address],
	)

	return { download, downloading, error }
}
