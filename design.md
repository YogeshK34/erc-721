# 🎨 Design System Guide — ERC-20 Token Console

> Extracted from `components/Contract-Interaction.tsx`.
> Pass this file to any agent to replicate the same UI style.

---

## 1. Stack & Dependencies

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS (utility-first, no custom CSS files)
- **Component library**: [shadcn/ui](https://ui.shadcn.com/) — `Card`, `Button`, `Input`, `Label`, `Badge`, `Separator`
- **Notifications**: `sonner` toast (`toast.success`, `toast.error`, `toast.info`)
- **Custom component**: `<Spinner />` from `./ui/spinner`

---

## 2. Color Palette

All colors are from Tailwind's **zinc** scale (dark mode only) with **cyan** as the primary accent.

| Role                     | Tailwind Class(es)                                           | Notes                        |
|--------------------------|--------------------------------------------------------------|------------------------------|
| Page background          | `bg-zinc-950`                                                | Root container               |
| Card background          | `bg-zinc-900/40`                                             | Semi-transparent             |
| Input background         | `bg-zinc-950`                                                | Full opacity                 |
| Data panel background    | `bg-zinc-950/60`                                             | Result `<dl>` blocks         |
| Primary CTA button       | `bg-cyan-400 text-zinc-950 hover:bg-cyan-300`               | Write/deploy/send actions    |
| Outline button           | `border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50` | Read/fetch actions |
| Ghost button             | `text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300`        | Minor actions (e.g. "Clear") |
| Primary text             | `text-zinc-100` / `text-zinc-50`                             | Headings, content            |
| Secondary text           | `text-zinc-400` / `text-zinc-500`                            | Labels, descriptions         |
| Muted / disabled text    | `text-zinc-600`                                              | Timestamps, empty states     |
| Accent — values          | `text-cyan-300`                                              | Token amounts, addresses, tokenIds |
| Accent — approvals       | `text-emerald-300`                                           | Approval amounts / approved addresses |
| Status dot — idle        | `bg-emerald-400`                                             | Header badge                 |
| Status dot — processing  | `bg-amber-400 animate-pulse`                                 | Header badge                 |
| Warning banner           | `border-amber-500/30 bg-amber-500/10 text-amber-300`         | Indexer status banner        |
| Error banner             | `border-red-500/30 bg-red-500/10 text-red-400`               | Subgraph/fetch errors        |
| Card & divider borders   | `border-zinc-800`                                            | All cards, `<dl>` panels     |

---

## 3. Typography

| Element                  | Tailwind Classes                                                    |
|--------------------------|---------------------------------------------------------------------|
| Overline / section label | `text-xs font-mono uppercase tracking-[0.2em] text-zinc-500`        |
| Page title               | `text-xl font-semibold text-zinc-50`                                |
| Card title               | `text-base text-zinc-100` (via `CardTitle`)                        |
| Card description         | `text-zinc-500` (via `CardDescription`)                            |
| Form label               | `text-xs text-zinc-400`                                             |
| Data key (`dt`)          | `text-xs text-zinc-500`                                             |
| Data value (`dd`)        | `font-mono text-sm text-zinc-100` or `text-cyan-300`               |
| Monospace address        | `font-mono text-xs text-zinc-500 truncate`                          |
| Timestamp                | `font-mono text-[10px] text-zinc-700`                              |
| Section divider text     | `text-xs font-mono uppercase tracking-widest text-zinc-600`         |
| Code inline              | `<code className="text-zinc-300">`                                  |

---

## 4. Layout & Spacing

```
Root wrapper:   min-h-screen w-full bg-zinc-950 py-16 px-4 text-zinc-100
Inner column:   mx-auto flex w-full max-w-xl flex-col gap-6
```

- **Max width**: `max-w-xl` — single centered column, never wider
- **Between cards**: `gap-6`
- **Inside `CardContent`**: `flex flex-col gap-4`
- **Form field wrapper**: `flex flex-col gap-1.5`
- **Two-column grid** (e.g. Name + Symbol): `grid grid-cols-2 gap-3`
- **Inline icon + text**: `flex items-center gap-2`

---

## 5. Component Patterns

### Card

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Title</CardTitle>
    <CardDescription className="text-zinc-500">
      Short description of what this section does.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    {/* fields and button here */}
  </CardContent>
</Card>
```

---

### Form Field

```tsx
<div className="flex flex-col gap-1.5">
  <Label htmlFor="fieldId" className="text-xs text-zinc-400">
    Field label
  </Label>
  <Input
    id="fieldId"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="0x..."
    className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100
               placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
  />
</div>
```

> Use `type="number"` for numeric fields. Keep `font-mono` on all address/amount inputs.

---

### Primary Button (write / deploy / send)

```tsx
<Button
  onClick={handler}
  disabled={loading || !account}
  className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
>
  {loading ? (
    <span className="flex items-center gap-2">
      <Spinner className="h-4 w-4" />
      Loading label
    </span>
  ) : (
    "Action label"
  )}
</Button>
```

---

### Outline Button (read / fetch)

```tsx
<Button
  onClick={handler}
  disabled={loading || !account}
  variant="outline"
  className="w-full border-zinc-700 bg-transparent text-zinc-100
             hover:bg-zinc-800 hover:text-zinc-50"
>
  {loading ? (
    <span className="flex items-center gap-2">
      <Spinner className="h-4 w-4" />
      Fetching
    </span>
  ) : (
    "Fetch label"
  )}
</Button>
```

---

### Ghost Button (minor / destructive-light)

```tsx
<Button
  onClick={handler}
  disabled={loading}
  variant="ghost"
  size="sm"
  className="self-start text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
>
  Clear
</Button>
```

---

### Data Result Panel (`<dl>`)

Used to display key-value results after reading a contract or fetching a balance.

```tsx
<dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800
               bg-zinc-950/60 px-4">
  <div className="flex items-center justify-between py-3">
    <dt className="text-xs text-zinc-500">Key</dt>
    <dd className="font-mono text-sm text-zinc-100">Value</dd>
  </div>
  {/* Cyan accent for token amounts / addresses */}
  <div className="flex items-center justify-between py-3">
    <dt className="text-xs text-zinc-500">Symbol</dt>
    <dd className="font-mono text-sm text-cyan-300">TKN</dd>
  </div>
  {/* Truncated address */}
  <div className="flex items-center justify-between py-3">
    <dt className="text-xs text-zinc-500">Address</dt>
    <dd className="truncate font-mono text-xs text-zinc-400" title={fullAddress}>
      {fullAddress}
    </dd>
  </div>
</dl>
```

---

### Multi-row `dd` (stacked values in a single row)

Used in the event feed when a row has two related values (e.g. assets + shares in ERC-4626, or tokenId + tokenURI in ERC-721).

```tsx
<dd className="flex flex-col items-end gap-0.5">
  <span className="font-mono text-sm text-cyan-300">primary value</span>
  <span className="font-mono text-xs text-zinc-500">secondary value</span>
</dd>
```

---

### Section Divider

```tsx
<div className="flex items-center gap-3">
  <Separator className="flex-1 bg-zinc-800" />
  <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">
    section label
  </span>
  <Separator className="flex-1 bg-zinc-800" />
</div>
```

---

### Header with Status Badge + Wallet Badge

```tsx
<div className="flex items-center justify-between">
  <div className="flex flex-col gap-1">
    <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
      ERC-20
    </span>
    <h1 className="text-xl font-semibold text-zinc-50">Token Console</h1>
  </div>

  <div className="flex items-center gap-2">
    {/* Processing / idle dot */}
    <Badge variant="outline"
      className="gap-1.5 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
      <span className={`h-1.5 w-1.5 rounded-full ${
        loading ? "animate-pulse bg-amber-400" : "bg-emerald-400"
      }`} />
      {loading ? "processing" : "idle"}
    </Badge>

    {account ? (
      <>
        {/* Chain ID badge — show raw chainId, not hardcoded name */}
        <Badge variant="outline"
          className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
          {chainId}
        </Badge>
        {/* Wallet address badge */}
        <Badge variant="outline"
          className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-cyan-300">
          {account.slice(0, 6)}...{account.slice(-4)}
        </Badge>
      </>
    ) : (
      <Button
        onClick={connectWallet}
        size="sm"
        className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
      >
        Connect Wallet
      </Button>
    )}
  </div>
</div>
```

---

### Status / Info Banners

```tsx
{/* Processing / warning */}
<div className="flex items-center gap-2 rounded-md border border-amber-500/30
                bg-amber-500/10 px-3 py-2">
  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
  <span className="font-mono text-xs text-amber-300">{statusMessage}</span>
</div>

{/* Error */}
<div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
  <p className="font-mono text-xs text-red-400">⚠ {errorMessage}</p>
  <p className="mt-1 text-xs text-zinc-500">
    Additional hint with <code className="text-zinc-300">inline code</code>.
  </p>
</div>
```

---

### Indexer Card Header (title + inline Refresh button)

The Event Feed card uses a split `CardHeader` — title/description on the left, a small Refresh button on the right. This is the only card with this pattern.

```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="text-base text-zinc-100">Event Feed</CardTitle>
      <CardDescription className="text-zinc-500">
        Live events indexed by The Graph.
      </CardDescription>
    </div>
    <Button
      onClick={fetchIndexerEvents}
      disabled={indexerLoading}
      variant="outline"
      size="sm"
      className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
    >
      {indexerLoading ? (
        <span className="flex items-center gap-1.5">
          <Spinner className="h-3 w-3" />
          Syncing
        </span>
      ) : (
        "Refresh"
      )}
    </Button>
  </div>
</CardHeader>
```

---

### Event Feed List (Transfers / Approvals)

```tsx
<div className="flex flex-col gap-2">
  <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">
    Transfers
  </p>
  <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800
                 bg-zinc-950/60 px-4">
    {items.map((evt) => (
      <div key={evt.id} className="flex items-center justify-between py-3">
        <dt className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-zinc-500">
            {evt.from.slice(0, 6)}…{evt.from.slice(-4)}
            {" → "}
            {evt.to.slice(0, 6)}…{evt.to.slice(-4)}
          </span>
          <span className="font-mono text-[10px] text-zinc-700">
            {new Date(Number(evt.blockTimestamp) * 1000).toLocaleTimeString()}
          </span>
        </dt>
        {/* Cyan for transfer values, Emerald for approval values */}
        <dd className="font-mono text-sm text-cyan-300">{evt.value}</dd>
      </div>
    ))}
  </dl>
</div>
```

---

## 6. State Variables Reference

All state used in `ContractInteraction`. Replicate the relevant subset in derived components.

### Wallet / Chain
| State | Type | Purpose |
|---|---|---|
| `account` | `string` | Connected wallet address |
| `chainId` | `string` | Raw hex chain ID (e.g. `"0xaa36a7"`) |
| `walletLoading` | `boolean` | Initial wallet detection |
| `connectingWallet` | `boolean` | Manual connect button loading |

### Indexer (graph)
| State | Type | Purpose |
|---|---|---|
| `indexerLoading` | `boolean` | Subgraph fetch in progress |
| `indexerError` | `string` | Subgraph error message (shown in red banner) |
| `indexerStatus` | `string` | Step-by-step tx progress ("Sending…", "Mining…", "Syncing…") — shown in amber banner, auto-clears after 4 s |
| `deposits` | `any[]` | Deposit events from subgraph |
| `withdraws` | `any[]` | Withdraw events from subgraph |
| `transfers` | `any[]` | Transfer events from subgraph |
| `approvals` | `any[]` | Approval events from subgraph |

### isAnyLoading (derived)
```ts
const isAnyLoading = walletLoading || totalAssetsLoading || assetLoading
  || totalSupplyLoading || balanceLoading || depositLoading
  || withdrawLoading || indexerLoading;
```
Used for the header status dot only. Individual loading booleans control per-button states.

---

## 7. 3-Step Write Transaction Pattern

Every mutating function follows the same 3-step flow, using `indexerStatus` to give the user live feedback:

```ts
const someWriteFn = async (...args) => {
  try {
    setSomeLoading(true);

    // Step 1 — submit tx
    setIndexerStatus('Sending transaction…');
    const tx = await contract.someMethod(...args);

    // Step 2 — wait for on-chain confirmation
    setIndexerStatus('Mining transaction…');
    const receipt = await tx.wait();

    // parse receipt logs here if needed...

    // Step 3 — trigger indexer poll
    setIndexerStatus('Syncing with indexer…');
    pollUntilUpdated(30_000, 3_000);
    setIndexerStatus('Success!');
  } catch (error) {
    setIndexerStatus('Failed');
    toast.error('Failed!', { position: 'top-center' });
  } finally {
    setSomeLoading(false);
    setTimeout(() => setIndexerStatus(''), 4_000); // auto-clear banner
  }
};
```

---

## 8. pollUntilUpdated Pattern

After a write tx, the subgraph indexer lags by a few seconds. This polling helper compares the current top event ID against the snapshot taken before the write. When a new event appears, it triggers a full `fetchIndexerEvents()` refresh.

```ts
const pollUntilUpdated = (maxWaitMs: number, intervalMs: number) => {
  const snapshotId = events[0]?.id ?? null;   // snapshot before write
  const deadline = Date.now() + maxWaitMs;

  const tick = async () => {
    if (Date.now() > deadline) return;
    try {
      const data = await querySubgraph(`{
        events(first: 1, orderBy: blockTimestamp, orderDirection: desc) { id }
      }`);
      const latestId = data.events?.[0]?.id ?? null;
      if (latestId && latestId !== snapshotId) {
        await fetchIndexerEvents();  // new event detected — full refresh
        return;
      }
    } catch (_) { /* silent */ }
    setTimeout(tick, intervalMs);
  };

  setTimeout(tick, intervalMs);
};
```

---

## 9. UX Conventions

| Convention | Detail |
|---|---|
| **Loading state** | Replace button label with `<Spinner h-4 w-4 /> Loading text` inside `flex items-center gap-2` |
| **Disabled rule** | Buttons disabled when `isLoading \|\| !account` (wallet required) |
| **Address display** | Always truncate: `addr.slice(0,6)}...{addr.slice(-4)}` |
| **Monospace rule** | All addresses, amounts, symbols, and hash-like data use `font-mono` |
| **Accent by type** | Cyan (`text-cyan-300`) for balances/transfers; Emerald (`text-emerald-300`) for approvals |
| **Conditional panels** | Result panels only mount when data is present — no empty shells |
| **Toast position** | `{ position: 'top-center' }` on all `toast.success` calls |
| **Toast types** | `toast.success`, `toast.error`, `toast.info` from `sonner` |
| **Empty state text** | `text-center font-mono text-xs text-zinc-600` |
| **ChainId** | Display raw hex chainId in the badge — do not hardcode network name |
| **Indexer banner** | `indexerStatus` amber banner auto-clears via `setTimeout(..., 4_000)` in the `finally` block |

---

---

# 🎨 ERC-721 NFT Console — Design Extension

> This section supplements the base design above for an ERC-721 NFT project.
> The core stack, color palette, typography, layout, and component patterns are identical.
> Only differences and additions are documented here.

---

## E1. Header Label Change

```tsx
<span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
  ERC-721
