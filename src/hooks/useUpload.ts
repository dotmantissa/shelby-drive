"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useUploadBlobs } from "@shelby-protocol/react"
import { useCallback, useState } from "react"
import {
	BLOB_EXPIRATION_MICROS,
	MAX_FILE_SIZE_BYTES,
	MAX_TOTAL_STORAGE_BYTES,
	isShelbynet,
} from "@/lib/constants"
import { formatBytes } from "@/lib/utils"

export type UploadStep = "idle" | "uploading" | "success" | "error"

export interface UploadState {
	step: UploadStep
	error: string | null
	fileName: string | null
	fileSize: number | null
}

const initialState: UploadState = {
	step: "idle",
	error: null,
	fileName: null,
	fileSize: null,
}

const isUserRejection = (err: unknown): boolean => {
	const msg = err instanceof Error ? err.message : String(err ?? "")
	return (
		msg.includes("4001") ||
		/user rejected/i.test(msg) ||
		/user denied/i.test(msg) ||
		/rejected by user/i.test(msg)
	)
}

/**
 * Translate raw SDK / wallet errors into messages a user can act on.
 */
const translateError = (err: unknown): string => {
	const msg = err instanceof Error ? err.message : String(err ?? "")
	const lower = msg.toLowerCase()
	if (
		lower.includes("function_not_found") ||
		lower.includes("module_not_found") ||
		lower.includes("simulation error") ||
		lower.includes("generic error")
	) {
		return "Transaction simulation failed. Most often this means your wallet is on the wrong network — switch to Shelbynet and try again."
	}
	if (lower.includes("eblob_write_chunkset_already_exists")) {
		return "A blob with this exact name already exists for your account. Rename the file before re-uploading."
	}
	if (lower.includes("insufficient_balance_for_transaction_fee")) {
		return "Not enough APT to pay for the transaction fee on Shelbynet."
	}
	if (lower.includes("e_insufficient_funds")) {
		return "Not enough ShelbyUSD to pay for blob storage."
	}
	if (lower.includes("429")) {
		return "Rate limit exceeded. The default API key is heavily throttled."
	}
	if (lower.includes("401") || lower.includes("unauthorized")) {
		return "Unauthorized. Shelby API key isn't accepted by Shelbynet."
	}
	return msg || "Upload failed"
}

/**
 * Wraps `useUploadBlobs` with our own local state machine + pre-flight
 * checks (network, per-file size, total quota).
 */
export const useUpload = (opts: {
	totalSizeBytes: number
	onSuccess?: () => void
}) => {
	const { totalSizeBytes, onSuccess } = opts
	const wallet = useWallet()
	const { account, network } = wallet
	const [state, setState] = useState<UploadState>(initialState)

	const { mutateAsync: uploadBlobs } = useUploadBlobs({})

	const upload = useCallback(
		async (file: File) => {
			if (!account) {
				setState({
					...initialState,
					step: "error",
					error: "Wallet not connected",
					fileName: file.name,
					fileSize: file.size,
				})
				return
			}

			if (network && !isShelbynet(network)) {
				setState({
					...initialState,
					step: "error",
					error: `Wallet is on ${network.name ?? "unknown network"}. Switch to Shelbynet and try again.`,
					fileName: file.name,
					fileSize: file.size,
				})
				return
			}

			if (file.size > MAX_FILE_SIZE_BYTES) {
				setState({
					...initialState,
					step: "error",
					error: `File is ${formatBytes(file.size)} — maximum upload is ${formatBytes(MAX_FILE_SIZE_BYTES)} per file.`,
					fileName: file.name,
					fileSize: file.size,
				})
				return
			}

			if (totalSizeBytes + file.size > MAX_TOTAL_STORAGE_BYTES) {
				const remaining = Math.max(
					0,
					MAX_TOTAL_STORAGE_BYTES - totalSizeBytes,
				)
				setState({
					...initialState,
					step: "error",
					error: `You've used ${formatBytes(totalSizeBytes)} of the ${formatBytes(MAX_TOTAL_STORAGE_BYTES)} quota — only ${formatBytes(remaining)} remaining. Delete some files first.`,
					fileName: file.name,
					fileSize: file.size,
				})
				return
			}

			setState({
				step: "uploading",
				error: null,
				fileName: file.name,
				fileSize: file.size,
			})

			try {
				const data = new Uint8Array(await file.arrayBuffer())
				await uploadBlobs({
					signer: wallet,
					blobs: [{ blobName: file.name, blobData: data }],
					expirationMicros: BLOB_EXPIRATION_MICROS(),
				})
				setState((s) => ({ ...s, step: "success" }))
				onSuccess?.()
			} catch (err: unknown) {
				const rejected = isUserRejection(err)
				setState((s) => ({
					...s,
					step: "error",
					error: rejected
						? "Transaction cancelled"
						: translateError(err),
				}))
			}
		},
		[account, network, totalSizeBytes, uploadBlobs, wallet, onSuccess],
	)

	const reset = useCallback(() => {
		setState(initialState)
	}, [])

	return { state, upload, reset }
}
