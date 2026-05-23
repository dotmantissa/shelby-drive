"use client"

import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UploadStep } from "@/hooks/useUpload"

interface UploadStepsProps {
	step: UploadStep
}

const STEPS: Array<{
	key: UploadStep
	label: string
	order: number
}> = [
	{ key: "encoding", label: "Encoding", order: 1 },
	{ key: "registering", label: "Registering", order: 2 },
	{ key: "uploading", label: "Uploading", order: 3 },
]

function stepOrder(step: UploadStep): number {
	if (step === "idle") return 0
	if (step === "encoding") return 1
	if (step === "registering") return 2
	if (step === "uploading") return 3
	if (step === "success") return 4
	return 0
}

export function UploadSteps({ step }: UploadStepsProps) {
	const current = stepOrder(step)
	const isError = step === "error"

	return (
		<div className="flex items-center justify-between gap-2">
			{STEPS.map((s, idx) => {
				const isActive = current === s.order
				const isComplete = current > s.order
				return (
					<div key={s.key} className="flex flex-1 items-center">
						<div className="flex flex-col items-center gap-2">
							<div
								className={cn(
									"flex h-9 w-9 items-center justify-center rounded-full border transition-all",
									isComplete &&
										"border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-base)]",
									isActive &&
										!isError &&
										"border-[var(--accent-primary)] bg-[var(--accent-dim)] text-[var(--accent-primary)] animate-pulse-glow",
									!isActive &&
										!isComplete &&
										"border-[var(--bg-border)] text-[var(--text-tertiary)]",
									isError &&
										isActive &&
										"border-[var(--status-error)] text-[var(--status-error)]",
								)}
							>
								{isComplete ? (
									<Check size={16} />
								) : isActive && !isError ? (
									<Loader2 size={16} className="animate-spin" />
								) : (
									<span className="text-xs font-semibold">
										{`0${s.order}`}
									</span>
								)}
							</div>
							<span
								className={cn(
									"text-xs",
									(isActive || isComplete) &&
										!isError &&
										"text-[var(--text-primary)]",
									(!isActive && !isComplete) ||
										(isError && isActive)
										? "text-[var(--text-tertiary)]"
										: "",
								)}
							>
								{s.label}
							</span>
						</div>
						{idx < STEPS.length - 1 && (
							<div
								className={cn(
									"mx-2 h-px flex-1 transition-colors",
									current > s.order
										? "bg-[var(--accent-primary)]"
										: "bg-[var(--bg-border)]",
								)}
							/>
						)}
					</div>
				)
			})}
		</div>
	)
}
