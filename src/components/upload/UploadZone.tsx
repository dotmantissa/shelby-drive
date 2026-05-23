"use client"

import { CloudUpload } from "lucide-react"
import {
	type DragEvent,
	useCallback,
	useRef,
	useState,
} from "react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
	onFile: (file: File) => void
	disabled?: boolean
}

export function UploadZone({ onFile, disabled = false }: UploadZoneProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [dragOver, setDragOver] = useState(false)

	const openPicker = useCallback(() => {
		if (disabled) return
		inputRef.current?.click()
	}, [disabled])

	const onDrop = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault()
			setDragOver(false)
			if (disabled) return
			const file = e.dataTransfer.files?.[0]
			if (file) onFile(file)
		},
		[disabled, onFile],
	)

	return (
		<>
			<button
				type="button"
				onClick={openPicker}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						openPicker()
					}
				}}
				disabled={disabled}
				aria-label="Upload a file"
				className={cn(
					"w-full p-0 text-left disabled:cursor-not-allowed disabled:opacity-50",
				)}
			>
				<div
					onDragOver={(e) => {
						e.preventDefault()
						if (!disabled) setDragOver(true)
					}}
					onDragLeave={() => setDragOver(false)}
					onDrop={onDrop}
					className={cn(
						"glass flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 transition-all",
						dragOver
							? "border-[var(--accent-primary)] bg-[var(--accent-dim)] animate-pulse-glow"
							: "border-[var(--bg-border)]",
					)}
				>
					<div
						className={cn(
							"flex h-14 w-14 items-center justify-center rounded-full transition-colors",
							dragOver
								? "bg-[var(--accent-primary)] text-[var(--bg-base)]"
								: "bg-[var(--bg-elevated)] text-[var(--accent-primary)]",
						)}
					>
						<CloudUpload size={26} />
					</div>
					<div className="text-center">
						<p className="text-base font-medium text-[var(--text-primary)]">
							Drop any file here
						</p>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							or click to browse
						</p>
					</div>
					<p
						className="text-xs text-[var(--text-tertiary)]"
						title="Re-uploading a file with the same name overwrites the previous one"
					>
						Same-name uploads overwrite the previous file
					</p>
				</div>
			</button>
			<input
				ref={inputRef}
				type="file"
				className="hidden"
				accept="*"
				onChange={(e) => {
					const file = e.target.files?.[0]
					if (file) onFile(file)
					e.target.value = ""
				}}
			/>
		</>
	)
}
