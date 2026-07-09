# ERC-721 NFT Console

A dark-mode NFT dashboard built with **Next.js**, **ethers.js**, and **The Graph** — lets you mint, transfer, approve, and monitor ERC-721 tokens in real time.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Blockchain | ethers.js v6 · MetaMask |
| Indexer | The Graph (subgraph) |
| Notifications | sonner |

---

## Features

- **Mint** — mint a new NFT to any address
- **Balance** — check how many NFTs an address owns
- **Token Query** — look up owner and approved address by token ID
- **Transfer** — `transferFrom` and `safeTransferFrom` in one card
- **Approve** — approve an address to move a specific token
- **Set Approval For All** — grant or revoke operator access with a Grant / Revoke toggle
- **Is Approved For All** — query operator approval status
- **NFT Info** — fetch contract `name()` and `symbol()`
- **Live Event Feed** — real-time Transfer, Approval, and ApprovalForAll events via The Graph, with auto-polling after every write

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and connect MetaMask.

> The app auto-detects your connected wallet and chain on load.

---

## Project Structure

```
├── app/                  # Next.js App Router pages
├── components/
│   ├── Contract-Interaction.tsx   # Main UI — all ERC-721 interactions
│   └── ui/               # shadcn/ui primitives
├── config.ts             # ABI + contract address
├── erc-721/              # The Graph subgraph (separate project)
│   ├── src/              # Subgraph mappings
│   └── schema.graphql    # Indexed entity schema
└── tsconfig.json         # erc-721/ excluded to avoid AS/TS conflicts
```

---

## Environment

No `.env` file required — the contract address and subgraph URL are hardcoded in `config.ts` and `Contract-Interaction.tsx` respectively. Update them there if you redeploy.

| Constant | File | Value |
|---|---|---|
| `CONTRACT_ADDRESS` | `config.ts` | Sepolia deployment |
| `SUBGRAPH_URL` | `Contract-Interaction.tsx` | The Graph Studio endpoint |

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
pnpm build   # verify before pushing
```
