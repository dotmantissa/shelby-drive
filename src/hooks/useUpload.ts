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
import { BLOB_EXPIRATION_MICROS, isShelbynet } from "@/lib/constants"
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

/**
 * Translate raw wallet/SDK errors into human-friendly messages. Most upload
 * failures fall into one of a few buckets — bad network, no funds, blob
 * already written, etc. Leave anything we don't recognise pass through.
 */
const translateError = (err: unknown): string => {
	const msg = err instanceof Error ? err.message : String(err ?? "")
	const lower = msg.toLowerCase()

	if (
		lower.includes("function_not_found") ||
		lower.includes("module_not_found") ||
		lower.includes("linker error") ||
		lower.includes("simulation error") ||
		lower.includes("generic error")
	) {
		return "Transaction simulation failed. Most often this means your wallet is on the wrong network — switch to Shelbynet and try again."
	}
	if (lower.includes("eblob_write_chunkset_already_exists")) {
		return "A blob with this exact name already exists for your account. Rename the file before re-uploading."
	}
	if (lower.includes("insufficient_balance_for_transaction_fee")) {
		return "Not enough APT to pay for the transaction fee on Shelbynet. Request testnet APT from the Shelby Discord."
	}
	if (lower.includes("e_insufficient_funds") || lower.includes("eblob_write_insufficient_funds")) {
		return "Not enough ShelbyUSD to pay for blob storage. Request testnet tokens from the Shelby Discord."
	}
	if (lower.includes("429")) {
		return "Rate limit exceeded. The default API key is heavily throttled — get your own at docs.shelby.xyz."
	}
	if (lower.includes("401") || lower.includes("unauthorized")) {
		return "Unauthorized. The Shelby API key isn't accepted by the Shelbynet indexer/RPC. Check NEXT_PUBLIC_SHELBY_API_KEY."
	}
	return msg || "Upload failed"
}

export const useUpload = () => {
	const { account, signAndSubmitTransaction, network } = useWallet()
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

			// Pre-flight: the Shelby contract only exists on Shelbynet. Refusing
			// here gives a much clearer message than the wallet's opaque
			// "Simulation error: Generic error".
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
					: translateError(err)
				setState((s) => ({
					...s,
					step: "error",
					error: message,
					progress: 0,
				}))
			}
		},
		[account, signAndSubmitTransaction, network],
	)

	const reset = useCallback(() => {
		setState(initialState)
	}, [])

	return { state, upload, reset }
}
