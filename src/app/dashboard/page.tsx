"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AlertTriangle, MessageCircle, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { BlobGrid } from "@/components/dashboard/BlobGrid"
import { BlobTable } from "@/components/dashboard/BlobTable"
import { DeleteBlobModal } from "@/components/dashboard/DeleteBlobModal"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { NetworkBanner } from "@/components/dashboard/NetworkBanner"
import { StorageStats } from "@/components/dashboard/StorageStats"
import { ViewToggle } from "@/components/dashboard/ViewToggle"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { Spinner } from "@/components/ui/Spinner"
import { useToast } from "@/components/ui/ToastProvider"
import { UploadModal } from "@/components/upload/UploadModal"
import { UploadZone } from "@/components/upload/UploadZone"
import { WalletButton } from "@/components/wallet/WalletButton"
import { useBlobs } from "@/hooks/useBlobs"
import { useDelete } from "@/hooks/useDelete"
import { useUpload } from "@/hooks/useUpload"
import {
	DISCORD_URL,
	MAX_TOTAL_STORAGE_BYTES,
	isShelbyConfigured,
	isShelbynet,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { addressToString } from "@/types/shelby"
import type { ViewMode } from "@/types/shelby"

export default function DashboardPage() {
	const { account, connected, network } = useWallet()
	const [view, setView] = useState<ViewMode>("grid")
	const [uploadOpen, setUploadOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
	const toast = useToast()

	const { blobs, isLoading, error, refetch, totalSize } = useBlobs()
	const {
		state: uploadState,
		upload,
		reset: resetUpload,
	} = useUpload({
		totalSizeBytes: totalSize,
		onSuccess: () => {
			refetch()
		},
	})
	const { remove, deleting: deletingName } = useDelete({
		onSuccess: () => {
			toast.success("File deleted")
			setDeleteTarget(null)
			refetch()
		},
	})

	const handleFile = (file: File) => {
		setUploadOpen(true)
		void upload(file)
	}

	// Surface upload errors that we set immediately (no transaction yet),
	// since the Modal effect won't run if the modal is hidden after a
	// fast pre-flight rejection.
	useEffect(() => {
		if (uploadState.step === "error" && !uploadOpen) {
			toast.error("Upload failed", uploadState.error ?? undefined)
		}
	}, [uploadState.step, uploadState.error, uploadOpen, toast])

	if (!connected || !account) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center py-12">
				<GlassCard className="flex max-w-md flex-col items-center gap-4 text-center">
					<h2 className="text-xl font-semibold text-[var(--text-primary)]">
						Connect your wallet to access your Drive
					</h2>
					<p className="text-sm text-[var(--text-secondary)]">
						Your files live under your Aptos address. No accounts,
						no passwords.
					</p>
					<WalletButton />
				</GlassCard>
			</div>
		)
	}

	const address = addressToString(account.address)
	const onShelbynet = isShelbynet(network)
	const remainingBytes = Math.max(0, MAX_TOTAL_STORAGE_BYTES - totalSize)
	const overQuota = remainingBytes === 0

	return (
		<div className="space-y-6 py-8">
			<NetworkBanner />

			{!isShelbyConfigured() && (
				<GlassCard padded={false}>
					<div className="flex items-start gap-3 border-l-4 border-[var(--status-warning)] px-4 py-3 text-sm">
						<AlertTriangle
							size={18}
							className="shrink-0 text-[var(--status-warning)]"
						/>
						<div>
							<p className="text-[var(--text-primary)]">
								Shelby API key not configured
							</p>
							<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
								Set{" "}
								<code className="font-mono">
									NEXT_PUBLIC_SHELBY_API_KEY
								</code>{" "}
								in your{" "}
								<code className="font-mono">.env.local</code>{" "}
								file.
							</p>
						</div>
					</div>
				</GlassCard>
			)}

			<GlassCard padded={false}>
				<div className="flex items-start gap-3 border-l-4 border-[var(--accent-primary)] px-4 py-3 text-sm">
					<MessageCircle
						size={18}
						className="shrink-0 text-[var(--accent-primary)]"
					/>
					<div className="flex-1">
						<p className="text-[var(--text-primary)]">
							Need testnet tokens?
						</p>
						<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
							You need ShelbyUSD to upload. Join the Shelby
							Discord to request testnet tokens.
						</p>
					</div>
					<a
						href={DISCORD_URL}
						target="_blank"
						rel="noreferrer"
						className="shrink-0"
					>
						<Button size="sm" variant="outline">
							Discord
						</Button>
					</a>
				</div>
			</GlassCard>

			<StorageStats
				address={address}
				totalFiles={blobs.length}
				totalSize={totalSize}
			/>

			<UploadZone
				onFile={handleFile}
				disabled={!onShelbynet || overQuota}
				remainingBytes={remainingBytes}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">
						Your files
					</h2>
					<p className="text-xs text-[var(--text-secondary)]">
						{isLoading
							? "Loading…"
							: `${blobs.length} file${blobs.length === 1 ? "" : "s"}`}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => refetch()}
						aria-label="Refresh files"
						className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
					>
						<RefreshCw
							size={14}
							className={cn(isLoading && "animate-spin")}
						/>
					</button>
					<ViewToggle mode={view} onChange={setView} />
				</div>
			</div>

			{error && (
				<GlassCard>
					<p className="text-sm text-[var(--status-error)]">
						{error}
					</p>
				</GlassCard>
			)}

			{isLoading && blobs.length === 0 ? (
				<div className="flex justify-center py-16">
					<Spinner size={28} />
				</div>
			) : blobs.length === 0 ? (
				<EmptyState />
			) : view === "grid" ? (
				<BlobGrid
					blobs={blobs}
					address={address}
					onDeleteRequest={setDeleteTarget}
					deletingName={deletingName}
				/>
			) : (
				<BlobTable
					blobs={blobs}
					address={address}
					onDeleteRequest={setDeleteTarget}
					deletingName={deletingName}
				/>
			)}

			<UploadModal
				open={uploadOpen}
				state={uploadState}
				onClose={() => setUploadOpen(false)}
				onReset={resetUpload}
			/>

			<DeleteBlobModal
				open={Boolean(deleteTarget)}
				blobName={deleteTarget}
				pending={deletingName !== null}
				onConfirm={() => {
					if (deleteTarget) void remove(deleteTarget)
				}}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	)
}
