"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import {
	type PropsWithChildren,
	useCallback,
	useEffect,
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
	const overlayRef = useRef<HTMLDivElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)

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

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					ref={overlayRef}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xl"
					onClick={(e) => {
						if (e.target === overlayRef.current) close()
					}}
				>
					<motion.div
						ref={panelRef}
						initial={{ opacity: 0, y: 24, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 24, scale: 0.96 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						role="dialog"
						aria-modal="true"
						aria-labelledby={title ? "modal-title" : undefined}
						className={cn(
							"glass relative w-full max-w-lg rounded-2xl p-6",
							className,
						)}
					>
						{(title || dismissible) && (
							<div className="mb-4 flex items-start justify-between gap-4">
								{title && (
									<h2
										id="modal-title"
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
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}
