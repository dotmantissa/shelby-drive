"use client"

import { useEffect, useState } from "react"
import { getShelbyClient } from "@/lib/shelby"

type ClientState = {
	isLoading: boolean
	error: string | null
	ready: boolean
}

/**
 * Eagerly initialises the Shelby browser client so the first upload doesn't
 * pay the cold-start cost. The constructor is synchronous now, but kept as a
 * hook so we can also surface a clearer error if `getShelbyClient()` ever
 * throws (e.g. when env vars are missing).
 */
export const useShelbyClient = () => {
	const [state, setState] = useState<ClientState>({
		isLoading: true,
		error: null,
		ready: false,
	})

	useEffect(() => {
		try {
			getShelbyClient()
			setState({ isLoading: false, error: null, ready: true })
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to load Shelby SDK"
			setState({ isLoading: false, error: message, ready: false })
		}
	}, [])

	return state
}
