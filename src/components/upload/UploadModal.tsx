"use client"

import { motion } from "framer-motion"
import { CheckCircle2, FileIcon, Wallet, XCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Spinner } from "@/components/ui/Spinner"
import { useToast } from "@/components/ui/ToastProvider"
import type { UploadState } from "@/hooks/useUpload"
import { cn, formatBytes } from "@/lib/utils"

interface UploadModalProps {
	open: boolean
	state: UploadState
	onClose: () => void
	onReset: () => void
}

export function UploadModal({
	open,
	state,
	onClose,
	onReset,
}: UploadModalProps) {
	const toast = useToast()
	const dismissible =
		state.step === "idle" ||
		state.step === "success" ||
		state.step === "error"

	// Fire success/error toasts at most once per state transition.
	const lastToastedRef = useRef<string>("")
	useEffect(() => {
		if (state.step !== "success" && state.step !== "error") {
			lastToastedRef.current = ""
			return
		}
		const key = `${state.step}:${state.error ?? ""}:${state.fileName ?? ""}`
		if (lastToastedRef.current === key) return
		lastToastedRef.current = key

		if (state.step === "success") {
			toast.success(
				"File stored successfully",
				state.fileName ?? undefined,
			)
		} else if (state.error === "Transaction cancelled") {
			toast.info("Transaction cancelled")
		} else if (state.error) {
			toast.error("Upload failed", state.error)
		}
	}, [state.step, state.error, state.fileName, toast])

	// Close + reset so the dashboard's upload zone is ready for another file.
	const handleUploadAnother = () => {
		onReset()
		onClose()
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			dismissible={dismissible}
			className="max-w-xl"
		>
			{state.fileName && (
				<div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--bg-border)] bg-[var(--bg-elevated)] px-4 py-3">
					<FileIcon
						size={20}
						className="shrink-0 text-[var(--accent-primary)]"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-[var(--text-primary)]">
							{state.fileName}
						</p>
						{state.fileSize !== null && (
							<p className="text-xs text-[var(--text-secondary)]">
								{formatBytes(state.fileSize)}
							</p>
						)}
					</div>
				</div>
			)}

			{state.step === "uploading" && (
				<div className="flex flex-col items-center gap-4 py-6 text-center">
					<Spinner size={36} />
					<div>
						<p className="text-base font-medium text-[var(--text-primary)]">
							Storing on Shelbynet…
						</p>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							Encoding, registering on-chain, and uploading to
							storage providers.
						</p>
					</div>
					<div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--accent-primary)]/30 bg-[var(--accent-dim)] px-3 py-2 text-xs">
						<Wallet
							size={14}
							className="text-[var(--accent-primary)]"
						/>
						<span className="text-[var(--text-primary)]">
							Approve the transaction in your wallet when
							prompted.
						</span>
					</div>
				</div>
			)}

			{state.step === "success" && (
				<div className="flex flex-col items-center gap-3 py-4 text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 18,
						}}
					>
						<CheckCircle2
							size={56}
							className="text-[var(--accent-primary)]"
						/>
					</motion.div>
					<h3 className="text-lg font-semibold text-[var(--text-primary)]">
						File Stored Successfully
					</h3>
					<p className="text-sm text-[var(--text-secondary)]">
						Your file is now distributed across the Shelby network.
					</p>
					<div className="mt-2 flex gap-2">
						<Button
							variant="outline"
							onClick={handleUploadAnother}
						>
							Upload Another
						</Button>
						<Button onClick={onClose}>View Dashboard</Button>
					</div>
				</div>
			)}

			{state.step === "error" && (
				<ErrorBody
					state={state}
					onRetry={() => {
						onReset()
						onClose()
					}}
					onClose={onClose}
				/>
			)}
		</Modal>
	)
}

function ErrorBody({
	state,
	onRetry,
	onClose,
}: {
	state: UploadState
	onRetry: () => void
	onClose: () => void
}) {
	const cancelled = state.error === "Transaction cancelled"
	return (
		<div className="flex flex-col items-center gap-3 py-4 text-center">
			<XCircle
				size={48}
				className={cn(
					cancelled
						? "text-[var(--status-warning)]"
						: "text-[var(--status-error)]",
				)}
			/>
			<h3 className="text-lg font-semibold text-[var(--text-primary)]">
				{cancelled ? "Transaction cancelled" : "Upload Failed"}
			</h3>
			{state.error && !cancelled && (
				<p className="max-w-md break-words text-xs text-[var(--text-secondary)]">
					{state.error}
				</p>
			)}
			<div className="mt-2 flex gap-2">
				<Button variant="ghost" onClick={onClose}>
					Close
				</Button>
				<Button onClick={onRetry}>Try Again</Button>
			</div>
		</div>
	)
}
