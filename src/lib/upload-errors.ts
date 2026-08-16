export const isUserRejection = (error: unknown): boolean => {
	const message = error instanceof Error ? error.message : String(error ?? "")
	return (
		message.includes("4001") ||
		/user rejected/i.test(message) ||
		/user denied/i.test(message) ||
		/rejected by user/i.test(message)
	)
}

export const translateUploadError = (error: unknown): string => {
	const message = error instanceof Error ? error.message : String(error ?? "")
	const lower = message.toLowerCase()
	if (
		lower.includes("alreadyexists") ||
		lower.includes("already exists") ||
		lower.includes("eblob_write_chunkset_already_exists")
	) {
		return "A file with this name already exists. Rename it or delete the existing file first."
	}
	if (
		lower.includes("function_not_found") ||
		lower.includes("module_not_found") ||
		lower.includes("linker error") ||
		lower.includes("simulation error") ||
		lower.includes("generic error") ||
		lower.includes("chain id")
	) {
		return "Transaction simulation failed. Confirm that the wallet is connected to the current Shelbynet chain and try again."
	}
	if (lower.includes("insufficient_balance_for_transaction_fee")) {
		return "Not enough APT to pay for the transaction fee on Shelbynet."
	}
	if (
		lower.includes("e_insufficient_funds") ||
		lower.includes("insufficient funds")
	) {
		return "Not enough ShelbyUSD to pay for blob storage."
	}
	if (lower.includes("429")) {
		return "Shelby rate limit exceeded. Configure a dedicated API key or try again later."
	}
	if (lower.includes("401") || lower.includes("unauthorized")) {
		return "Shelby rejected the configured API key."
	}
	return message || "Upload failed"
}
