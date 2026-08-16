const PREVIEW_URL_LIFETIME_MS = 60_000

export const reservePreviewWindow = (): Window => {
	const previewWindow = window.open("about:blank", "_blank")
	if (!previewWindow) {
		throw new Error("The browser blocked the file preview window")
	}
	previewWindow.opener = null
	return previewWindow
}

export const showPreview = (previewWindow: Window, blob: Blob): void => {
	if (previewWindow.closed) {
		throw new Error("The file preview window was closed")
	}

	const objectUrl = URL.createObjectURL(blob)
	previewWindow.location.href = objectUrl
	window.setTimeout(
		() => URL.revokeObjectURL(objectUrl),
		PREVIEW_URL_LIFETIME_MS,
	)
}

export const closePreviewWindow = (previewWindow: Window | null): void => {
	if (previewWindow && !previewWindow.closed) {
		previewWindow.close()
	}
}
