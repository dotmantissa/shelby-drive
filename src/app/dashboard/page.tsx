"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AlertTriangle, MessageCircle, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { BlobGrid } from "@/components/dashboard/BlobGrid"
import { BlobTable } from "@/components/dashboard/BlobTable"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { NetworkBanner } from "@/components/dashboard/NetworkBanner"
import { StorageStats } from "@/components/dashboard/StorageStats"
import { ViewToggle } from "@/components/dashboard/ViewToggle"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { Spinner } from "@/components/ui/Spinner"
import { UploadModal } from "@/components/upload/UploadModal"
import { UploadZone } from "@/components/upload/UploadZone"
import { WalletButton } from "@/components/wallet/WalletButton"
import { useBlobs } from "@/hooks/useBlobs"
import { useShelbyClient } from "@/hooks/useShelbyClient"
import { useUpload } from "@/hooks/useUpload"
import {
	DISCORD_URL,
	isShelbyConfigured,
	isShelbynet,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { addressToString } from "@/types/shelby"
import type { ViewMode } from "@/types/shelby"

export default function DashboardPage() {
	const { account, connected, network } = useWallet()
	const [view, setView] = useState<ViewMode>("grid")
	const [modalOpen, setModalOpen] = useState(false)
	const { blobs, isLoading, error, refetch, totalSize } = useBlobs()
	const { state, upload, reset } = useUpload()
	const { error: sdkError } = useShelbyClient()

	const handleFile = (file: File) => {
		setModalOpen(true)
		void upload(file)
	}

	useEffect(() => {
		if (state.step === "success") {
			refetch()
		}
	}, [state.step, refetch])

	if (!connected || !account) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center py-12">
				<GlassCard className="flex max-w-md flex-col items-center gap-4 text-center">
					<h2 className="text-xl font-semibold text-[var(--text-primary)]">
						Connect your wallet to access your Drive
					</h2>
					<p className="text-sm text-[var(--text-secondary)]">
						Your files live under your Aptos address. No accounts, no
						passwords.
					</p>
					<WalletButton />
				</GlassCard>
			</div>
		)
	}

	const address = addressToString(account.address)
	const isOnShelbynet = isShelbynet(network)

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

			{sdkError && (
				<GlassCard padded={false}>
					<div className="flex items-start gap-3 border-l-4 border-[var(--status-error)] px-4 py-3 text-sm">
						<AlertTriangle
							size={18}
							className="shrink-0 text-[var(--status-error)]"
						/>
						<p className="text-[var(--text-primary)]">
							Failed to load Shelby SDK: {sdkError}
						</p>
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
							You need ShelbyUSD to upload. Join the Shelby Discord
							to request testnet tokens.
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

			<UploadZone onFile={handleFile} disabled={!isOnShelbynet} />

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
						onClick={refetch}
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
					<p className="text-sm text-[var(--status-error)]">{error}</p>
				</GlassCard>
			)}

			{isLoading && blobs.length === 0 ? (
				<div className="flex justify-center py-16">
					<Spinner size={28} />
				</div>
			) : blobs.length === 0 ? (
				<EmptyState />
			) : view === "grid" ? (
				<BlobGrid blobs={blobs} address={address} />
			) : (
				<BlobTable blobs={blobs} address={address} />
			)}

			<UploadModal
				open={modalOpen}
				state={state}
				onClose={() => setModalOpen(false)}
				onReset={reset}
				onCompleted={refetch}
			/>
		</div>
	)
}
