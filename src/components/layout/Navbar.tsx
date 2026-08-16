"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

function Wordmark() {
	return (
		<Link
			href="/"
			aria-label="Shelby DRIVE home"
			className="flex items-center gap-1 font-semibold tracking-tight"
		>
			<span className="text-lg text-[var(--text-primary)]">Shelby</span>
			<span className="text-lg text-[var(--accent-primary)]">
				| DRIVE
			</span>
		</Link>
	)
}

export function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40 w-full">
			<div className="glass border-b border-[var(--bg-border)]">
				<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<Wordmark />

					<nav className="hidden items-center gap-6 md:flex">
						<Link
							href="/dashboard"
							className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
						>
							Dashboard
						</Link>
						<a
							href="https://docs.shelby.xyz"
							target="_blank"
							rel="noreferrer"
							className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
						>
							Docs
						</a>
					</nav>

					<button
						type="button"
						className="rounded-md p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] md:hidden"
						onClick={() => setMobileOpen((o) => !o)}
						aria-label="Toggle menu"
						aria-expanded={mobileOpen}
					>
						{mobileOpen ? <X size={20} /> : <Menu size={20} />}
					</button>
				</div>

				{mobileOpen && (
					<div className="border-t border-[var(--bg-border)] md:hidden">
						<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4">
							<Link
								href="/dashboard"
								onClick={() => setMobileOpen(false)}
								className="text-sm text-[var(--text-secondary)]"
							>
								Dashboard
							</Link>
							<a
								href="https://docs.shelby.xyz"
								target="_blank"
								rel="noreferrer"
								className="text-sm text-[var(--text-secondary)]"
							>
								Docs
							</a>
						</div>
					</div>
				)}
			</div>
		</header>
	)
}
