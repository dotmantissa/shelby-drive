import { describe, expect, it } from "vitest"
import { getShelbyFaucetUrl, isShelbynet, SHELBYNET } from "./constants"

describe("Shelbynet detection", () => {
	it("accepts the current numeric or string chain ID", () => {
		expect(isShelbynet({ name: "Custom", chainId: 118 })).toBe(true)
		expect(isShelbynet({ name: "Custom", chainId: "118" })).toBe(true)
		expect(SHELBYNET.chainId).toBe(118)
	})

	it("rejects a conflicting chain ID even when the name matches", () => {
		expect(isShelbynet({ name: "Shelbynet", chainId: 113 })).toBe(false)
	})

	it("uses the network name only when a chain ID is unavailable", () => {
		expect(isShelbynet({ name: "Shelbynet" })).toBe(true)
		expect(isShelbynet({ name: "testnet" })).toBe(false)
		expect(isShelbynet(null)).toBe(false)
	})

	it("targets the faucet at the connected wallet", () => {
		expect(getShelbyFaucetUrl("0x123")).toBe(
			"https://faucet.shelbynet.shelby.xyz?address=0x123",
		)
	})
})
