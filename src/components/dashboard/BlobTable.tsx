"use client"

import {
	Archive,
	Braces,
	Download,
	ExternalLink,
	File as FileIcon,
	FileText,
	Film,
	Image as ImageIcon,
	Link2,
	Music,
	Table,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { useToast } from "@/components/ui/ToastProvider"
import { useDownload } from "@/hooks/useDownload"
import {
	getBlobUrl,
	getShelbyExplorerAccountUrl,
} from "@/lib/constants"
import type { ShelbyBlobMetadata } from "@/lib/shelby"
import {
	copyToClipboard,
	formatBytes,
	formatExpiry,
	getFileType,
} from "@/lib/utils"

interface BlobTableProps {
	blobs: ShelbyBlobMetadata[]
	address: string
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

export function BlobTable({ blobs, address }: BlobTableProps) {
	const { download, downloading } = useDownload()
	const toast = useToast()

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
							const type = getFileType(blob.name)
							const Icon =
								ICON_MAP[(type.iconName as IconKey) ?? "File"] ??
								FileIcon
							const isDownloading = downloading === blob.name
							return (
								<tr
									key={blob.name}
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
											<span
												className="truncate text-[var(--text-primary)]"
												title={blob.name}
											>
												{blob.name}
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
												onClick={() => download(blob.name)}
												loading={isDownloading}
											>
												{!isDownloading && (
													<Download size={12} />
												)}
												Download
											</Button>
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
												onClick={async () => {
													const ok =
														await copyToClipboard(
															getBlobUrl(
																address,
																blob.name,
															),
														)
													if (ok) {
														toast.success(
															"Link copied",
														)
													}
												}}
												aria-label="Copy direct link"
												className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
											>
												<Link2 size={14} />
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
