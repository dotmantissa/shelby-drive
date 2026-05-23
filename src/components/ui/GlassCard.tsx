"use client"

import type { HTMLAttributes, PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps
	extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	hoverable?: boolean
	padded?: boolean
}

export function GlassCard({
	children,
	hoverable = false,
	padded = true,
	className,
	...rest
}: GlassCardProps) {
	return (
		<div
			{...rest}
			className={cn(
				"glass rounded-2xl",
				hoverable && "glass-hover",
				padded && "p-6",
				className,
			)}
		>
			{children}
		</div>
	)
}
