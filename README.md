# Shelby | DRIVE

> A decentralized Google Drive built on the [Shelby Protocol](https://docs.shelby.xyz)
> — Web3's first cloud-grade, decentralized hot-storage network, co-built by
> Aptos Labs and Jump Crypto.

Connect an Aptos wallet, drop a file, and your data is Clay-erasure-coded,
committed on-chain, and distributed across the Shelby storage network. Every
file is owned by — and addressable from — your wallet.

## Features

- **Wallet-native storage** — every blob is keyed to your Aptos address. No accounts, no passwords.
- **On-chain proofs** — each upload registers a merkle root on Aptos before bytes ever leave the browser.
- **3-step transparent upload flow** — encode → register → upload, with full step-by-step UI feedback.
- **Drag-and-drop dashboard** — view, download, copy direct links, and inspect every stored blob.
- **Glassmorphic dark UI** — built with Tailwind + Framer Motion, fully responsive.
- **100% client-side** — no backend server; deploys as a static-friendly Next.js app to Vercel.

## Prerequisites

- **Node v22 or later**
- **pnpm** (`corepack enable pnpm`)
- **An Aptos wallet** (e.g. [Petra](https://petra.app/)) configured for **Shelbynet**
- **ShelbyUSD + APT** on Shelbynet — request from the [Shelby Discord](https://discord.gg/shelby)
- API keys from [docs.shelby.xyz/sdks/typescript/acquire-api-keys](https://docs.shelby.xyz/sdks/typescript/acquire-api-keys)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SHELBY_API_KEY and NEXT_PUBLIC_APTOS_API_KEY

# 3. Start the dev server
pnpm dev
# → http://localhost:3000
```

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SHELBY_API_KEY` | API key for the Shelby RPC + indexer |
| `NEXT_PUBLIC_APTOS_API_KEY` | API key for the Aptos fullnode |
| `NEXT_PUBLIC_APTOS_NETWORK` | `shelbynet` (only value supported by SDK 0.0.9) |
| `NEXT_PUBLIC_SHELBY_RPC_URL` | Defaults to `https://api.shelbynet.shelby.xyz` |
| `NEXT_PUBLIC_SHELBY_EXPLORER_URL` | Defaults to `https://explorer.shelby.xyz/shelbynet` |

> **Security note:** This app never sees a private key. All transactions are
> signed by the connected wallet via `@aptos-labs/wallet-adapter-react`.

## Architecture

```
   Browser (Next.js client)
        │
        │  1. Encode + commit (WASM, Clay erasure codes)
        │  2. Sign register_blob tx via wallet
        ▼
   Aptos L1 (Shelbynet)  ← on-chain merkle root + metadata
        │
        │  3. PUT blob to RPC
        ▼
   Shelby RPC node  ──►  Storage Providers (distributed)
```

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v3 + custom glassmorphism |
| Animations | Framer Motion |
| Shelby SDK | `@shelby-protocol/sdk` (browser build) |
| Wallet | `@aptos-labs/wallet-adapter-react` |
| Icons | Lucide |
| Linting | Biome |

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Run the Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm start` | Serve the production build |
| `pnpm type-check` | Run `tsc --noEmit` |
| `pnpm lint` | Run Biome |

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project in the Vercel dashboard.
3. Set the same `NEXT_PUBLIC_*` env vars in Vercel **Project Settings → Environment Variables**.
4. Deploy — Vercel auto-detects Next.js. Build command: `pnpm build`.

> Do **not** set `output: 'export'` in `next.config.mjs` — the Shelby browser
> SDK ships a WASM binary that requires standard SSR/ISR mode.

## Links

- [Shelby Docs](https://docs.shelby.xyz)
- [Shelby Discord](https://discord.gg/shelby)
- [Shelby Explorer](https://explorer.shelby.xyz/shelbynet)
- [Aptos Docs](https://aptos.dev)

## License

MIT — see [LICENSE](./LICENSE).
