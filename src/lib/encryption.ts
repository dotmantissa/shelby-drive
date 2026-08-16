const MAGIC = new TextEncoder().encode("SDBLOB01")
const HEADER_LENGTH_BYTES = 4
const IV_LENGTH_BYTES = 12
const AUTH_TAG_BYTES = 16
const ENVELOPE_VERSION = 1
const KEY_INFO = new TextEncoder().encode("shelby-drive/aes-gcm-v1")

export const VAULT_UNLOCK_MESSAGE =
	"Unlock encrypted files for Shelby | DRIVE. This signature does not submit a transaction."
export const VAULT_UNLOCK_NONCE = "shelby-drive-encryption-v1"

export interface EncryptedFileMetadata {
	version: 1
	algorithm: "AES-GCM"
	name: string
	type: string
	size: number
}

export interface DecryptedBlob {
	data: Uint8Array
	metadata: EncryptedFileMetadata | null
	legacy: boolean
}

type ByteConvertible = {
	bcsToBytes?: () => Uint8Array
	toUint8Array?: () => Uint8Array
}

const bytesEqual = (left: Uint8Array, right: Uint8Array): boolean =>
	left.length === right.length &&
	left.every((byte, index) => byte === right[index])

const ownedBytes = (value: Uint8Array): Uint8Array<ArrayBuffer> =>
	Uint8Array.from(value)

const normalizeAccountAddress = (value: string): string => {
	const hex = value.toLowerCase().replace(/^0x/, "")
	const canonical = hex.replace(/^0+/, "") || "0"
	return `0x${canonical}`
}

const hexToBytes = (value: string): Uint8Array => {
	const normalized = value.startsWith("0x") ? value.slice(2) : value
	if (normalized.length === 0 || normalized.length % 2 !== 0) {
		throw new Error("Wallet returned an invalid signature")
	}
	const bytes = new Uint8Array(normalized.length / 2)
	for (let index = 0; index < bytes.length; index += 1) {
		const byte = Number.parseInt(
			normalized.slice(index * 2, index * 2 + 2),
			16,
		)
		if (Number.isNaN(byte)) {
			throw new Error("Wallet returned an invalid signature")
		}
		bytes[index] = byte
	}
	return bytes
}

export const signatureToBytes = (signature: unknown): Uint8Array => {
	if (signature instanceof Uint8Array) return signature
	if (typeof signature === "string") return hexToBytes(signature)
	if (signature && typeof signature === "object") {
		const convertible = signature as ByteConvertible
		if (typeof convertible.bcsToBytes === "function") {
			return convertible.bcsToBytes()
		}
		if (typeof convertible.toUint8Array === "function") {
			return convertible.toUint8Array()
		}
	}
	throw new Error("This wallet returned an unsupported signature format")
}

export const createVaultKey = async (
	signature: unknown,
	accountAddress: string,
): Promise<CryptoKey> => {
	const signatureBytes = signatureToBytes(signature)
	const material = await crypto.subtle.importKey(
		"raw",
		ownedBytes(signatureBytes),
		"HKDF",
		false,
		["deriveKey"],
	)
	return crypto.subtle.deriveKey(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: new TextEncoder().encode(
				normalizeAccountAddress(accountAddress),
			),
			info: KEY_INFO,
		},
		material,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	)
}

export const encryptedSize = (
	file: Pick<File, "name" | "type" | "size">,
): number => {
	const header = new TextEncoder().encode(
		JSON.stringify({
			version: ENVELOPE_VERSION,
			algorithm: "AES-GCM",
			name: file.name,
			type: file.type || "application/octet-stream",
			size: file.size,
		}),
	)
	return (
		MAGIC.length +
		HEADER_LENGTH_BYTES +
		header.length +
		IV_LENGTH_BYTES +
		file.size +
		AUTH_TAG_BYTES
	)
}

export const encryptFile = async (
	file: File,
	key: CryptoKey,
): Promise<Uint8Array> => {
	const metadata: EncryptedFileMetadata = {
		version: ENVELOPE_VERSION,
		algorithm: "AES-GCM",
		name: file.name,
		type: file.type || "application/octet-stream",
		size: file.size,
	}
	const header = new TextEncoder().encode(JSON.stringify(metadata))
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES))
	const plaintext = new Uint8Array(await file.arrayBuffer())
	const ciphertext = new Uint8Array(
		await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv, additionalData: header },
			key,
			plaintext,
		),
	)
	const output = new Uint8Array(
		MAGIC.length +
			HEADER_LENGTH_BYTES +
			header.length +
			iv.length +
			ciphertext.length,
	)
	let offset = 0
	output.set(MAGIC, offset)
	offset += MAGIC.length
	new DataView(output.buffer).setUint32(offset, header.length, false)
	offset += HEADER_LENGTH_BYTES
	output.set(header, offset)
	offset += header.length
	output.set(iv, offset)
	offset += iv.length
	output.set(ciphertext, offset)
	return output
}

export const isEncryptedBlob = (data: Uint8Array): boolean =>
	data.length >= MAGIC.length &&
	bytesEqual(data.subarray(0, MAGIC.length), MAGIC)

export const decryptBlob = async (
	data: Uint8Array,
	key: CryptoKey,
): Promise<DecryptedBlob> => {
	if (!isEncryptedBlob(data)) {
		return { data, metadata: null, legacy: true }
	}
	if (data.length < MAGIC.length + HEADER_LENGTH_BYTES + IV_LENGTH_BYTES) {
		throw new Error("Encrypted file is truncated")
	}
	let offset = MAGIC.length
	const headerLength = new DataView(
		data.buffer,
		data.byteOffset + offset,
		HEADER_LENGTH_BYTES,
	).getUint32(0, false)
	offset += HEADER_LENGTH_BYTES
	const ciphertextOffset = offset + headerLength + IV_LENGTH_BYTES
	if (headerLength === 0 || ciphertextOffset + AUTH_TAG_BYTES > data.length) {
		throw new Error("Encrypted file envelope is invalid")
	}
	const header = data.subarray(offset, offset + headerLength)
	offset += headerLength
	const iv = data.subarray(offset, offset + IV_LENGTH_BYTES)
	offset += IV_LENGTH_BYTES
	const ciphertext = data.subarray(offset)

	let metadata: EncryptedFileMetadata
	try {
		metadata = JSON.parse(new TextDecoder().decode(header))
	} catch {
		throw new Error("Encrypted file metadata is invalid")
	}
	if (
		metadata.version !== ENVELOPE_VERSION ||
		metadata.algorithm !== "AES-GCM" ||
		typeof metadata.name !== "string" ||
		typeof metadata.type !== "string" ||
		typeof metadata.size !== "number"
	) {
		throw new Error("Encrypted file format is not supported")
	}

	try {
		const ownedHeader = ownedBytes(header)
		const ownedIv = ownedBytes(iv)
		const ownedCiphertext = ownedBytes(ciphertext)
		const plaintext = new Uint8Array(
			await crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: ownedIv,
					additionalData: ownedHeader,
				},
				key,
				ownedCiphertext,
			),
		)
		if (plaintext.length !== metadata.size) {
			throw new Error("Decrypted file size does not match its metadata")
		}
		return { data: plaintext, metadata, legacy: false }
	} catch (error) {
		if (
			error instanceof Error &&
			error.message === "Decrypted file size does not match its metadata"
		) {
			throw error
		}
		throw new Error(
			"Unable to decrypt this file. Confirm that the same wallet account signed the request.",
		)
	}
}
