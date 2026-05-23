import { format, formatDistanceToNow } from "date-fns"
import { filesize as formatFilesize } from "filesize"

export const formatBytes = (bytes: number): string =>
	formatFilesize(bytes, { standard: "jedec" }) as string

export const truncate = (
	str: string,
	startChars = 6,
	endChars = 4,
): string =>
	str.length <= startChars + endChars + 3
		? str
		: `${str.slice(0, startChars)}...${str.slice(-endChars)}`

export const truncateMiddle = (
	str: string,
	startChars = 8,
	endChars = 6,
): string =>
	str.length <= startChars + endChars + 1
		? str
		: `${str.slice(0, startChars)}…${str.slice(-endChars)}`

export const formatExpiry = (expirationMicros: number): string => {
	const ms = expirationMicros / 1000
	const date = new Date(ms)
	const relative = formatDistanceToNow(date, { addSuffix: true })
	const absolute = format(date, "MMM d, yyyy")
	return `${relative} · ${absolute}`
}

export const formatCreated = (creationMicros: number): string =>
	format(new Date(creationMicros / 1000), "MMM d, yyyy · h:mm a")

export const isExpired = (expirationMicros: number): boolean =>
	expirationMicros / 1000 < Date.now()

export interface FileTypeInfo {
	iconName: string
	colour: string
	label: string
}

export const getFileType = (name: string): FileTypeInfo => {
	const ext = name.split(".").pop()?.toLowerCase() ?? ""
	const map: Record<string, FileTypeInfo> = {
		pdf: { iconName: "FileText", colour: "#FF4D6D", label: "PDF" },
		jpg: { iconName: "Image", colour: "#00D4A8", label: "Image" },
		jpeg: { iconName: "Image", colour: "#00D4A8", label: "Image" },
		png: { iconName: "Image", colour: "#00D4A8", label: "Image" },
		gif: { iconName: "Image", colour: "#00D4A8", label: "Image" },
		webp: { iconName: "Image", colour: "#00D4A8", label: "Image" },
		svg: { iconName: "Image", colour: "#00D4A8", label: "Vector" },
		mp4: { iconName: "Film", colour: "#A855F7", label: "Video" },
		mov: { iconName: "Film", colour: "#A855F7", label: "Video" },
		webm: { iconName: "Film", colour: "#A855F7", label: "Video" },
		mp3: { iconName: "Music", colour: "#3B82F6", label: "Audio" },
		wav: { iconName: "Music", colour: "#3B82F6", label: "Audio" },
		flac: { iconName: "Music", colour: "#3B82F6", label: "Audio" },
		zip: { iconName: "Archive", colour: "#F0A500", label: "Archive" },
		tar: { iconName: "Archive", colour: "#F0A500", label: "Archive" },
		gz: { iconName: "Archive", colour: "#F0A500", label: "Archive" },
		rar: { iconName: "Archive", colour: "#F0A500", label: "Archive" },
		"7z": { iconName: "Archive", colour: "#F0A500", label: "Archive" },
		doc: { iconName: "FileText", colour: "#3B82F6", label: "Document" },
		docx: { iconName: "FileText", colour: "#3B82F6", label: "Document" },
		xls: { iconName: "Table", colour: "#00D4A8", label: "Spreadsheet" },
		xlsx: { iconName: "Table", colour: "#00D4A8", label: "Spreadsheet" },
		txt: { iconName: "FileText", colour: "#8B9DB0", label: "Text" },
		md: { iconName: "FileText", colour: "#8B9DB0", label: "Markdown" },
		json: { iconName: "Braces", colour: "#F0A500", label: "JSON" },
		csv: { iconName: "Table", colour: "#00D4A8", label: "CSV" },
	}
	return map[ext] ?? { iconName: "File", colour: "#8B9DB0", label: "File" }
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text)
		return true
	} catch {
		return false
	}
}

export const cn = (...classes: Array<string | false | null | undefined>) =>
	classes.filter(Boolean).join(" ")
