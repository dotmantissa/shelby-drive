"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useDeleteBlobs } from "@shelby-protocol/react"
import { useCallback, useState } from "react"

export const useDelete = (opts?: { onSuccess?: () => void }) => {
	const wallet = useWallet()
	const [deleting, setDeleting] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const { mutateAsync: deleteBlobs } = useDeleteBlobs({})

	const remove = useCallback(
		async (blobNameSuffix: string) => {
			if (!wallet.account) return
			setDeleting(blobNameSuffix)
			setError(null)
			try {
				await deleteBlobs({
					signer: wallet,
					blobNames: [blobNameSuffix],
				})
				opts?.onSuccess?.()
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : String(err ?? "")
				if (
					msg.includes("4001") ||
					/user rejected|user denied/i.test(msg)
				) {
					setError("Transaction cancelled")
				} else {
					setError(msg || "Delete failed")
				}
			} finally {
				setDeleting(null)
			}
		},
		[deleteBlobs, wallet, opts],
	)

	return { remove, deleting, error }
}
