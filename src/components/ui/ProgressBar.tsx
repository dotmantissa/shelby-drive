import { cn } from "@/lib/utils"

interface ProgressBarProps {
	value: number
	className?: string
	indeterminate?: boolean
}

export function ProgressBar({
	value,
	className,
	indeterminate = false,
}: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value))
	return (
		<div
			className={cn(
				"relative h-2 w-full overflow-hidden rounded-full",
				"bg-[var(--bg-elevated)]",
				className,
			)}
			role="progressbar"
			aria-valuenow={clamped}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			{indeterminate ? (
				<div className="absolute inset-y-0 left-0 w-1/3 animate-pulse rounded-full bg-[var(--accent-primary)]" />
			) : (
				<div
					style={{ width: `${clamped}%` }}
					className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-500 ease-out"
				/>
			)}
		</div>
	)
}
