import type { Metadata, Viewport } from "next"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants"
import "./globals.css"

export const metadata: Metadata = {
	metadataBase: new URL("https://shelbydrive.vercel.app"),
	title: `${APP_NAME} | Encrypted File Storage`,
	description: APP_DESCRIPTION,
	icons: {
		icon: [
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
		],
		shortcut: "/icon.svg",
		apple: "/icon.svg",
	},
	openGraph: {
		title: APP_NAME,
		description: APP_DESCRIPTION,
		images: [
			{
				url: "/og.svg",
				width: 1200,
				height: 630,
				alt: APP_NAME,
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: APP_NAME,
		description: APP_DESCRIPTION,
		images: ["/og.svg"],
	},
}

export const viewport: Viewport = {
	themeColor: "#060A0E",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className="min-h-screen font-sans text-[var(--text-primary)] antialiased">
				<ToastProvider>
					<Navbar />
					<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						{children}
					</main>
					<Footer />
				</ToastProvider>
			</body>
		</html>
	)
}