</span>
<h1 className="text-xl font-semibold text-zinc-50">NFT Console</h1>
```

---

## E2. State Variables (ERC-721 specific)

### Read-only contract info
| State | Type | Purpose |
|---|---|---|
| `nftName` | `string` | `name()` result |
| `nftSymbol` | `string` | `symbol()` result |
| `nameLoading` | `boolean` | `name()` fetch loading |
| `symbolLoading` | `boolean` | `symbol()` fetch loading |

### Token queries
| State | Type | Purpose |
|---|---|---|
| `tokenIdQuery` | `string` | Input for tokenId-based reads |
| `ownerOfResult` | `string` | Result of `ownerOf(tokenId)` |
| `ownerOfLoading` | `boolean` | `ownerOf` fetch loading |
| `tokenURIResult` | `string` | Result of `tokenURI(tokenId)` |
| `tokenURILoading` | `boolean` | `tokenURI` fetch loading |
| `getApprovedResult` | `string` | Result of `getApproved(tokenId)` |
| `getApprovedLoading` | `boolean` | `getApproved` fetch loading |

### Approval for all
| State | Type | Purpose |
|---|---|---|
| `isApprovedForAllOwner` | `string` | Owner address input |
| `isApprovedForAllOperator` | `string` | Operator address input |
| `isApprovedForAllResult` | `boolean \| null` | Result of `isApprovedForAll(owner, operator)` |
| `isApprovedForAllLoading` | `boolean` | Fetch loading |

### Balance
| State | Type | Purpose |
|---|---|---|
| `balanceAddress` | `string` | Address to check balance for |
| `balance` | `string` | `balanceOf(address)` result (count of tokens owned) |
| `balanceLoading` | `boolean` | Balance fetch loading |

### Write: Transfer
| State | Type | Purpose |
|---|---|---|
| `transferFrom_from` | `string` | `from` address |
| `transferFrom_to` | `string` | `to` address |
| `transferFrom_tokenId` | `string` | Token ID to transfer |
| `transferFromLoading` | `boolean` | Write loading |

### Write: Approve
| State | Type | Purpose |
|---|---|---|
| `approveToAddress` | `string` | Address to approve |
| `approveTokenId` | `string` | Token ID to approve |
| `approveLoading` | `boolean` | Write loading |

### Write: SetApprovalForAll
| State | Type | Purpose |
|---|---|---|
| `setApprovalOperator` | `string` | Operator address |
| `setApprovalApproved` | `boolean` | `true` = grant, `false` = revoke |
| `setApprovalLoading` | `boolean` | Write loading |

### Write: Mint (if contract supports it)
| State | Type | Purpose |
|---|---|---|
| `mintTo` | `string` | Receiver address |
| `mintTokenId` | `string` | Token ID to mint (if not auto-incremented) |
| `mintLoading` | `boolean` | Write loading |

### Indexer (graph) — ERC-721 events
| State | Type | Purpose |
|---|---|---|
| `nftTransfers` | `any[]` | `Transfer` events (from, to, tokenId) |
| `nftApprovals` | `any[]` | `Approval` events (owner, approved, tokenId) |
| `approvalForAlls` | `any[]` | `ApprovalForAll` events (owner, operator, approved) |
| `indexerLoading` | `boolean` | Same pattern as ERC-4626 |
| `indexerError` | `string` | Same pattern as ERC-4626 |
| `indexerStatus` | `string` | Same 3-step write pattern |

---

## E3. Key Differences from ERC-20/ERC-4626

| Concern | ERC-20 / ERC-4626 | ERC-721 |
|---|---|---|
| **Primary identifier** | `value` (uint256 amount) | `tokenId` (uint256 ID) |
| **Formatting** | `ethers.formatUnits(value, 18)` | `tokenId.toString()` — **no decimals** |
| **Balance meaning** | Token balance (fungible amount) | Count of NFTs owned |
| **Transfer event args** | `from, to, value` | `from, to, tokenId` |
| **Approval event args** | `owner, spender, value` | `owner, approved, tokenId` |
| **Extra event** | — | `ApprovalForAll(owner, operator, approved)` |
| **Read: ownerOf** | — | Returns address that owns a tokenId |
| **Read: tokenURI** | — | Returns metadata URI string |
| **Read: getApproved** | — | Returns single approved address for tokenId |
| **Read: isApprovedForAll** | — | Returns bool |
| **Write: approve** | `approve(spender, amount)` | `approve(to, tokenId)` |
| **Write: setApprovalForAll** | — | `setApprovalForAll(operator, bool)` |
| **Write: transferFrom** | `transferFrom(from, to, amount)` | `transferFrom(from, to, tokenId)` |
| **Write: safeTransferFrom** | — | `safeTransferFrom(from, to, tokenId)` |

---

## E4. NFT Info Card (Read-only)

Replaces the "Vault Info" card. Fetches `name()` and `symbol()`.

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">NFT Info</CardTitle>
    <CardDescription className="text-zinc-500">
      Read-only state from the ERC-721 contract.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-row flex-wrap gap-3">
      <Button variant="outline" onClick={fetchName} disabled={nameLoading || !account}
        className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
        {nameLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span> : "Name"}
      </Button>
      <Button variant="outline" onClick={fetchSymbol} disabled={symbolLoading || !account}
        className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
        {symbolLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span> : "Symbol"}
      </Button>
    </div>

    {(nftName || nftSymbol) && (
      <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
        {nftName && (
          <div className="flex items-center justify-between py-3">
            <dt className="text-xs text-zinc-500">Name</dt>
            <dd className="font-mono text-sm text-zinc-100">{nftName}</dd>
          </div>
        )}
        {nftSymbol && (
          <div className="flex items-center justify-between py-3">
            <dt className="text-xs text-zinc-500">Symbol</dt>
            <dd className="font-mono text-sm text-cyan-300">{nftSymbol}</dd>
          </div>
        )}
      </dl>
    )}
  </CardContent>
</Card>
```

