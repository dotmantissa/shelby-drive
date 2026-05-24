"use client"

import { Network } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AlertTriangle, ArrowRight, Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { useToast } from "@/components/ui/ToastProvider"
import { isShelbynet, SHELBYNET } from "@/lib/constants"
import { copyToClipboard } from "@/lib/utils"

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
	const { network, changeNetwork, wallet } = useWallet()
	const toast = useToast()
	const [switching, setSwitching] = useState(false)
	const [manualMode, setManualMode] = useState(false)

	const networkName = network?.name
	const isOnShelbynet = isShelbynet(network)
	if (isOnShelbynet) return null

	const currentLabel = networkName ?? "Unknown"
	const walletName = wallet?.name ?? "your wallet"

	const handleSwitch = async () => {
		setSwitching(true)
		try {
			const result = await changeNetwork(Network.SHELBYNET)
			if (result?.success === false) {
				const reason = result.reason ?? "Wallet declined the switch"
				toast.error("Couldn't switch network", reason)
				setManualMode(true)
			} else {
				toast.success(`Switched ${walletName} to Shelbynet`)
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			toast.error(
				"Couldn't switch network automatically",
				`${walletName} doesn't support adding Shelbynet — add it manually below.`,
			)
			console.error("changeNetwork failed:", msg)
			setManualMode(true)
		} finally {
			setSwitching(false)
		}
	}

	return (
		<GlassCard padded={false}>
			<div className="border-l-4 border-[var(--status-warning)] p-4">
				<div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start">
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
							<strong>Shelbynet</strong>. Submitting from any
							other network fails with a generic simulation
							error.
						</p>
					</div>
					<Button
						onClick={handleSwitch}
						loading={switching}
						disabled={switching}
						size="md"
						className="shrink-0"
					>
						{!switching && <ArrowRight size={14} />}
						Switch to Shelbynet
					</Button>
				</div>

				{manualMode && (
					<>
						<p className="mb-2 text-xs text-[var(--text-secondary)]">
							{walletName} couldn't add the network automatically.
							Add it manually: in your wallet → Settings →
							Network → Add Custom Network, then paste these
							values.
						</p>
						<div className="grid gap-2 sm:grid-cols-2">
							<CopyRow
								label="Network name"
								value={SHELBYNET.name}
							/>
							<CopyRow
								label="Chain ID"
								value={String(SHELBYNET.chainId)}
							/>
							<CopyRow
								label="RPC / Full node URL"
								value={SHELBYNET.fullnodeUrl}
							/>
							<CopyRow
								label="Faucet URL"
								value={SHELBYNET.faucetUrl}
							/>
						</div>
					</>
				)}

				{!manualMode && (
					<button
						type="button"
						onClick={() => setManualMode(true)}
						className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] underline underline-offset-2"
					>
						Or show manual setup instructions
					</button>
				)}
			</div>
		</GlassCard>
	)
}
