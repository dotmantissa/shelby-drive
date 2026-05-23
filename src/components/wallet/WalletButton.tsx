"use client"

import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AnimatePresence, motion } from "framer-motion"
import {
	Check,
	ChevronDown,
	Copy,
	LogOut,
	Wallet as WalletIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/ToastProvider"
import { copyToClipboard, truncate } from "@/lib/utils"
import { addressToString } from "@/types/shelby"
import { Button } from "../ui/Button"

export function WalletButton() {
	const { connect, disconnect, account, connected, wallets } = useWallet()
	const [open, setOpen] = useState(false)
	const [copied, setCopied] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const toast = useToast()

	useEffect(() => {
		if (!open) return
		const onClick = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setOpen(false)
			}
		}
		document.addEventListener("mousedown", onClick)
		return () => document.removeEventListener("mousedown", onClick)
	}, [open])

	if (!connected || !account) {
		return (
			<div className="relative" ref={dropdownRef}>
				<Button
					variant="outline"
					onClick={() => setOpen((o) => !o)}
					aria-haspopup="menu"
					aria-expanded={open}
				>
					<WalletIcon size={16} />
					Connect Wallet
					<ChevronDown size={14} />
				</Button>
				<AnimatePresence>
					{open && (
						<motion.div
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							className="glass absolute right-0 top-full z-50 mt-2 w-64 rounded-xl p-2"
							role="menu"
						>
							{wallets && wallets.length > 0 ? (
								wallets.map((w) => (
									<button
										key={w.name}
										type="button"
										role="menuitem"
										onClick={async () => {
											try {
												await connect(w.name)
												setOpen(false)
											} catch (err) {
												toast.error(
													"Failed to connect",
													err instanceof Error
														? err.message
														: undefined,
												)
											}
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
									>
										{w.icon ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={w.icon}
												alt=""
												className="h-5 w-5 rounded"
											/>
										) : (
											<WalletIcon
												size={16}
												className="text-[var(--accent-primary)]"
											/>
										)}
										<span className="flex-1">{w.name}</span>
									</button>
								))
							) : (
								<p className="px-3 py-2 text-xs text-[var(--text-secondary)]">
									No Aptos wallets detected. Install Petra or
									another Aptos wallet.
								</p>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		)
	}

	const address = addressToString(account.address)

	const handleCopy = async () => {
		const ok = await copyToClipboard(address)
		if (ok) {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		}
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-haspopup="menu"
				aria-expanded={open}
				className="glass glass-hover inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-mono text-[var(--text-primary)]"
			>
				<span
					className="h-2 w-2 animate-pulse-glow rounded-full bg-[var(--accent-primary)]"
					aria-hidden
				/>
				{truncate(address, 6, 4)}
				<ChevronDown size={14} className="text-[var(--text-secondary)]" />
			</button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						className="glass absolute right-0 top-full z-50 mt-2 w-72 rounded-xl p-3"
						role="menu"
					>
						<p className="px-2 pb-1 text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
							Wallet
						</p>
						<button
							type="button"
							onClick={handleCopy}
							className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left hover:bg-[var(--bg-elevated)]"
							role="menuitem"
						>
							<span className="truncate font-mono text-xs text-[var(--text-secondary)]">
								{truncate(address, 10, 8)}
							</span>
							{copied ? (
								<Check
									size={14}
									className="text-[var(--accent-primary)]"
								/>
							) : (
								<Copy
									size={14}
									className="text-[var(--text-tertiary)]"
								/>
							)}
						</button>
						<div className="my-2 h-px bg-[var(--bg-border)]" />
						<button
							type="button"
							onClick={() => {
								disconnect()
								setOpen(false)
							}}
							className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[var(--status-error)] hover:bg-[var(--bg-elevated)]"
							role="menuitem"
						>
							<LogOut size={14} />
							Disconnect
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
