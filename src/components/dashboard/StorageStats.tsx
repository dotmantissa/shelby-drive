"use client"

import { Check, Copy, Database, Files } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { GlassCard } from "@/components/ui/GlassCard"
import {
	copyToClipboard,
	formatBytes,
	truncate,
} from "@/lib/utils"

interface StorageStatsProps {
	address: string
	totalFiles: number
	totalSize: number
}

export function StorageStats({
	address,
	totalFiles,
	totalSize,
}: StorageStatsProps) {
	const [copied, setCopied] = useState(false)

	const onCopy = async () => {
		const ok = await copyToClipboard(address)
		if (ok) {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		}
	}

	return (
		<GlassCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div className="flex flex-wrap items-center gap-x-8 gap-y-4">
				<Stat
					icon={<Files size={16} />}
					label="Total Files"
					value={String(totalFiles)}
				/>
				<Stat
					icon={<Database size={16} />}
					label="Total Storage"
					value={formatBytes(totalSize)}
				/>
				<div className="hidden md:block">
					<Badge colour="#00D4A8" variant="outline">
						Aptos Testnet
					</Badge>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
					Wallet
				</span>
				<button
					type="button"
					onClick={onCopy}
					className="inline-flex items-center gap-2 rounded-lg border border-[var(--bg-border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-mono text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
					aria-label="Copy wallet address"
				>
					{truncate(address, 8, 6)}
					{copied ? (
						<Check size={12} className="text-[var(--accent-primary)]" />
					) : (
						<Copy size={12} />
					)}
				</button>
			</div>
		</GlassCard>
	)
}

function Stat({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode
	label: string
	value: string
}) {
	return (
		<div>
			<div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
				{icon}
				{label}
			</div>
			<p className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">
				{value}
			</p>
		</div>
	)
}
