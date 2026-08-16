"use client"

import { ShelbyClientProvider } from "@shelby-protocol/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type PropsWithChildren, useState } from "react"
import { getShelbyClient } from "@/lib/shelby"

/**
 * Dashboard-only providers. Keeping this boundary below the root layout
 * prevents Shelby's SDK and erasure-coding code from entering the landing
 * page bundle.
 */
export function ShelbyProviders({ children }: PropsWithChildren) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 30_000,
						refetchOnWindowFocus: false,
					},
				},
			}),
	)
	const [shelbyClient] = useState(() => getShelbyClient())

	return (
		<QueryClientProvider client={queryClient}>
			<ShelbyClientProvider client={shelbyClient}>
				{children}
			</ShelbyClientProvider>
		</QueryClientProvider>
	)
}
