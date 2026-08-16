const BYTE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB"] as const

export const formatBytes = (bytes: number): string => {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
	const unitIndex = Math.min(
		Math.floor(Math.log(bytes) / Math.log(1024)),
		BYTE_UNITS.length - 1,
	)
	const value = bytes / 1024 ** unitIndex
	return `${new Intl.NumberFormat("en", {
		maximumFractionDigits: value >= 10 || unitIndex === 0 ? 0 : 1,
	}).format(value)} ${BYTE_UNITS[unitIndex]}`
}

export const truncate = (str: string, startChars = 6, endChars = 4): string =>
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
	const relative = formatRelativeTime(ms)
	const absolute = new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date)
	return `${relative} · ${absolute}`
}

export const formatCreated = (creationMicros: number): string =>
	new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(creationMicros / 1000))

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

const formatRelativeTime = (timestampMs: number): string => {
	const deltaSeconds = Math.round((timestampMs - Date.now()) / 1000)
	const ranges = [
		{ limit: 60, divisor: 1, unit: "second" },
		{ limit: 3600, divisor: 60, unit: "minute" },
		{ limit: 86400, divisor: 3600, unit: "hour" },
		{ limit: 2_592_000, divisor: 86400, unit: "day" },
		{ limit: 31_536_000, divisor: 2_592_000, unit: "month" },
		{ limit: Number.POSITIVE_INFINITY, divisor: 31_536_000, unit: "year" },
	] as const
	const absoluteSeconds = Math.abs(deltaSeconds)
	const range =
		ranges.find(({ limit }) => absoluteSeconds < limit) ?? ranges[0]
	return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
		Math.round(deltaSeconds / range.divisor),
		range.unit,
	)
}

export const copyToClipboard = async (text: string): Promise<void> => {
	if (!navigator.clipboard) {
		throw new Error("Clipboard access is not available in this browser")
	}
	await navigator.clipboard.writeText(text)
}

export const cn = (...classes: Array<string | false | null | undefined>) =>
	classes.filter(Boolean).join(" ")
