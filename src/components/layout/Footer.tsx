import { Github, MessageCircle } from "lucide-react"
import { SHELBY_DOCS_URL, SHELBY_EXPLORER_URL } from "@/lib/constants"

export function Footer() {
	return (
		<footer className="relative mt-24">
			<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50" />
			<div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
				<div>
					<div className="flex items-center gap-1 font-semibold tracking-tight">
						<span className="text-[var(--text-primary)]">
							Shelby
						</span>
						<span className="text-[var(--accent-primary)]">
							| DRIVE
						</span>
					</div>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">
						Built on Shelby Protocol
					</p>
				</div>

				<nav className="flex flex-wrap items-center gap-x-6 gap-y-2 md:justify-center">
					<a
						href={SHELBY_DOCS_URL}
						target="_blank"
						rel="noreferrer"
						className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						Docs
					</a>
					<a
						href="https://discord.gg/shelby"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						<MessageCircle size={14} /> Discord
					</a>
					<a
						href={SHELBY_EXPLORER_URL}
						target="_blank"
						rel="noreferrer"
						className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						Explorer
					</a>
					<a
						href="https://github.com/shelby-protocol"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					>
						<Github size={14} /> GitHub
					</a>
				</nav>

				<p className="text-sm text-[var(--text-secondary)] md:text-right">
					Powered by Aptos + Jump Crypto
				</p>
			</div>
		</footer>
	)
}
