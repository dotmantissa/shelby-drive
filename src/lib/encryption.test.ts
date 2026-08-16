import { describe, expect, it } from "vitest"
import {
	createVaultKey,
	decryptBlob,
	encryptedSize,
	encryptFile,
	isEncryptedBlob,
} from "./encryption"

const signature = (byte: string): string => `0x${byte.repeat(128)}`
const address =
	"0x00000000000000000000000000000000000000000000000000000000000000ab"

describe("encrypted blob envelope", () => {
	it("round trips file data and authenticated metadata", async () => {
		const file = new File(["private contents"], "notes.txt", {
			type: "text/plain",
		})
		const key = await createVaultKey(signature("1"), address)
		const encrypted = await encryptFile(file, key)
		const decrypted = await decryptBlob(encrypted, key)

		expect(isEncryptedBlob(encrypted)).toBe(true)
		expect(new TextDecoder().decode(decrypted.data)).toBe(
			"private contents",
		)
		expect(decrypted.metadata).toMatchObject({
			name: "notes.txt",
			type: "text/plain",
			size: file.size,
		})
		expect(decrypted.legacy).toBe(false)
	})

	it("rejects ciphertext tampering", async () => {
		const file = new File(["untampered"], "proof.txt")
		const key = await createVaultKey(signature("2"), address)
		const encrypted = await encryptFile(file, key)
		encrypted[encrypted.length - 1] ^= 1

		await expect(decryptBlob(encrypted, key)).rejects.toThrow(
			"Unable to decrypt this file",
		)
	})

	it("rejects a different wallet-derived key", async () => {
		const file = new File(["owner only"], "owner.txt")
		const ownerKey = await createVaultKey(signature("3"), address)
		const otherKey = await createVaultKey(
			signature("4"),
			address.replace(/ab$/, "ac"),
		)
		const encrypted = await encryptFile(file, ownerKey)

		await expect(decryptBlob(encrypted, otherKey)).rejects.toThrow(
			"same wallet account",
		)
	})

	it("passes legacy plaintext through unchanged", async () => {
		const plaintext = new TextEncoder().encode("legacy")
		const key = await createVaultKey(signature("5"), address)
		const result = await decryptBlob(plaintext, key)

		expect(result.data).toEqual(plaintext)
		expect(result.metadata).toBeNull()
		expect(result.legacy).toBe(true)
	})

	it("reports the exact encrypted envelope size", async () => {
		const file = new File(["size check"], "size.json", {
			type: "application/json",
		})
		const key = await createVaultKey(signature("6"), address)
		const encrypted = await encryptFile(file, key)

		expect(encrypted).toHaveLength(encryptedSize(file))
	})

	it("normalizes equivalent Aptos address forms for key derivation", async () => {
		const shortKey = await createVaultKey(signature("7"), "0xab")
		const longKey = await createVaultKey(signature("7"), address)
		const file = new File(["canonical"], "address.txt")
		const encrypted = await encryptFile(file, shortKey)

		await expect(decryptBlob(encrypted, longKey)).resolves.toMatchObject({
			legacy: false,
		})
	})
})