---

## E5. Token Query Card (ownerOf / tokenURI / getApproved)

Single shared `tokenIdQuery` input; three separate fetch buttons.

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Token Query</CardTitle>
    <CardDescription className="text-zinc-500">
      Look up owner, URI, or approval by token ID.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="tokenIdQuery" className="text-xs text-zinc-400">Token ID</Label>
      <Input id="tokenIdQuery" type="number" value={tokenIdQuery}
        onChange={(e) => setTokenIdQuery(e.target.value)} placeholder="0"
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>

    <div className="flex flex-row flex-wrap gap-3">
      <Button variant="outline" onClick={() => fetchOwnerOf(tokenIdQuery)} disabled={ownerOfLoading || !account}
        className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
        {ownerOfLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span> : "ownerOf"}
      </Button>
      <Button variant="outline" onClick={() => fetchTokenURI(tokenIdQuery)} disabled={tokenURILoading || !account}
        className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
        {tokenURILoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span> : "tokenURI"}
      </Button>
      <Button variant="outline" onClick={() => fetchGetApproved(tokenIdQuery)} disabled={getApprovedLoading || !account}
        className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
        {getApprovedLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span> : "getApproved"}
      </Button>
    </div>

    {(ownerOfResult || tokenURIResult || getApprovedResult) && (
      <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
        {ownerOfResult && (
          <div className="flex items-center justify-between py-3">
            <dt className="text-xs text-zinc-500">Owner</dt>
            <dd className="truncate font-mono text-xs text-cyan-300 max-w-[60%]" title={ownerOfResult}>
              {ownerOfResult.slice(0, 10)}…{ownerOfResult.slice(-8)}
            </dd>
          </div>
        )}
        {tokenURIResult && (
          <div className="flex items-center justify-between py-3">
            <dt className="text-xs text-zinc-500">Token URI</dt>
            <dd className="truncate font-mono text-xs text-cyan-300 max-w-[60%]" title={tokenURIResult}>
              {tokenURIResult}
            </dd>
          </div>
        )}
        {getApprovedResult && (
          <div className="flex items-center justify-between py-3">
            <dt className="text-xs text-zinc-500">Approved</dt>
            <dd className="truncate font-mono text-xs text-emerald-300 max-w-[60%]" title={getApprovedResult}>
              {getApprovedResult.slice(0, 10)}…{getApprovedResult.slice(-8)}
            </dd>
          </div>
        )}
      </dl>
    )}
  </CardContent>
