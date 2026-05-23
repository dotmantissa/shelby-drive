"use client"

import { CloudOff } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"

interface EmptyStateProps {
	onUploadClick?: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
	return (
		<GlassCard className="flex flex-col items-center gap-4 py-12 text-center">
			<div className="relative flex h-16 w-16 items-center justify-center">
				<div className="absolute inset-0 animate-pulse-glow rounded-full bg-[var(--accent-dim)]" />
				<CloudOff size={32} className="relative text-[var(--accent-primary)]" />
			</div>
			<div>
				<h3 className="text-lg font-semibold text-[var(--text-primary)]">
					Your Drive is empty
				</h3>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Upload your first file to get started
				</p>
			</div>
			{onUploadClick && (
				<Button onClick={onUploadClick}>Upload a File</Button>
			)}
		</GlassCard>
	)
}
