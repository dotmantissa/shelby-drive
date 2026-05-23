"use client"

import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useMemo,
	useRef,
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

	// We need `success`/`error`/`info`/`warning` to keep stable references across
	// renders (so consumer effects don't re-fire every time the toasts array
	// changes). Hold `push` in a ref and expose stable callbacks via useCallback.
	const pushRef = useRef(push)
	pushRef.current = push

	const success = useCallback(
		(title: string, message?: string) =>
			pushRef.current({ type: "success", title, message }),
		[],
	)
	const error = useCallback(
		(title: string, message?: string) =>
			pushRef.current({ type: "error", title, message }),
		[],
	)
	const info = useCallback(
		(title: string, message?: string) =>
			pushRef.current({ type: "info", title, message }),
		[],
	)
	const warning = useCallback(
		(title: string, message?: string) =>
			pushRef.current({ type: "warning", title, message }),
		[],
	)

	const value = useMemo<ToastContextValue>(
		() => ({ toasts, push, dismiss, success, error, info, warning }),
		[toasts, push, dismiss, success, error, info, warning],
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