</Card>
```

---

## E6. isApprovedForAll Card

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Is Approved For All</CardTitle>
    <CardDescription className="text-zinc-500">
      Check if an operator is approved to manage all of an owner's NFTs.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="isApprovedOwner" className="text-xs text-zinc-400">Owner Address</Label>
      <Input id="isApprovedOwner" type="text" value={isApprovedForAllOwner}
        onChange={(e) => setIsApprovedForAllOwner(e.target.value)} placeholder="0x..."
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="isApprovedOperator" className="text-xs text-zinc-400">Operator Address</Label>
      <Input id="isApprovedOperator" type="text" value={isApprovedForAllOperator}
        onChange={(e) => setIsApprovedForAllOperator(e.target.value)} placeholder="0x..."
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>
    <Button variant="outline" onClick={checkIsApprovedForAll} disabled={isApprovedForAllLoading || !account}
      className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
      {isApprovedForAllLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span> : "Check"}
    </Button>

    {isApprovedForAllResult !== null && (
      <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
        <div className="flex items-center justify-between py-3">
          <dt className="text-xs text-zinc-500">Approved For All</dt>
          {/* Green for true, zinc for false */}
          <dd className={`font-mono text-sm ${isApprovedForAllResult ? "text-emerald-300" : "text-zinc-400"}`}>
            {isApprovedForAllResult ? "true" : "false"}
          </dd>
        </div>
      </dl>
    )}
  </CardContent>
</Card>
```

