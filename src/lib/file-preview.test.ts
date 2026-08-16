import { afterEach, describe, expect, it, vi } from "vitest"
import {
	closePreviewWindow,
	reservePreviewWindow,
	showPreview,
} from "./file-preview"

afterEach(() => {
	vi.unstubAllGlobals()
})

describe("file preview windows", () => {
	it("reserves a detached window synchronously", () => {
		const previewWindow = {
			closed: false,
			opener: {},
		} as unknown as Window
		const open = vi.fn(() => previewWindow)
		vi.stubGlobal("window", { open })

		expect(reservePreviewWindow()).toBe(previewWindow)
		expect(open).toHaveBeenCalledWith("about:blank", "_blank")
		expect(previewWindow.opener).toBeNull()
	})

	it("reports a blocked popup", () => {
		vi.stubGlobal("window", { open: vi.fn(() => null) })

		expect(() => reservePreviewWindow()).toThrow(
			"The browser blocked the file preview window",
		)
	})

	it("navigates the reserved window to the blob URL", () => {
		const previewWindow = {
			closed: false,
			location: { href: "about:blank" },
		} as unknown as Window
		const setTimeout = vi.fn()
		const createObjectURL = vi.fn(() => "blob:preview")
		const revokeObjectURL = vi.fn()
		vi.stubGlobal("window", { setTimeout })
		vi.stubGlobal("URL", { createObjectURL, revokeObjectURL })
		const blob = new Blob(["preview"])

		showPreview(previewWindow, blob)

		expect(createObjectURL).toHaveBeenCalledWith(blob)
		expect(previewWindow.location.href).toBe("blob:preview")
		expect(setTimeout).toHaveBeenCalledOnce()
	})

	it("closes an unused reserved window", () => {
		const close = vi.fn()
		const previewWindow = {
			closed: false,
			close,
		} as unknown as Window

		closePreviewWindow(previewWindow)

		expect(close).toHaveBeenCalledOnce()
	})
})
