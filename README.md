# Shelby | DRIVE

A wallet-native encrypted file drive built on the Shelby Protocol and Aptos
Shelbynet.

The browser encrypts each upload with AES-256-GCM before commitment generation
or network transfer. Shelby stores only the encrypted envelope. Download and
preview actions fetch the ciphertext, ask the owning wallet to sign an unlock
message, and decrypt locally.

## Features

- Client-side AES-256-GCM authenticated encryption
- Wallet-signature-derived encryption keys; no key or plaintext backend
- Strict same-name duplicate rejection with an on-chain race check
- Safe local download and browser preview flows
- Legacy plaintext blob detection with a visible warning
- Paginated blob listing and aggregate storage statistics
- Grid and table views, deletion, quota checks, and explicit error reporting
- Shelbynet chain detection using the current chain ID, `118`

## Encryption And Recovery

Each encrypted blob uses the `SDBLOB01` binary envelope. The authenticated
header records the format version, algorithm, original name, MIME type, and
plaintext size. A random 96-bit IV is generated for every upload.

The AES key is derived with HKDF-SHA-256 from a wallet signature over a fixed
application message and the canonical Aptos account address. The signature is
requested once before upload and again only when the user downloads or previews
the file.

Important limitations:

- The same wallet account must remain available and return the same signature
  bytes for the fixed unlock message. Changing wallet authentication,
  unsupported wallet signature schemes, or losing wallet access can make files
  unrecoverable.
- There is no password reset, escrow key, server-side recovery, or administrator
  decryption path.
- Shelby metadata is public. The owner address, blob name, encrypted size,
  expiration, and on-chain commitment remain visible. Use non-sensitive blob
  names.
- Direct Shelby blob URLs return ciphertext. Use the app's Download or View
  action to decrypt locally.
- Blobs uploaded by older versions are treated as legacy plaintext. The app
  warns before returning them.

## Upload Flow

Wallet uploads use the current Shelby protocol sequence:

1. Sign the non-transaction encryption unlock message.
2. Encrypt the file locally.
3. Generate Clay erasure-code commitments over the ciphertext.
4. Approve a transaction that registers encrypted blob metadata.
5. Upload encrypted chunksets to Shelby storage providers.
6. Approve a second transaction that commits the object with `overwrite: false`.

The UI reports each phase separately. Unknown errors are preserved in the UI
and console instead of being replaced with a generic success or silently
ignored.

Exact duplicate blob names are rejected before encryption when already loaded,
checked again against Shelby metadata before registration, and rejected at
commit time if another upload wins the race.

## Requirements

- Node.js 22 or later
- pnpm
- An Aptos-compatible wallet with Shelbynet support
- APT for transaction fees and ShelbyUSD for storage
- A Shelby API key for production rate limits

## Setup

```bash
corepack enable pnpm
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

## Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SHELBY_API_KEY` | Shelby RPC and blob indexer API key |
| `NEXT_PUBLIC_APTOS_API_KEY` | Optional Aptos fullnode API key |
| `NEXT_PUBLIC_SHELBY_CHAIN_ID` | Shelbynet chain ID; defaults to `118` |
| `NEXT_PUBLIC_SHELBY_RPC_URL` | Defaults to `https://api.shelbynet.shelby.xyz/shelby` |
| `NEXT_PUBLIC_SHELBY_EXPLORER_URL` | Defaults to the Shelbynet explorer |

The Aptos fullnode used by the app is
`https://api.shelbynet.shelby.xyz/v1`. Network switching calls the wallet's
standard `aptos:changeNetwork` feature directly with chain ID `118`.

## Architecture

```text
Browser
  |-- wallet signature -> HKDF key
  |-- AES-256-GCM encryption
  |-- Clay commitment generation
  |
  |-- register transaction --------> Aptos Shelbynet
  |-- encrypted chunksets ---------> Shelby storage providers
  |-- commit transaction ----------> Aptos Shelbynet

Retrieval
  |-- fetch encrypted blob
  |-- wallet signature -> same HKDF key
  `-- local decrypt -> download or safe preview
```

The wallet, Shelby React, and SDK providers are mounted only under
`/dashboard`, keeping wallet adapters, the SDK, and erasure-coding dependencies
out of the landing page route.

## Stack

| Layer | Version |
|---|---|
| Next.js | `14.2.35` |
| React | `18.3.1` |
| Aptos TypeScript SDK | `5.2.1` |
| Aptos wallet adapter React | `7.2.8` |
| Shelby SDK | `0.7.1` |
| Shelby React | `4.1.0` |
| TanStack Query | `5.100.x` |
| Tailwind CSS | `3.4.x` |
| Biome | `2.2.4` |
| Vitest | `3.2.7` |

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm test` | Run the Vitest suite |
| `pnpm type-check` | Run TypeScript without emitting |
| `pnpm lint` | Run Biome formatting and lint checks |

The test suite covers encryption round trips, tamper detection, wrong-key
rejection, legacy plaintext handling, envelope sizing, Aptos address
normalization, Shelbynet detection, duplicate translation, and error
preservation.

## Deployment

Deploy as a standard Next.js application. Do not set `output: "export"`:
Shelby's browser SDK includes WebAssembly used for erasure coding.

Set the public environment variables in the deployment platform and rotate any
key that has previously been committed or shared.

## License

MIT. See [LICENSE](./LICENSE).
