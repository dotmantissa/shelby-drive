"use client"

import type { ShelbyBlobMetadata } from "@/lib/shelby"
import { BlobCard } from "./BlobCard"

interface BlobGridProps {
	blobs: ShelbyBlobMetadata[]
	address: string
}

export function BlobGrid({ blobs, address }: BlobGridProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{blobs.map((blob) => (
				<BlobCard key={blob.name} blob={blob} address={address} />
			))}
		</div>
	)
}
