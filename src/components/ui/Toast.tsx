"use client"

import {
	AlertTriangle,
	CheckCircle2,
	Info,
	XCircle,
	X as XIcon,
} from "lucide-react"
import type { ToastItem, ToastType } from "./ToastProvider"

interface ToastViewportProps {
	toasts: ToastItem[]
	onDismiss: (id: string) => void
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
	success: CheckCircle2,
	error: XCircle,
	info: Info,
	warning: AlertTriangle,
}

const COLOURS: Record<ToastType, string> = {
	success: "var(--status-success)",
	error: "var(--status-error)",
	info: "var(--status-info)",
	warning: "var(--status-warning)",
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
	return (
		<div
			className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3"
			aria-live="polite"
			aria-atomic="false"
		>
			{toasts.map((t) => {
				const Icon = ICONS[t.type]
				const colour = COLOURS[t.type]
				return (
					<div
						key={t.id}
						className="glass animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 p-4"
						style={{ borderLeftColor: colour }}
						role="alert"
					>
						<Icon
							size={18}
							style={{ color: colour }}
							className="mt-0.5 shrink-0"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-[var(--text-primary)]">
								{t.title}
							</p>
							{t.message && (
								<p className="mt-1 text-xs text-[var(--text-secondary)]">
									{t.message}
								</p>
							)}
						</div>
						<button
							type="button"
							onClick={() => onDismiss(t.id)}
							aria-label="Dismiss notification"
							className="shrink-0 rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
						>
							<XIcon size={14} />
						</button>
					</div>
				)
			})}
		</div>
	)
}
