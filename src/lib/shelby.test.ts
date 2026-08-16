import { describe, expect, it } from "vitest"
import { APTOS_NETWORK } from "./constants"
import { getShelbyClient } from "./shelby"

describe("Shelby client configuration", () => {
	it("provides a location hint for fresh Shelbynet accounts", () => {
		const client = getShelbyClient()

		expect(APTOS_NETWORK).toBe("shelbynet")
		expect(client.coordination.defaultOptions.locationHint).toBe(
			"shelbynet-1",
		)
	})
})