---

## E7. Transfer Card (transferFrom / safeTransferFrom)

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Transfer NFT</CardTitle>
    <CardDescription className="text-zinc-500">
      Transfer a token from one address to another.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    {/* from / to in a 2-column grid */}
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transferFrom" className="text-xs text-zinc-400">From</Label>
        <Input id="transferFrom" type="text" value={transferFrom_from}
          onChange={(e) => setTransferFrom_from(e.target.value)} placeholder="0x..."
          className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transferTo" className="text-xs text-zinc-400">To</Label>
        <Input id="transferTo" type="text" value={transferFrom_to}
          onChange={(e) => setTransferFrom_to(e.target.value)} placeholder="0x..."
          className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
      </div>
    </div>
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="transferTokenId" className="text-xs text-zinc-400">Token ID</Label>
      <Input id="transferTokenId" type="number" value={transferFrom_tokenId}
        onChange={(e) => setTransferFrom_tokenId(e.target.value)} placeholder="0"
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>
    <Button onClick={() => transferFrom(transferFrom_from, transferFrom_to, transferFrom_tokenId)}
      disabled={transferFromLoading || !account || !transferFrom_from || !transferFrom_to || !transferFrom_tokenId}
      className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
      {transferFromLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Transferring…</span> : "Transfer"}
    </Button>
  </CardContent>
