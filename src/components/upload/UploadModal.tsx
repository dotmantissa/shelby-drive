"use client"

import { motion } from "framer-motion"
import {
	CheckCircle2,
	ExternalLink,
	FileIcon,
	Wallet,
	XCircle,
} from "lucide-react"
import { useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { Spinner } from "@/components/ui/Spinner"
import { useToast } from "@/components/ui/ToastProvider"
import type { UploadState } from "@/hooks/useUpload"
import { getAptosExplorerTxUrl } from "@/lib/constants"
import {
	cn,
	formatBytes,
	truncateMiddle,
} from "@/lib/utils"
import { UploadSteps } from "./UploadSteps"

interface UploadModalProps {
	open: boolean
	state: UploadState
	onClose: () => void
	onReset: () => void
	onCompleted?: () => void
}

export function UploadModal({
	open,
	state,
	onClose,
	onReset,
	onCompleted,
}: UploadModalProps) {
	const toast = useToast()
	const dismissible =
		state.step === "idle" ||
		state.step === "success" ||
		state.step === "error"

	useEffect(() => {
		if (state.step === "success") {
			toast.success(
				"File stored successfully",
				state.fileName ?? undefined,
			)
		} else if (state.step === "error" && state.error) {
			if (state.error === "Transaction cancelled") {
				toast.info("Transaction cancelled")
			} else {
				toast.error("Upload failed", state.error)
			}
		}
	}, [state.step, state.error, state.fileName, toast])

	const showProgress =
		state.step === "encoding" ||
		state.step === "registering" ||
		state.step === "uploading"

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

			{(state.step === "encoding" ||
				state.step === "registering" ||
				state.step === "uploading") && (
				<div className="mb-6">
					<UploadSteps step={state.step} />
				</div>
			)}

			{state.step === "encoding" && (
				<StepBody
					title="Encoding your file with Clay erasure codes…"
					subtitle="Generating cryptographic commitments"
				/>
			)}

			{state.step === "registering" && (
				<>
					<StepBody
						title="Registering on Aptos Testnet…"
						subtitle="Please approve the transaction in your wallet"
						icon={
							<Wallet
								size={32}
								className="text-[var(--accent-primary)] animate-pulse"
							/>
						}
					/>
					{state.txHash && (
						<div className="mt-4 flex items-center justify-center">
							<a
								href={getAptosExplorerTxUrl(state.txHash)}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:underline"
							>
								<span className="font-mono">
									{truncateMiddle(state.txHash, 10, 8)}
								</span>
								<ExternalLink size={12} />
							</a>
						</div>
					)}
				</>
			)}

			{state.step === "uploading" && (
				<StepBody
					title="Uploading to Shelby storage providers…"
					subtitle="Your file is being distributed across the decentralized network"
				/>
			)}

			{showProgress && (
				<div className="mt-6">
					<ProgressBar value={state.progress} />
					<p className="mt-2 text-right text-xs text-[var(--text-tertiary)]">
						{Math.round(state.progress)}%
					</p>
				</div>
			)}

			{state.step === "success" && (
				<SuccessState
					state={state}
					onClose={() => {
						onCompleted?.()
						onClose()
					}}
					onUploadAnother={onReset}
				/>
			)}

			{state.step === "error" && (
				<ErrorState state={state} onRetry={onReset} onClose={onClose} />
			)}
		</Modal>
	)
}

function StepBody({
	title,
	subtitle,
	icon,
}: {
	title: string
	subtitle: string
	icon?: React.ReactNode
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-4 text-center">
			{icon ?? <Spinner size={32} />}
			<p className="text-sm font-medium text-[var(--text-primary)]">
				{title}
			</p>
			<p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
		</div>
	)
}

function SuccessState({
	state,
	onClose,
	onUploadAnother,
}: {
	state: UploadState
	onClose: () => void
	onUploadAnother: () => void
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-4 text-center">
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ type: "spring", stiffness: 300, damping: 18 }}
			>
				<CheckCircle2
					size={56}
					className="text-[var(--accent-primary)]"
				/>
			</motion.div>
			<h3 className="text-lg font-semibold text-[var(--text-primary)]">
				File Stored Successfully
			</h3>
			<div className="w-full space-y-2 rounded-lg border border-[var(--bg-border)] bg-[var(--bg-elevated)] p-3 text-left text-xs">
				{state.blobMerkleRoot && (
					<DetailRow
						label="Merkle root"
						value={truncateMiddle(state.blobMerkleRoot, 10, 8)}
					/>
				)}
				{state.txHash && (
					<DetailRow
						label="Tx hash"
						value={
							<a
								href={getAptosExplorerTxUrl(state.txHash)}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 font-mono text-[var(--accent-primary)] hover:underline"
							>
								{truncateMiddle(state.txHash, 10, 8)}
								<ExternalLink size={10} />
							</a>
						}
					/>
				)}
				{state.fileSize !== null && (
					<DetailRow
						label="Size"
						value={formatBytes(state.fileSize)}
					/>
				)}
			</div>
			<div className="mt-2 flex gap-2">
				<Button variant="outline" onClick={onUploadAnother}>
					Upload Another
				</Button>
				<Button onClick={onClose}>View Dashboard</Button>
			</div>
		</div>
	)
}

function ErrorState({
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

function DetailRow({
	label,
	value,
}: {
	label: string
	value: React.ReactNode
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-[var(--text-tertiary)]">{label}</span>
			<span className="font-mono text-[var(--text-primary)]">{value}</span>
		</div>
	)
}
