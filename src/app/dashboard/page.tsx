"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import {
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
	Coins,
	ExternalLink,
	RefreshCw,
	ShieldCheck,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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
import { useDownload } from "@/hooks/useDownload"
import { useUpload } from "@/hooks/useUpload"
import {
	getShelbyFaucetUrl,
	isShelbyConfigured,
	isShelbynet,
	MAX_TOTAL_STORAGE_BYTES,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/types/shelby"
import { addressToString } from "@/types/shelby"

export default function DashboardPage() {
	const { account, connected, network } = useWallet()
	const [view, setView] = useState<ViewMode>("grid")
	const [uploadOpen, setUploadOpen] = useState(false)
	const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
	const [page, setPage] = useState(0)
	const toast = useToast()

	const {
		blobs,
		isLoading,
		error,
		refetch,
		totalSize,
		totalFiles,
		pageCount,
	} = useBlobs(page)
	const existingBlobNames = useMemo(
		() => new Set(blobs.map((blob) => blob.blobNameSuffix)),
		[blobs],
	)
	const {
		state: uploadState,
		upload,
		reset: resetUpload,
	} = useUpload({
		totalSizeBytes: totalSize,
		existingBlobNames,
		onSuccess: () => {
			setPage(0)
			return refetch()
		},
	})
	const { retrieve, retrieving } = useDownload()
	const { remove, deleting: deletingName } = useDelete({
		onSuccess: () => {
			toast.success("File deleted")
			setDeleteTarget(null)
			return refetch()
		},
		onError: (message) => {
			toast.error("Delete failed", message)
			console.error("File deletion failed", message)
		},
	})

	useEffect(() => {
		if (page >= pageCount) {
			setPage(Math.max(0, pageCount - 1))
		}
	}, [page, pageCount])

	const handleFile = (file: File) => {
		setUploadOpen(true)
		void upload(file)
	}

	if (!connected || !account) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center py-12">
				<GlassCard className="flex max-w-md flex-col items-center gap-4 text-center">
					<h2 className="text-xl font-semibold text-[var(--text-primary)]">
						Connect your wallet to access your Drive
					</h2>
					<p className="text-sm text-[var(--text-secondary)]">
						Connect the Aptos wallet that owns your stored files.
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
			<div className="flex justify-end">
				<WalletButton />
			</div>
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
				<div className="flex flex-col gap-3 border-l-4 border-[var(--accent-primary)] px-4 py-3 text-sm sm:flex-row sm:items-center">
					<div className="flex min-w-0 flex-1 items-start gap-3">
						<Coins
							size={18}
							className="shrink-0 text-[var(--accent-primary)]"
						/>
						<div>
							<p className="text-[var(--text-primary)]">
								Fund this wallet
							</p>
							<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
								Use the official forms to request test APT for
								transaction fees and ShelbyUSD for storage.
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2 pl-7 sm:pl-0">
						<a
							href={getShelbyFaucetUrl(address, "aptos")}
							target="_blank"
							rel="noreferrer"
						>
							<Button size="sm" variant="outline">
								Get test APT
								<ExternalLink size={14} />
							</Button>
						</a>
						<a
							href={getShelbyFaucetUrl(address, "shelbyusd")}
							target="_blank"
							rel="noreferrer"
						>
							<Button size="sm" variant="outline">
								Get ShelbyUSD
								<ExternalLink size={14} />
							</Button>
						</a>
					</div>
				</div>
			</GlassCard>

			<StorageStats
				address={address}
				totalFiles={totalFiles}
				totalSize={totalSize}
			/>

			<UploadZone
				onFile={handleFile}
				disabled={!onShelbynet || overQuota}
				remainingBytes={remainingBytes}
			/>

			<div className="flex items-start gap-3 border-l-2 border-[var(--accent-primary)] px-4 py-1">
				<ShieldCheck
					size={18}
					className="mt-0.5 shrink-0 text-[var(--accent-primary)]"
				/>
				<div>
					<p className="text-sm font-medium text-[var(--text-primary)]">
						Encrypted file format
					</p>
					<p className="mt-1 max-w-3xl text-xs text-[var(--text-secondary)]">
						Uploads are stored as SDBLOB01 AES-256-GCM ciphertext.
						Anyone can inspect public metadata and encrypted bytes,
						but file contents require the key derived from the
						owning wallet's signature.
					</p>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">
						Your files
					</h2>
					<p className="text-xs text-[var(--text-secondary)]">
						{isLoading
							? "Loading…"
							: `${totalFiles} file${totalFiles === 1 ? "" : "s"}`}
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
					onRetrieve={retrieve}
					retrieving={retrieving}
				/>
			) : (
				<BlobTable
					blobs={blobs}
					address={address}
					onDeleteRequest={setDeleteTarget}
					deletingName={deletingName}
					onRetrieve={retrieve}
					retrieving={retrieving}
				/>
			)}

			{pageCount > 1 && (
				<nav
					aria-label="File pages"
					className="flex items-center justify-center gap-3"
				>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((current) => Math.max(0, current - 1))
						}
						disabled={page === 0 || isLoading}
					>
						<ChevronLeft size={14} />
						Previous
					</Button>
					<span className="min-w-24 text-center text-xs text-[var(--text-secondary)]">
						Page {page + 1} of {pageCount}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							setPage((current) =>
								Math.min(pageCount - 1, current + 1),
							)
						}
						disabled={page >= pageCount - 1 || isLoading}
					>
						Next
						<ChevronRight size={14} />
					</Button>
				</nav>
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