</Card>
```

---

## E8. Approve Card

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Approve</CardTitle>
    <CardDescription className="text-zinc-500">
      Approve an address to transfer a specific token.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="approveTo" className="text-xs text-zinc-400">Approved Address</Label>
      <Input id="approveTo" type="text" value={approveToAddress}
        onChange={(e) => setApproveToAddress(e.target.value)} placeholder="0x..."
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="approveTokenId" className="text-xs text-zinc-400">Token ID</Label>
      <Input id="approveTokenId" type="number" value={approveTokenId}
        onChange={(e) => setApproveTokenId(e.target.value)} placeholder="0"
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>
    <Button onClick={() => approve(approveToAddress, approveTokenId)}
      disabled={approveLoading || !account || !approveToAddress || !approveTokenId}
      className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
      {approveLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Approving…</span> : "Approve"}
    </Button>
  </CardContent>
</Card>
```

---

## E9. SetApprovalForAll Card

```tsx
<Card className="border-zinc-800 bg-zinc-900/40">
  <CardHeader>
    <CardTitle className="text-base text-zinc-100">Set Approval For All</CardTitle>
    <CardDescription className="text-zinc-500">
      Grant or revoke operator access to all your NFTs.
    </CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="setApprovalOperator" className="text-xs text-zinc-400">Operator Address</Label>
      <Input id="setApprovalOperator" type="text" value={setApprovalOperator}
        onChange={(e) => setSetApprovalOperator(e.target.value)} placeholder="0x..."
        className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40" />
    </div>
    {/* Toggle: Grant / Revoke */}
    <div className="flex gap-3">
      <Button variant={setApprovalApproved ? "outline" : "ghost"} size="sm"
        onClick={() => setSetApprovalApproved(true)}
        className={setApprovalApproved
          ? "flex-1 border-emerald-700 bg-transparent text-emerald-300 hover:bg-zinc-800"
          : "flex-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}>
        Grant
      </Button>
      <Button variant={!setApprovalApproved ? "outline" : "ghost"} size="sm"
        onClick={() => setSetApprovalApproved(false)}
        className={!setApprovalApproved
          ? "flex-1 border-red-700 bg-transparent text-red-300 hover:bg-zinc-800"
          : "flex-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}>
        Revoke
      </Button>
    </div>
    <Button onClick={() => setApprovalForAll(setApprovalOperator, setApprovalApproved)}
      disabled={setApprovalLoading || !account || !setApprovalOperator}
      className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
      {setApprovalLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Setting…</span> : "Set Approval For All"}
    </Button>
  </CardContent>
</Card>
```

