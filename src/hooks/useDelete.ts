"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useDeleteObjects } from "@shelby-protocol/react"
import { useCallback, useState } from "react"

export const useDelete = (opts?: {
	onSuccess?: () => void | Promise<void>
	onError?: (message: string) => void
}) => {
	const wallet = useWallet()
	const [deleting, setDeleting] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	const { mutateAsync: deleteObjects } = useDeleteObjects({})

	const remove = useCallback(
		async (blobNameSuffix: string) => {
			if (!wallet.account) {
				const message =
					"Connect the owning wallet before deleting a file."
				setError(message)
				opts?.onError?.(message)
				return
			}
			setDeleting(blobNameSuffix)
			setError(null)
			try {
				await deleteObjects({
					signer: wallet,
					blobNames: [blobNameSuffix],
				})
				await opts?.onSuccess?.()
			} catch (err: unknown) {
				const msg =
					err instanceof Error ? err.message : String(err ?? "")
				if (
					msg.includes("4001") ||
					/user rejected|user denied/i.test(msg)
				) {
					setError("Transaction cancelled")
					opts?.onError?.("Transaction cancelled")
				} else {
					const message = msg || "Delete failed"
					setError(message)
					opts?.onError?.(message)
				}
			} finally {
				setDeleting(null)
			}
		},
		[deleteObjects, wallet, opts],
	)

	return { remove, deleting, error }
}
