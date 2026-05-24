"use client"

import { ShelbyClientProvider } from "@shelby-protocol/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type PropsWithChildren, useState } from "react"
import { getShelbyClient } from "@/lib/shelby"

/**
 * Wraps children in QueryClientProvider + ShelbyClientProvider so the
 * @shelby-protocol/react hooks can use them. Both clients are instantiated
 * once per browser session (the QueryClient via useState so each user gets
 * their own cache; the Shelby client via the module-level singleton).
 */
export function Providers({ children }: PropsWithChildren) {
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
