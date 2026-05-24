"use client"

import {
	Archive,
	Braces,
	Check,
	Copy,
	Download,
	ExternalLink,
	File as FileIcon,
	FileText,
	Film,
	Image as ImageIcon,
	Link2,
	Music,
	Table,
	Trash2,
} from "lucide-react"
import { memo, useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { useDownload } from "@/hooks/useDownload"
import {
	getBlobUrl,
	getShelbyExplorerAccountUrl,
} from "@/lib/constants"
import type { ShelbyBlobMetadata } from "@/lib/shelby"
import {
	cn,
	copyToClipboard,
	formatBytes,
	formatExpiry,
	getFileType,
	truncateMiddle,
} from "@/lib/utils"
import { merkleRootToHex } from "@/types/shelby"

interface BlobCardProps {
	blob: ShelbyBlobMetadata
	address: string
	onDeleteRequest: (blobNameSuffix: string) => void
	isDeleting: boolean
}

const ICON_MAP = {
	FileText,
	Image: ImageIcon,
	Film,
	Music,
	Archive,
	Braces,
	Table,
	File: FileIcon,
} as const

type IconKey = keyof typeof ICON_MAP

function BlobCardInner({
	blob,
	address,
	onDeleteRequest,
	isDeleting,
}: BlobCardProps) {
	const { download, downloading } = useDownload()
	const [copied, setCopied] = useState<"merkle" | "url" | null>(null)

	// `blob.name` is "@<address>/<suffix>" — always use the suffix for
	// display and for constructing direct blob URLs.
	const displayName = blob.blobNameSuffix
	const type = getFileType(displayName)
	const Icon = ICON_MAP[(type.iconName as IconKey) ?? "File"] ?? FileIcon
	const isDownloading = downloading === displayName
	const merkleHex = merkleRootToHex(blob.blobMerkleRoot)

	const copy = async (text: string, key: "merkle" | "url") => {
		const ok = await copyToClipboard(text)
		if (ok) {
			setCopied(key)
			setTimeout(() => setCopied(null), 1500)
		}
	}

	return (
		<GlassCard hoverable className="flex h-full flex-col gap-4">
			<div className="flex items-start justify-between gap-3">
				<div
					className="flex h-12 w-12 items-center justify-center rounded-xl"
					style={{
						backgroundColor: `${type.colour}15`,
						color: type.colour,
					}}
				>
					<Icon size={22} />
				</div>
				<Badge colour={type.colour}>{type.label}</Badge>
			</div>

			<div className="min-w-0 flex-1">
				<p
					className="truncate text-sm font-medium text-[var(--text-primary)]"
					title={displayName}
				>
					{displayName}
				</p>
				<p className="mt-0.5 text-xs text-[var(--text-secondary)]">
					{formatBytes(blob.size)}
				</p>
				<p className="mt-2 text-xs text-[var(--text-tertiary)]">
					{formatExpiry(blob.expirationMicros)}
				</p>
				{blob.blobMerkleRoot && (
					<button
						type="button"
						onClick={() => copy(merkleHex, "merkle")}
						className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
						title="Copy merkle root"
					>
						{truncateMiddle(merkleHex, 8, 6)}
						{copied === "merkle" ? (
							<Check
								size={10}
								className="text-[var(--accent-primary)]"
							/>
						) : (
							<Copy size={10} />
						)}
					</button>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Button
					size="sm"
					onClick={() => download(displayName)}
					loading={isDownloading}
					disabled={isDownloading}
					className="flex-1"
				>
					{!isDownloading && <Download size={14} />}
					Download
				</Button>
				<a
					href={getShelbyExplorerAccountUrl(address)}
					target="_blank"
					rel="noreferrer"
					aria-label="View on Shelby Explorer"
					title="View on Shelby Explorer"
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg",
						"border border-[var(--bg-border)] text-[var(--text-secondary)]",
						"hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]",
					)}
				>
					<ExternalLink size={14} />
				</a>
				<button
					type="button"
					onClick={() =>
						copy(getBlobUrl(address, displayName), "url")
					}
					aria-label="Copy direct link"
					title="Copy direct link"
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg",
						"border border-[var(--bg-border)] text-[var(--text-secondary)]",
						"hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]",
					)}
				>
					{copied === "url" ? (
						<Check size={14} className="text-[var(--accent-primary)]" />
					) : (
						<Link2 size={14} />
					)}
				</button>
				<button
					type="button"
					onClick={() => onDeleteRequest(displayName)}
					disabled={isDeleting}
					aria-label="Delete file"
					title="Delete file"
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg",
						"border border-[var(--bg-border)] text-[var(--text-secondary)]",
						"hover:border-[var(--status-error)] hover:text-[var(--status-error)]",
						"disabled:opacity-50 disabled:cursor-not-allowed",
					)}
				>
					<Trash2 size={14} />
				</button>
			</div>
		</GlassCard>
	)
}

export const BlobCard = memo(BlobCardInner)