---

## E10. Subgraph Query (ERC-721)

ERC-721 subgraph queries use `tokenId` (integer string, no formatting) instead of `value`/`assets`/`shares`.

```ts
const fetchIndexerEvents = async () => {
  const data = await querySubgraph(`{
    transfers(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
      id from to tokenId blockTimestamp transactionHash
    }
    approvals(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
      id owner approved tokenId blockTimestamp transactionHash
    }
    approvalForAlls(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
      id owner operator approved blockTimestamp transactionHash
    }
  }`);

  setNftTransfers(data.transfers ?? []);
  setNftApprovals(data.approvals ?? []);
  setApprovalForAlls(data.approvalForAlls ?? []);
};
```

**pollUntilUpdated** — snapshot off `nftTransfers[0]?.id`.

---

## E11. Event Feed (ERC-721 variant)

### Transfers
```tsx
<div className="flex flex-col gap-2">
  <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Transfers</p>
  <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
    {nftTransfers.map((t) => (
      <div key={t.id} className="flex items-center justify-between py-3">
        <dt className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-zinc-500">
            {t.from.slice(0, 6)}…{t.from.slice(-4)}
            {" → "}
            {t.to.slice(0, 6)}…{t.to.slice(-4)}
          </span>
          <span className="font-mono text-[10px] text-zinc-700">
            {new Date(Number(t.blockTimestamp) * 1000).toLocaleTimeString()}
          </span>
        </dt>
        {/* Token ID — no formatUnits, just the raw number */}
        <dd className="font-mono text-sm text-cyan-300">#{t.tokenId}</dd>
      </div>
    ))}
  </dl>
</div>
```

