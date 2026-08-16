"use client"

import {
	Archive,
	Braces,
	Download,
	ExternalLink,
	Eye,
	File as FileIcon,
	FileText,
	Film,
	Image as ImageIcon,
	LockKeyhole,
	Music,
	Table,
	Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import type { RetrievalMode } from "@/hooks/useDownload"
import { getShelbyExplorerAccountUrl } from "@/lib/constants"
import type { ShelbyBlobMetadata } from "@/lib/shelby"
import { formatBytes, formatExpiry, getFileType } from "@/lib/utils"

interface BlobTableProps {
	blobs: ShelbyBlobMetadata[]
	address: string
	onDeleteRequest: (blobNameSuffix: string) => void
	deletingName: string | null
	onRetrieve: (blobName: string, mode: RetrievalMode) => void
	retrieving: { blobName: string; mode: RetrievalMode } | null
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

export function BlobTable({
	blobs,
	address,
	onDeleteRequest,
	deletingName,
	onRetrieve,
	retrieving,
}: BlobTableProps) {
	return (
		<GlassCard padded={false} className="overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-[var(--bg-border)] text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
							<th className="px-4 py-3 font-medium">Name</th>
							<th className="px-4 py-3 font-medium">Size</th>
							<th className="px-4 py-3 font-medium">Expires</th>
							<th className="px-4 py-3 font-medium text-right">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{blobs.map((blob) => {
							const name = blob.blobNameSuffix
							const type = getFileType(name)
							const Icon =
								ICON_MAP[
									(type.iconName as IconKey) ?? "File"
								] ?? FileIcon
							const isRetrieving = retrieving?.blobName === name
							const isDeleting = deletingName === name
							return (
								<tr
									key={name}
									className="border-b border-[var(--bg-border)] transition-colors last:border-0 hover:bg-[var(--bg-elevated)]"
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div
												className="flex h-8 w-8 items-center justify-center rounded-lg"
												style={{
													backgroundColor: `${type.colour}15`,
													color: type.colour,
												}}
											>
												<Icon size={14} />
											</div>
											{blob.encryption ===
												"AES_GCM_V1" && (
												<LockKeyhole
													size={13}
													className="shrink-0 text-[var(--accent-primary)]"
													aria-label="Encrypted"
												/>
											)}
											<span
												className="truncate text-[var(--text-primary)]"
												title={name}
											>
												{name}
											</span>
										</div>
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">
										{formatBytes(blob.size)}
									</td>
									<td className="px-4 py-3 text-xs text-[var(--text-tertiary)]">
										{formatExpiry(blob.expirationMicros)}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center justify-end gap-2">
											<Button
												size="sm"
												onClick={() =>
													onRetrieve(name, "download")
												}
												loading={
													isRetrieving &&
													retrieving?.mode ===
														"download"
												}
												disabled={isRetrieving}
											>
												{!(
													isRetrieving &&
													retrieving?.mode ===
														"download"
												) && <Download size={12} />}
												Download
											</Button>
											<button
												type="button"
												onClick={() =>
													onRetrieve(name, "view")
												}
												disabled={isRetrieving}
												aria-label="View file"
												title="View file"
												className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
											>
												<Eye size={14} />
											</button>
											<a
												href={getShelbyExplorerAccountUrl(
													address,
												)}
												target="_blank"
												rel="noreferrer"
												aria-label="View on Shelby Explorer"
												className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
											>
												<ExternalLink size={14} />
											</a>
											<button
												type="button"
												onClick={() =>
													onDeleteRequest(name)
												}
												disabled={isDeleting}
												aria-label="Delete file"
												className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-[var(--status-error)] hover:text-[var(--status-error)] disabled:opacity-50 disabled:cursor-not-allowed"
											>
												<Trash2 size={14} />
											</button>
										</div>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</GlassCard>
	)
}
