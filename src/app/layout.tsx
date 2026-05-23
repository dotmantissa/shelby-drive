import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { ToastProvider } from "@/components/ui/ToastProvider"
import { WalletProvider } from "@/components/wallet/WalletProvider"
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
	title: `${APP_NAME} — Decentralized File Storage`,
	description: APP_DESCRIPTION,
	openGraph: {
		title: APP_NAME,
		description: "Cloud-grade decentralized file storage on Aptos",
		images: ["/shelby-og.png"],
		type: "website",
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
		<html lang="en" className={`${inter.variable} ${mono.variable}`}>
			<body className="bg-mesh min-h-screen font-sans text-[var(--text-primary)] antialiased">
				<WalletProvider>
					<ToastProvider>
						<Navbar />
						<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
							{children}
						</main>
						<Footer />
					</ToastProvider>
				</WalletProvider>
			</body>
		</html>
	)
}
