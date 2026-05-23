"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AlertTriangle, Check, Copy } from "lucide-react"
import { useState } from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import { copyToClipboard } from "@/lib/utils"

const SHELBYNET_RPC = "https://api.shelbynet.aptoslabs.com/v1"
const SHELBYNET_FAUCET = "https://api.shelbynet.aptoslabs.com"
const SHELBYNET_NAME = "Shelbynet"

interface CopyRowProps {
	label: string
	value: string
}

function CopyRow({ label, value }: CopyRowProps) {
	const [copied, setCopied] = useState(false)
	const onCopy = async () => {
		const ok = await copyToClipboard(value)
		if (ok) {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		}
	}
	return (
		<div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--bg-border)] bg-[var(--bg-base)] px-3 py-2">
			<div className="min-w-0 flex-1">
				<p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
					{label}
				</p>
				<p className="truncate font-mono text-xs text-[var(--text-primary)]">
					{value}
				</p>
			</div>
			<button
				type="button"
				onClick={onCopy}
				aria-label={`Copy ${label}`}
				className="shrink-0 rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
			>
				{copied ? (
					<Check size={14} className="text-[var(--accent-primary)]" />
				) : (
					<Copy size={14} />
				)}
			</button>
		</div>
	)
}

export function NetworkBanner() {
	const { network } = useWallet()
	const networkName = network?.name?.toLowerCase()
	const isOnShelbynet = networkName === "shelbynet"
	if (isOnShelbynet) return null

	const currentLabel = network?.name ?? "Unknown"

	return (
		<GlassCard padded={false}>
			<div className="border-l-4 border-[var(--status-warning)] p-4">
				<div className="mb-3 flex items-start gap-3">
					<AlertTriangle
						size={20}
						className="shrink-0 text-[var(--status-warning)]"
					/>
					<div className="flex-1">
						<p className="text-sm font-semibold text-[var(--text-primary)]">
							Wallet is on{" "}
							<span className="font-mono text-[var(--status-warning)]">
								{currentLabel}
							</span>{" "}
							— switch to Shelbynet to upload
						</p>
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							The Shelby Move module only exists on{" "}
							<strong>Shelbynet</strong>. Submitting from any other
							network (including Aptos Testnet) fails with a generic
							simulation error. In Petra: Settings → Network → Add
							Custom Network, then enter the values below.
						</p>
					</div>
				</div>

				<div className="grid gap-2 sm:grid-cols-2">
					<CopyRow label="Network name" value={SHELBYNET_NAME} />
					<CopyRow label="RPC URL" value={SHELBYNET_RPC} />
					<CopyRow label="Faucet URL" value={SHELBYNET_FAUCET} />
					<CopyRow label="Chain ID" value="auto-detect" />
				</div>
			</div>
		</GlassCard>
	)
}
