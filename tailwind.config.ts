import type { Config } from "tailwindcss"

const config: Config = {
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				accent: "#00D4A8",
				"accent-dark": "#00A884",
				"bg-base": "#060A0E",
				"bg-surface": "#0D1117",
				"bg-elevated": "#141B24",
				"bg-border": "#1E2A35",
			},
			fontFamily: {
				sans: ["var(--font-inter)", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "monospace"],
			},
			animation: {
				"fade-in": "fadeIn 0.4s ease forwards",
				"slide-up": "slideUp 0.4s ease forwards",
				"pulse-glow": "pulseGlow 2s ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				slideUp: {
					from: { opacity: "0", transform: "translateY(16px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				pulseGlow: {
					"0%, 100%": { boxShadow: "0 0 8px rgba(0,212,168,0.3)" },
					"50%": { boxShadow: "0 0 24px rgba(0,212,168,0.6)" },
				},
			},
		},
	},
	plugins: [],
}
export default config
