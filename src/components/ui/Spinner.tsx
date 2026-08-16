import { cn } from "@/lib/utils"

interface SpinnerProps {
	size?: number
	className?: string
}

export function Spinner({ size = 20, className }: SpinnerProps) {
	return (
		<output
			aria-label="Loading"
			style={{
				width: size,
				height: size,
				borderWidth: size > 24 ? 3 : 2,
			}}
			className={cn(
				"inline-block animate-spin rounded-full",
				"border-[var(--bg-border)] border-t-[var(--accent-primary)]",
				className,
			)}
		/>
	)
}
