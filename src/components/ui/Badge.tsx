import type { PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends PropsWithChildren {
	colour?: string
	variant?: "default" | "outline"
	className?: string
}

export function Badge({
	children,
	colour,
	variant = "default",
	className,
}: BadgeProps) {
	const style = colour
		? {
				color: colour,
				borderColor: `${colour}40`,
				backgroundColor: `${colour}15`,
			}
		: undefined

	return (
		<span
			style={style}
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
				"text-xs font-medium",
				variant === "outline" && "border",
				!colour && "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
				className,
			)}
		>
			{children}
		</span>
	)
}
