"use client"

import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react"
import { ToastViewport } from "./Toast"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastItem {
	id: string
	type: ToastType
	title: string
	message?: string
}

interface ToastContextValue {
	toasts: ToastItem[]
	push: (toast: Omit<ToastItem, "id">) => string
	dismiss: (id: string) => void
	success: (title: string, message?: string) => string
	error: (title: string, message?: string) => string
	info: (title: string, message?: string) => string
	warning: (title: string, message?: string) => string
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
	const [toasts, setToasts] = useState<ToastItem[]>([])

	const dismiss = useCallback((id: string) => {
		setToasts((curr) => curr.filter((t) => t.id !== id))
	}, [])

	const push = useCallback(
		(toast: Omit<ToastItem, "id">) => {
			const id =
				typeof crypto !== "undefined" && "randomUUID" in crypto
					? crypto.randomUUID()
					: `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
			setToasts((curr) => [...curr, { ...toast, id }])
			setTimeout(() => dismiss(id), 5000)
			return id
		},
		[dismiss],
	)

	const value = useMemo<ToastContextValue>(
		() => ({
			toasts,
			push,
			dismiss,
			success: (title, message) => push({ type: "success", title, message }),
			error: (title, message) => push({ type: "error", title, message }),
			info: (title, message) => push({ type: "info", title, message }),
			warning: (title, message) => push({ type: "warning", title, message }),
		}),
		[toasts, push, dismiss],
	)

	return (
		<ToastContext.Provider value={value}>
			{children}
			<ToastViewport toasts={toasts} onDismiss={dismiss} />
		</ToastContext.Provider>
	)
}

export const useToast = (): ToastContextValue => {
	const ctx = useContext(ToastContext)
	if (!ctx) {
		throw new Error("useToast must be used within ToastProvider")
	}
	return ctx
}
