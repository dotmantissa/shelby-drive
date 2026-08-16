"use client"

import { Network } from "@aptos-labs/ts-sdk"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { useToast } from "@/components/ui/ToastProvider"
import { isShelbynet, SHELBYNET } from "@/lib/constants"

export function NetworkBanner() {
	const { network, wallet } = useWallet()
	const toast = useToast()
	const [switching, setSwitching] = useState(false)

	const networkName = network?.name
	const isOnShelbynet = isShelbynet(network)
	if (isOnShelbynet) return null

	const currentLabel = networkName ?? "Unknown"
	const walletName = wallet?.name ?? "your wallet"

	const handleSwitch = async () => {
		setSwitching(true)
		try {
			const changeNetworkFeature = wallet?.features["aptos:changeNetwork"]
			if (!changeNetworkFeature) {
				throw new Error(
					`${walletName} does not support automatic network switching`,
				)
			}
			const response = await changeNetworkFeature.changeNetwork({
				name: Network.SHELBYNET,
				chainId: SHELBYNET.chainId,
				url: SHELBYNET.fullnodeUrl,
			})
			if (response.status === "Rejected") {
				throw new Error("Wallet declined the network switch")
			}
			if (!response.args.success) {
				const reason =
					response.args.reason ?? "Wallet could not switch networks"
				toast.error("Couldn't switch network", reason)
			} else {
				toast.success(`Switched ${walletName} to Shelbynet`)
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err)
			toast.error(
				"Couldn't switch to Shelbynet",
				msg || `${walletName} rejected the network request.`,
			)
			console.error("Shelbynet network switch failed:", err)
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
							. Switch to Shelbynet to upload.
						</p>
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							The Shelby Move module only exists on{" "}
							<strong>Shelbynet</strong>. Submitting from any
							other network fails with a generic simulation error.
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
			</div>
		</GlassCard>
	)
}
