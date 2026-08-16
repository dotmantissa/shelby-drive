export interface UploadNotificationState {
	step: string
	error: string | null
	fileName: string | null
}

export interface UploadNotification {
	type: "success" | "error" | "info"
	title: string
	message?: string
}

export interface UploadNotificationDecision {
	nextKey: string
	notification: UploadNotification | null
}

export const decideUploadNotification = (
	state: UploadNotificationState,
	lastKey: string,
): UploadNotificationDecision => {
	if (state.step !== "success" && state.step !== "error") {
		return { nextKey: "", notification: null }
	}

	const nextKey = `${state.step}:${state.error ?? ""}:${state.fileName ?? ""}`
	if (nextKey === lastKey) {
		return { nextKey, notification: null }
	}

	if (state.step === "success") {
		return {
			nextKey,
			notification: {
				type: "success",
				title: "File stored successfully",
				message: state.fileName ?? undefined,
			},
		}
	}

	if (state.error === "Transaction cancelled") {
		return {
			nextKey,
			notification: {
				type: "info",
				title: "Transaction cancelled",
			},
		}
	}

	return {
		nextKey,
		notification: state.error
			? {
					type: "error",
					title: "Upload failed",
					message: state.error,
				}
			: null,
	}
}
