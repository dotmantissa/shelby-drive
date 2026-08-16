"use client"

import { X } from "lucide-react"
import {
	type PropsWithChildren,
	useCallback,
	useEffect,
	useId,
	useRef,
} from "react"
import { cn } from "@/lib/utils"

interface ModalProps extends PropsWithChildren {
	open: boolean
	onClose: () => void
	dismissible?: boolean
	title?: string
	className?: string
}

export function Modal({
	open,
	onClose,
	dismissible = true,
	title,
	children,
	className,
}: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null)
	const titleId = useId()

	const close = useCallback(() => {
		if (dismissible) onClose()
	}, [dismissible, onClose])

	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close()
		}
		document.addEventListener("keydown", onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = "hidden"
		return () => {
			document.removeEventListener("keydown", onKey)
			document.body.style.overflow = prev
		}
	}, [open, close])

	useEffect(() => {
		if (open && panelRef.current) {
			const focusable = panelRef.current.querySelector<HTMLElement>(
				'button, [href], input, textarea, [tabindex]:not([tabindex="-1"])',
			)
			focusable?.focus()
		}
	}, [open])

	if (!open) return null

	return (
		<div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center px-4">
			<button
				type="button"
				tabIndex={-1}
				disabled={!dismissible}
				aria-label="Close modal"
				onClick={close}
				className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-xl"
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				className={cn(
					"glass animate-modal-in relative z-10 w-full max-w-lg rounded-2xl p-6",
					className,
				)}
			>
				{(title || dismissible) && (
					<div className="mb-4 flex items-start justify-between gap-4">
						{title && (
							<h2
								id={titleId}
								className="text-lg font-semibold text-[var(--text-primary)]"
							>
								{title}
							</h2>
						)}
						{dismissible && (
							<button
								type="button"
								aria-label="Close"
								onClick={close}
								className="ml-auto rounded-md p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
							>
								<X size={18} />
							</button>
						)}
					</div>
				)}
				{children}
			</div>
		</div>
	)
}
