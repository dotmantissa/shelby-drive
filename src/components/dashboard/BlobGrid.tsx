"use client"

import type { RetrievalMode } from "@/hooks/useDownload"
import type { ShelbyBlobMetadata } from "@/lib/shelby"
import { BlobCard } from "./BlobCard"

interface BlobGridProps {
	blobs: ShelbyBlobMetadata[]
	address: string
	onDeleteRequest: (blobNameSuffix: string) => void
	deletingName: string | null
	onRetrieve: (blobName: string, mode: RetrievalMode) => void
	retrieving: { blobName: string; mode: RetrievalMode } | null
}

export function BlobGrid({
	blobs,
	address,
	onDeleteRequest,
	deletingName,
	onRetrieve,
	retrieving,
}: BlobGridProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{blobs.map((blob) => (
				<BlobCard
					key={blob.blobNameSuffix}
					blob={blob}
					address={address}
					onDeleteRequest={onDeleteRequest}
					isDeleting={deletingName === blob.blobNameSuffix}
					onRetrieve={onRetrieve}
					retrieving={retrieving}
				/>
			))}
		</div>
	)
}
