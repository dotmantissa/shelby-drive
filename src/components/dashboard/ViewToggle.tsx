"use client"

import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/types/shelby"

interface ViewToggleProps {
	mode: ViewMode
	onChange: (mode: ViewMode) => void
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
	return (
		<div
			role="tablist"
			aria-label="View mode"
			className="inline-flex rounded-lg border border-[var(--bg-border)] bg-[var(--bg-surface)] p-0.5"
		>
			<button
				type="button"
				role="tab"
				aria-selected={mode === "grid"}
				onClick={() => onChange("grid")}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
					mode === "grid"
						? "bg-[var(--bg-elevated)] text-[var(--accent-primary)]"
						: "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
				)}
				aria-label="Grid view"
			>
				<LayoutGrid size={16} />
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={mode === "list"}
				onClick={() => onChange("list")}
				className={cn(
					"flex h-8 w-8 items-center justify-center rounded-md transition-colors",
					mode === "list"
						? "bg-[var(--bg-elevated)] text-[var(--accent-primary)]"
						: "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]",
				)}
				aria-label="List view"
			>
				<List size={16} />
			</button>
		</div>
	)
}
