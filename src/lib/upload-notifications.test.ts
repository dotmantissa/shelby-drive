import { describe, expect, it } from "vitest"
import { decideUploadNotification } from "./upload-notifications"

describe("upload notifications", () => {
	it("notifies once when a wallet request is rejected", () => {
		const state = {
			step: "error",
			error: "Transaction cancelled",
			fileName: "private.txt",
		}

		const first = decideUploadNotification(state, "")
		expect(first.notification).toEqual({
			type: "info",
			title: "Transaction cancelled",
		})

		const repeated = decideUploadNotification(state, first.nextKey)
		expect(repeated.notification).toBeNull()
		expect(repeated.nextKey).toBe(first.nextKey)
	})

	it("allows a later terminal transition to notify", () => {
		const failed = decideUploadNotification(
			{
				step: "error",
				error: "Storage provider timeout",
				fileName: "private.txt",
			},
			"",
		)
		const reset = decideUploadNotification(
			{ step: "idle", error: null, fileName: null },
			failed.nextKey,
		)
		const succeeded = decideUploadNotification(
			{ step: "success", error: null, fileName: "private.txt" },
			reset.nextKey,
		)

		expect(reset.nextKey).toBe("")
		expect(succeeded.notification).toEqual({
			type: "success",
			title: "File stored successfully",
			message: "private.txt",
		})
	})
})
