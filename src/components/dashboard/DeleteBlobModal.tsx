"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"

interface DeleteBlobModalProps {
	open: boolean
	blobName: string | null
	pending: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function DeleteBlobModal({
	open,
	blobName,
	pending,
	onConfirm,
	onCancel,
}: DeleteBlobModalProps) {
	return (
		<Modal
			open={open}
			onClose={onCancel}
			dismissible={!pending}
			className="max-w-md"
		>
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-error)]/15 text-[var(--status-error)]">
					<Trash2 size={22} />
				</div>
				<h2 className="text-lg font-semibold text-[var(--text-primary)]">
					Delete this file?
				</h2>
				{blobName && (
					<p className="break-all rounded-lg border border-[var(--bg-border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-xs text-[var(--text-primary)]">
						{blobName}
					</p>
				)}
				<p className="text-sm text-[var(--text-secondary)]">
					This sends a delete transaction to Shelbynet. The blob is
					removed from your account and frees up your storage quota.
					This can't be undone.
				</p>
				<div className="mt-1 flex gap-2">
					<Button
						variant="ghost"
						onClick={onCancel}
						disabled={pending}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={onConfirm}
						loading={pending}
					>
						{!pending && <Trash2 size={14} />}
						Delete
					</Button>
				</div>
			</div>
		</Modal>
	)
}
