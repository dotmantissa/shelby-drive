"use client"

import {
	ArrowRight,
	BookOpenText,
	Coins,
	Cpu,
	FileUp,
	Globe,
	Link2,
	Lock,
	Network,
	ShieldCheck,
	Wallet,
	Zap,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import { APP_DESCRIPTION, APP_TAGLINE, SHELBY_DOCS_URL } from "@/lib/constants"

export default function LandingPage() {
	const router = useRouter()

	const goToDashboard = () => router.push("/dashboard")

	return (
		<div className="flex flex-col gap-24 py-12 md:py-20">
			<Hero onLaunch={goToDashboard} />
			<HowItWorks />
			<Features />
		</div>
	)
}

function Hero({ onLaunch }: { onLaunch: () => void }) {
	return (
		<section className="flex flex-col items-center text-center">
			<h1 className="animate-rise-in max-w-3xl text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
				{APP_TAGLINE}
			</h1>
			<p className="animate-rise-in animation-delay-100 mt-5 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
				{APP_DESCRIPTION}
			</p>

			<div className="animate-rise-in animation-delay-200 mt-8 flex flex-col items-center gap-3 sm:flex-row">
				<Button size="lg" onClick={onLaunch} title="Open dashboard">
					Launch App <ArrowRight size={16} />
				</Button>
				<a href={SHELBY_DOCS_URL} target="_blank" rel="noreferrer">
					<Button size="lg" variant="outline">
						<BookOpenText size={16} /> View Docs
					</Button>
				</a>
			</div>

			<div className="animate-fade-in animation-delay-400 mt-8 flex flex-wrap items-center justify-center gap-3">
				<Badge colour="#00D4A8" variant="outline">
					<Zap size={12} /> Sub-second reads
				</Badge>
				<Badge colour="#00D4A8" variant="outline">
					<ShieldCheck size={12} /> Cryptographic proofs
				</Badge>
				<Badge colour="#00D4A8" variant="outline">
					<Network size={12} /> Aptos Shelbynet
				</Badge>
			</div>
		</section>
	)
}

const STEPS = [
	{
		n: "01",
		icon: Wallet,
		title: "Connect Wallet",
		body: "Use Petra or any compatible Aptos wallet to sign in. No accounts, no passwords.",
	},
	{
		n: "02",
		icon: FileUp,
		title: "Upload File",
		body: "Your file is encrypted locally, Clay erasure-coded, and committed on Aptos before reaching storage.",
	},
	{
		n: "03",
		icon: Globe,
		title: "Access Anywhere",
		body: "Sign with the owning wallet to decrypt files locally for download or browser preview.",
	},
]

function HowItWorks() {
	return (
		<section>
			<div className="mb-10 text-center">
				<h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
					How it works
				</h2>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Three steps to take your storage on-chain
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				{STEPS.map((s) => (
					<GlassCard key={s.n} hoverable className="relative">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-dim)] font-mono text-xs font-semibold text-[var(--accent-primary)]">
							{s.n}
						</div>
						<s.icon
							size={22}
							className="mt-6 text-[var(--accent-primary)]"
						/>
						<h3 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
							{s.title}
						</h3>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{s.body}
						</p>
					</GlassCard>
				))}
			</div>
		</section>
	)
}

const FEATURES = [
	{
		icon: Zap,
		title: "Sub-second reads",
		body: "Dedicated fiber backbone, not the public internet.",
	},
	{
		icon: Lock,
		title: "On-chain verification",
		body: "Every file cryptographically committed to Aptos.",
	},
	{
		icon: Coins,
		title: "Pay-per-use",
		body: "Only pay for what you store and serve — no minimums.",
	},
	{
		icon: Link2,
		title: "Chain-agnostic",
		body: "Shelby works across Ethereum, Solana, and Aptos.",
	},
]

function Features() {
	return (
		<section>
			<div className="mb-10 text-center">
				<h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
					Why Shelby
				</h2>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					Cloud-grade performance with Web3-native control
				</p>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{FEATURES.map((f) => (
					<GlassCard key={f.title} hoverable>
						<div className="flex items-start gap-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent-primary)]">
								<f.icon size={20} />
							</div>
							<div>
								<h3 className="font-semibold text-[var(--text-primary)]">
									{f.title}
								</h3>
								<p className="mt-1 text-sm text-[var(--text-secondary)]">
									{f.body}
								</p>
							</div>
						</div>
					</GlassCard>
				))}
			</div>

			<div className="mt-10 flex justify-center">
				<Link href="/dashboard">
					<Button size="lg">
						<Cpu size={16} /> Open Drive
					</Button>
				</Link>
			</div>
		</section>
	)
}
