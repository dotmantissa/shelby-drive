"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useCallback, useState } from "react"
import { useToast } from "@/components/ui/ToastProvider"
import {
	createVaultKey,
	decryptBlob,
	isEncryptedBlob,
	VAULT_UNLOCK_MESSAGE,
	VAULT_UNLOCK_NONCE,
} from "@/lib/encryption"
import {
	closePreviewWindow,
	reservePreviewWindow,
	showPreview,
} from "@/lib/file-preview"
import { getShelbyClient } from "@/lib/shelby"
import { addressToString } from "@/types/shelby"

export type RetrievalMode = "download" | "view"

interface RetrievalState {
	blobName: string
	mode: RetrievalMode
}

const PREVIEWABLE_TYPES = [
	"application/pdf",
	"image/gif",
	"image/jpeg",
	"image/png",
	"image/webp",
	"text/plain",
] as const

const canPreview = (mimeType: string): boolean =>
	PREVIEWABLE_TYPES.includes(
		mimeType as (typeof PREVIEWABLE_TYPES)[number],
	) ||
	mimeType.startsWith("audio/") ||
	mimeType.startsWith("video/")

const readStream = async (
	stream: ReadableStream,
	expectedBytes: number,
): Promise<Uint8Array> => {
	const reader = stream.getReader()
	const chunks: Uint8Array[] = []
	let size = 0
	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		const chunk =
			value instanceof Uint8Array
				? value
				: new Uint8Array(value as ArrayBuffer)
		chunks.push(chunk)
		size += chunk.length
	}
	const output = new Uint8Array(Math.max(size, expectedBytes))
	let offset = 0
	for (const chunk of chunks) {
		output.set(chunk, offset)
		offset += chunk.length
	}
	return output.subarray(0, size)
}

const triggerDownload = (blob: Blob, fileName: string) => {
	const objectUrl = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = objectUrl
	link.download = fileName
	document.body.appendChild(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(objectUrl)
}

export const useDownload = () => {
	const { account, signMessage } = useWallet()
	const toast = useToast()
	const [retrieving, setRetrieving] = useState<RetrievalState | null>(null)

	const retrieve = useCallback(
		async (blobName: string, mode: RetrievalMode) => {
			if (!account?.address) {
				toast.error(
					"Retrieval failed",
					"Connect the owning wallet first.",
				)
				return
			}

			let previewWindow: Window | null = null
			if (mode === "view") {
				try {
					previewWindow = reservePreviewWindow()
				} catch (error: unknown) {
					const message =
						error instanceof Error
							? error.message
							: "Preview failed"
					toast.error("Preview failed", message)
					return
				}
			}

			setRetrieving({ blobName, mode })
			try {
				const address = addressToString(account.address)
				const remoteBlob = await getShelbyClient().download({
					account: address,
					blobName,
				})
				const storedData = await readStream(
					remoteBlob.readable,
					remoteBlob.contentLength,
				)

				let data = storedData
				let fileName = blobName
				let mimeType = "application/octet-stream"

				if (isEncryptedBlob(storedData)) {
					const signed = await signMessage({
						message: VAULT_UNLOCK_MESSAGE,
						nonce: VAULT_UNLOCK_NONCE,
						address: true,
						application: false,
						chainId: false,
					})
					const key = await createVaultKey(signed.signature, address)
					const decrypted = await decryptBlob(storedData, key)
					data = decrypted.data
					fileName = decrypted.metadata?.name ?? blobName
					mimeType =
						decrypted.metadata?.type ?? "application/octet-stream"
				} else {
					toast.warning(
						"Legacy unencrypted file",
						"This file predates encrypted uploads. Download it and upload a renamed encrypted copy.",
					)
				}

				const localBlob = new Blob([Uint8Array.from(data)], {
					type: mimeType,
				})
				if (mode === "view") {
					if (!canPreview(mimeType)) {
						throw new Error(
							"This file type is not safe to preview in the browser. Download it instead.",
						)
					}
					if (!previewWindow) {
						throw new Error("The file preview window is unavailable")
					}
					showPreview(previewWindow, localBlob)
					previewWindow = null
				} else {
					triggerDownload(localBlob, fileName)
				}
			} catch (error: unknown) {
				closePreviewWindow(previewWindow)
				const message =
					error instanceof Error ? error.message : "Retrieval failed"
				toast.error(
					mode === "view" ? "Preview failed" : "Download failed",
					message,
				)
				console.error("File retrieval failed", error)
			} finally {
				setRetrieving(null)
			}
		},
		[account?.address, signMessage, toast],
	)

	return { retrieve, retrieving }
}
