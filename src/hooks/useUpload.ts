"use client"

import { AccountAddress } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import {
	createDefaultErasureCodingProvider,
	expectedTotalChunksets,
	generateCommitments,
	ShelbyBlobClient,
} from "@shelby-protocol/sdk/browser"
import { useCallback, useState } from "react"
import { aptosClient } from "@/lib/aptos"
import { BLOB_EXPIRATION_MICROS } from "@/lib/constants"
import { getShelbyClient } from "@/lib/shelby"
import { addressToString } from "@/types/shelby"

export type UploadStep =
	| "idle"
	| "encoding"
	| "registering"
	| "uploading"
	| "success"
	| "error"

export interface UploadState {
	step: UploadStep
	progress: number
	txHash: string | null
	blobMerkleRoot: string | null
	error: string | null
	fileName: string | null
	fileSize: number | null
}

const initialState: UploadState = {
	step: "idle",
	progress: 0,
	txHash: null,
	blobMerkleRoot: null,
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

export const useUpload = () => {
	const { account, signAndSubmitTransaction } = useWallet()
	const [state, setState] = useState<UploadState>(initialState)

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

			setState({
				step: "encoding",
				progress: 5,
				txHash: null,
				blobMerkleRoot: null,
				error: null,
				fileName: file.name,
				fileSize: file.size,
			})

			try {
				// ── STEP 1: ENCODE ─────────────────────────────────────
				const arrayBuffer = await file.arrayBuffer()
				const bytes = new Uint8Array(arrayBuffer)

				const provider = await createDefaultErasureCodingProvider()
				const commitments = await generateCommitments(provider, bytes)

				setState((s) => ({
					...s,
					progress: 25,
					blobMerkleRoot: commitments.blob_merkle_root,
				}))

				// ── STEP 2: REGISTER ON-CHAIN ──────────────────────────
				setState((s) => ({ ...s, step: "registering", progress: 35 }))

				const accountAddress = AccountAddress.from(
					addressToString(account.address),
				)

				const payload = ShelbyBlobClient.createRegisterBlobPayload({
					account: accountAddress,
					blobName: file.name,
					blobMerkleRoot: commitments.blob_merkle_root,
					numChunksets: expectedTotalChunksets(
						commitments.raw_data_size,
					),
					expirationMicros: BLOB_EXPIRATION_MICROS(),
					blobSize: commitments.raw_data_size,
				})

				const submitted = await signAndSubmitTransaction({
					data: payload,
				})

				setState((s) => ({ ...s, progress: 60, txHash: submitted.hash }))

				await aptosClient.waitForTransaction({
					transactionHash: submitted.hash,
				})
				setState((s) => ({ ...s, progress: 70 }))

				// ── STEP 3: UPLOAD TO SHELBY RPC ───────────────────────
				setState((s) => ({ ...s, step: "uploading", progress: 80 }))

				const shelbyClient = getShelbyClient()
				await shelbyClient.rpc.putBlob({
					account: accountAddress,
					blobName: file.name,
					blobData: bytes,
				})

				setState((s) => ({ ...s, step: "success", progress: 100 }))
			} catch (err: unknown) {
				const rejected = isUserRejection(err)
				const message = rejected
					? "Transaction cancelled"
					: err instanceof Error
						? err.message
						: "Upload failed"
				setState((s) => ({
					...s,
					step: "error",
					error: message,
					progress: 0,
				}))
			}
		},
		[account, signAndSubmitTransaction],
	)

	const reset = useCallback(() => {
		setState(initialState)
	}, [])

	return { state, upload, reset }
}
