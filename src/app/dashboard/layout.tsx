import type { PropsWithChildren } from "react"
import { ShelbyProviders } from "@/components/providers/Providers"
import { WalletProvider } from "@/components/wallet/WalletProvider"

export default function DashboardLayout({ children }: PropsWithChildren) {
	return (
		<WalletProvider>
			<ShelbyProviders>{children}</ShelbyProviders>
		</WalletProvider>
	)
}
