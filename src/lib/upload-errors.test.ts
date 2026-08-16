import { describe, expect, it } from "vitest"
import { isUserRejection, translateUploadError } from "./upload-errors"

describe("upload error translation", () => {
	it("turns duplicate failures into an actionable rejection", () => {
		expect(translateUploadError(new Error("AlreadyExists"))).toContain(
			"A file with this name already exists",
		)
		expect(
			translateUploadError(
				new Error("EBLOB_WRITE_CHUNKSET_ALREADY_EXISTS"),
			),
		).toContain("Rename it or delete")
	})

	it("explains network simulation failures", () => {
		expect(
			translateUploadError(new Error("Simulation error: Generic error")),
		).toContain("current Shelbynet chain")
	})

	it("recognizes common wallet rejection messages", () => {
		expect(isUserRejection(new Error("User rejected request (4001)"))).toBe(
			true,
		)
		expect(isUserRejection(new Error("RPC unavailable"))).toBe(false)
	})

	it("does not erase unknown failures", () => {
		expect(
			translateUploadError(new Error("Storage provider timeout")),
		).toBe("Storage provider timeout")
		expect(translateUploadError(null)).toBe("Upload failed")
	})
})
