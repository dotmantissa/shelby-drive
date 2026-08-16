"use client"

import type { ButtonHTMLAttributes, PropsWithChildren } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "outline" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps
	extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
	variant?: Variant
	size?: Size
	loading?: boolean
}

const variantClasses: Record<Variant, string> = {
	primary: "btn-primary",
	outline:
		"border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-dim)] transition-colors",
	ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors",
	danger: "bg-[var(--status-error)] text-white hover:opacity-90 transition-opacity",
}

const sizeClasses: Record<Size, string> = {
	sm: "px-3 py-1.5 text-sm rounded-lg",
	md: "px-4 py-2 text-sm rounded-lg",
	lg: "px-6 py-3 text-base rounded-xl",
}

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	disabled,
	className,
	children,
	...rest
}: ButtonProps) {
	return (
		<button
			type={rest.type ?? "button"}
			disabled={disabled || loading}
			{...rest}
			className={cn(
				"inline-flex items-center justify-center gap-2 font-medium",
				"disabled:opacity-40 disabled:cursor-not-allowed",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
		>
			{loading && (
				<span
					className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
					aria-hidden
				/>
			)}
			{children}
		</button>
	)
}
