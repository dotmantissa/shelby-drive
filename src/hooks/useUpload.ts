"use client"

import { AccountAddress } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import {
	createBlobKey,
	expectedTotalChunksets,
	generateCommitments,
	requiredAckCount,
	ShelbyBlobClient,
} from "@shelby-protocol/sdk/browser"
import { useCallback, useState } from "react"
import {
	BLOB_EXPIRATION_MICROS,
	isShelbynet,
	MAX_FILE_SIZE_BYTES,
	MAX_TOTAL_STORAGE_BYTES,
} from "@/lib/constants"
import {
	createVaultKey,
	encryptedSize,
	encryptFile,
	VAULT_UNLOCK_MESSAGE,
	VAULT_UNLOCK_NONCE,
} from "@/lib/encryption"
import { getErasureCodingProvider, getShelbyClient } from "@/lib/shelby"
import { isUserRejection, translateUploadError } from "@/lib/upload-errors"
import { formatBytes } from "@/lib/utils"
import { addressToString } from "@/types/shelby"

export type UploadStep =
	| "idle"
	| "authorizing"
	| "encrypting"
	| "registering"
	| "uploading"
	| "committing"
	| "success"
	| "error"

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

export const useUpload = (opts: {
	totalSizeBytes: number
	existingBlobNames: ReadonlySet<string>
	onSuccess?: () => void | Promise<void>
}) => {
	const { totalSizeBytes, existingBlobNames, onSuccess } = opts
	const wallet = useWallet()
	const { account, network, signAndSubmitTransaction, signMessage } = wallet
	const [state, setState] = useState<UploadState>(initialState)

	const upload = useCallback(
		async (file: File) => {
			const fail = (error: string) => {
				setState({
					step: "error",
					error,
					fileName: file.name,
					fileSize: file.size,
				})
			}

			if (!account) {
				fail("Wallet not connected")
				return
			}
			if (!isShelbynet(network)) {
				fail(
					`Wallet is on ${network?.name ?? "an unknown network"}. Switch to Shelbynet and try again.`,
				)
				return
			}
			if (existingBlobNames.has(file.name)) {
				fail(
					"A file with this name already exists. Rename it or delete the existing file first.",
				)
				return
			}
			if (file.size > MAX_FILE_SIZE_BYTES) {
				fail(
					`File is ${formatBytes(file.size)}; maximum upload is ${formatBytes(MAX_FILE_SIZE_BYTES)} per file.`,
				)
				return
			}

			const storedSize = encryptedSize(file)
			if (totalSizeBytes + storedSize > MAX_TOTAL_STORAGE_BYTES) {
				const remaining = Math.max(
					0,
					MAX_TOTAL_STORAGE_BYTES - totalSizeBytes,
				)
				fail(
					`Only ${formatBytes(remaining)} remains in this Drive. The encrypted file needs ${formatBytes(storedSize)}.`,
				)
				return
			}

			const accountAddress = AccountAddress.from(
				addressToString(account.address),
				{ maxMissingChars: 63 },
			)
			const client = getShelbyClient()

			try {
				const existing =
					await client.coordination.getFullObjectMetadata({
						account: accountAddress,
						name: file.name,
					})
				if (existing && !existing.isDeleted) {
					throw new Error("AlreadyExists")
				}

				setState({
					step: "authorizing",
					error: null,
					fileName: file.name,
					fileSize: file.size,
				})
				const signed = await signMessage({
					message: VAULT_UNLOCK_MESSAGE,
					nonce: VAULT_UNLOCK_NONCE,
					address: true,
					application: false,
					chainId: false,
				})
				const key = await createVaultKey(
					signed.signature,
					accountAddress.toString(),
				)

				setState((current) => ({ ...current, step: "encrypting" }))
				const encryptedData = await encryptFile(file, key)
				const provider = await getErasureCodingProvider()
				const commitments = await generateCommitments(
					provider,
					encryptedData,
				)
				const chunksetSizeBytes =
					provider.config.chunkSizeBytes * provider.config.erasure_k
				const { aptos, defaultOptions, deployer } = client.coordination

				setState((current) => ({ ...current, step: "registering" }))
				const registerTx = await signAndSubmitTransaction({
					data: ShelbyBlobClient.createRegisterBlobPayload({
						deployer,
						account: accountAddress,
						blobName: file.name,
						selectedLocation: defaultOptions.selectedLocation,
						locationHint: defaultOptions.locationHint,
						blobSize: encryptedData.length,
						blobMerkleRoot: commitments.blob_merkle_root,
						expirationMicros: BLOB_EXPIRATION_MICROS(),
						numChunksets: expectedTotalChunksets(
							encryptedData.length,
							chunksetSizeBytes,
						),
						encoding: provider.config.enumIndex,
						encryption: "AES_GCM_V1",
					}),
				})
				const registerReceipt = await aptos.waitForTransaction({
					transactionHash: registerTx.hash,
				})
				if (!registerReceipt.success) {
					throw new Error(
						`Failed to register encrypted file: ${registerReceipt.vm_status}`,
					)
				}
				const events =
					"events" in registerReceipt ? registerReceipt.events : []
				const objectName = createBlobKey({
					account: accountAddress,
					blobName: file.name,
				})
				const uid = ShelbyBlobClient.registeredBlobUids(
					events,
					deployer,
				).find(
					(registered) => registered.objectName === objectName,
				)?.uid
				if (uid === undefined) {
					throw new Error(
						`Shelby did not return a blob UID for ${file.name}`,
					)
				}

				setState((current) => ({ ...current, step: "uploading" }))
				const { spAcks } = await client.rpc.putBlobChunksets({
					accountAddress,
					uid,
					blobData: encryptedData,
					commitments,
					chunksetConcurrency: 3,
				})
				const minimumAcks = requiredAckCount(provider.config.erasure_n)
				if (spAcks.length < minimumAcks) {
					throw new Error(
						`Only ${spAcks.length} storage providers acknowledged the upload; ${minimumAcks} are required.`,
					)
				}

				setState((current) => ({ ...current, step: "committing" }))
				const commitTx = await signAndSubmitTransaction({
					data: ShelbyBlobClient.createCommitObjectPayload({
						deployer,
						uid,
						blobName: file.name,
						overwrite: false,
						storageProviderAcks: spAcks,
					}),
				})
				const commitReceipt = await aptos.waitForTransaction({
					transactionHash: commitTx.hash,
				})
				if (!commitReceipt.success) {
					throw new Error(
						`Failed to commit encrypted file: ${commitReceipt.vm_status}`,
					)
				}
				const commitEvents =
					"events" in commitReceipt ? commitReceipt.events : []
				const rejection = ShelbyBlobClient.findObjectCommitRejection(
					commitEvents,
					deployer,
					uid,
				)
				if (rejection) {
					throw new Error(rejection)
				}

				setState((current) => ({ ...current, step: "success" }))
				await onSuccess?.()
			} catch (err: unknown) {
				console.error("Encrypted file upload failed", err)
				fail(
					isUserRejection(err)
						? "Transaction cancelled"
						: translateUploadError(err),
				)
			}
		},
		[
			account,
			existingBlobNames,
			network,
			onSuccess,
			signAndSubmitTransaction,
			signMessage,
			totalSizeBytes,
		],
	)

	const reset = useCallback(() => {
		setState(initialState)
	}, [])

	return { state, upload, reset }
}