### Approvals
```tsx
<div className="flex flex-col gap-2">
  <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Approvals</p>
  <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
    {nftApprovals.map((a) => (
      <div key={a.id} className="flex items-center justify-between py-3">
        <dt className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-zinc-500">
            {a.owner.slice(0, 6)}…{a.owner.slice(-4)}
            {" approved "}
            {a.approved.slice(0, 6)}…{a.approved.slice(-4)}
          </span>
          <span className="font-mono text-[10px] text-zinc-700">
            {new Date(Number(a.blockTimestamp) * 1000).toLocaleTimeString()}
          </span>
        </dt>
        <dd className="font-mono text-sm text-emerald-300">#{a.tokenId}</dd>
      </div>
    ))}
  </dl>
</div>
```

### ApprovalForAll
```tsx
<div className="flex flex-col gap-2">
  <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Approval For All</p>
  <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
    {approvalForAlls.map((a) => (
      <div key={a.id} className="flex items-center justify-between py-3">
        <dt className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-zinc-500">
            {a.owner.slice(0, 6)}…{a.owner.slice(-4)}
            {" → "}
            {a.operator.slice(0, 6)}…{a.operator.slice(-4)}
          </span>
          <span className="font-mono text-[10px] text-zinc-700">
            {new Date(Number(a.blockTimestamp) * 1000).toLocaleTimeString()}
          </span>
        </dt>
        {/* Boolean result: emerald = granted, zinc = revoked */}
        <dd className={`font-mono text-sm ${a.approved ? "text-emerald-300" : "text-zinc-400"}`}>
          {a.approved ? "granted" : "revoked"}
        </dd>
      </div>
    ))}
  </dl>
</div>
```

---

## E12. ERC-721 UX Conventions (additions)

| Convention | Detail |
|---|---|
| **Token ID display** | Prefix with `#` — e.g. `#42`. No decimal formatting. |
| **No `ethers.formatUnits`** | Token IDs are raw integers — use `.toString()` or template literals only |
| **Boolean approval result** | Emerald (`text-emerald-300`) for `true`; zinc-400 for `false` |
| **setApprovalForAll toggle** | Grant/Revoke button pair — active button uses tinted outline; inactive uses ghost style |
| **tokenURI display** | Truncate long URIs; use `title={fullUri}` for hover tooltip |
| **safeTransferFrom** | Add a secondary "Safe Transfer" button to the Transfer card if the contract supports it |
| **Empty state** | Same pattern: `text-center font-mono text-xs text-zinc-600` |
| **indexerStatus / pollUntilUpdated** | Identical to ERC-4626 — snapshot off `nftTransfers[0]?.id` |
