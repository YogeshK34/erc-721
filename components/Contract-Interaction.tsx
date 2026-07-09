'use client'
/*eslint-disable*/

import { useEffect, useState } from "react"
import { toast } from "sonner";
import { Contract, ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "@/config";
import { Spinner } from "./ui/spinner";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/1756082/erc-721/version/latest";

export const ContractInteraction = () => {
    // ── existing state ────────────────────────────────────────────────────────
    const [mintTo, setMintTo] = useState<string>('');
    const [mintLoading, setMintLoading] = useState<boolean>(false);
    const [tokenId, setTokenId] = useState<string>('');

    const [walletFetching, setWalletFetching] = useState<boolean>(false);
    const [account, setAccount] = useState<string>('');
    const [chainId, setChainId] = useState<string>('');

    const [connectingWallet, setConnectingWallet] = useState<boolean>(false);

    const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
    const [balance, setBalance] = useState<string>('');
    const [balanceAddress, setBalanceAddress] = useState<string>('');

    const [ownerLoading, setOwnerLoading] = useState<boolean>(false);
    const [fetchOwnerForToken, setFetchOwnerForToken] = useState<string>('');
    const [owner, setOwner] = useState<string>('');

    const [safeTransferLoading, setSafeTransferLoading] = useState<boolean>(false);
    const [safeTransferFromAddress, setSafeTransferFromAddress] = useState<string>('');
    const [safeTransferToAddress, setSafeTransferToAddress] = useState<string>('');
    const [safeTransferTokenId, setSafeTransferTokenId] = useState<string>('');

    const [transferLoading, setTransferLoading] = useState<boolean>(false);
    const [transferFromAddress, setTransferFromAddress] = useState<string>('');
    const [transferToAddress, setTransferToAddress] = useState<string>('');
    const [transferTokenId, setTransferTokenId] = useState<string>('');

    const [approveLoading, setApproveLoading] = useState<boolean>(false);
    const [approveAddress, setApproveAddress] = useState<string>('');
    const [approveToken, setApproveToken] = useState<string>('');

    const [approvalForAllLoading, setApprovalForAllLoading] = useState<boolean>(false);
    const [approvalForAllAddress, setApprovForAllAddress] = useState<string>('');
    const [isApproved, setIsApproved] = useState<boolean>(false);

    const [getApprovedLoading, setGetApprovedLoading] = useState<boolean>(false);
    const [approvedAddress, setApprovedAddress] = useState<string>('');
    const [checkApprovalForToken, setCheckApprovalForToken] = useState<string>('');

    const [isApprovedForAllLoading, setIsApprovedForAllLoading] = useState<boolean>(false);
    const [approvedForAllOwner, setApprovedForAllOwner] = useState<string>('');
    const [approvedForAllOperator, setApprovedForAllOperator] = useState<string>('');
    const [resultApproveForAll, setResultApprovedForAll] = useState<boolean | null>(null);

    // ── new state (design.md E2) ──────────────────────────────────────────────
    const [nftName, setNftName] = useState<string>('');
    const [nftSymbol, setNftSymbol] = useState<string>('');
    const [nameLoading, setNameLoading] = useState<boolean>(false);
    const [symbolLoading, setSymbolLoading] = useState<boolean>(false);

    // shared tokenId input for the Token Query card
    const [tokenIdQuery, setTokenIdQuery] = useState<string>('');

    // indexer state
    const [indexerLoading, setIndexerLoading] = useState<boolean>(false);
    const [indexerError, setIndexerError] = useState<string>('');
    const [indexerStatus, setIndexerStatus] = useState<string>('');

    // ERC-721 event arrays
    const [nftTransfers, setNftTransfers] = useState<any[]>([]);
    const [nftApprovals, setNftApprovals] = useState<any[]>([]);
    const [approvalForAlls, setApprovalForAlls] = useState<any[]>([]);

    // derived: any operation in progress → amber dot
    const isAnyLoading =
        walletFetching || mintLoading || balanceLoading || ownerLoading ||
        safeTransferLoading || transferLoading || approveLoading ||
        approvalForAllLoading || getApprovedLoading || isApprovedForAllLoading ||
        nameLoading || symbolLoading || indexerLoading;

    // ── existing utility functions (DO NOT MODIFY) ────────────────────────────
    const checkExistingWallet = async () => {
        try {
            if (typeof window === 'undefined' || !window.ethereum) return toast.error('Metamask not installed!', { position: 'top-center' });
            setWalletFetching(true);

            const fetchAccounts = await window.ethereum.request({
                method: 'eth_accounts'
            }) as string[];
            if (fetchAccounts.length > 0) setAccount(fetchAccounts[0]);

            const fetchChain = await window.ethereum.request({
                method: 'eth_chainId'
            }) as string;
            if (fetchChain) setChainId(fetchChain);

        } catch (error) {
            console.error(error);
            return toast.error('Failed to load wallet!', { position: 'top-center' });

        } finally {
            setWalletFetching(false);
        }
    };

    useEffect(() => {
        checkExistingWallet();
        fetchIndexerEvents();

        const handleAccountChanged = async (accounts: string[]) => {
            try {
                if (accounts.length === 0) { setAccount('') } else { setAccount(accounts[0]) };
            } catch (error) {
                console.error(error);
                return toast.error('Failed to load new account!', { position: 'top-center' });
            }
        };

        const handleChainChanged = async (chainId: string) => {
            try {
                if (!chainId) { setChainId('') } else { setChainId(chainId) };
            } catch (error) {
                console.error(error);
                return toast.error('Failed to load ChainId!', { position: 'top-center' })
            }
        };

        window.ethereum?.on('accountsChanged', handleAccountChanged);
        window.ethereum?.on('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountChanged);
            window.ethereum?.removeListener('chainChanged', handleChainChanged);
        };
    }, []);

    const connectWallet = async () => {
        try {
            if (typeof window === 'undefined' || !window.ethereum) return toast.error('Metamask not installed!', { position: 'top-center' });
            setConnectingWallet(true);

            const fetchAccounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            }) as string[];

            if (fetchAccounts.length > 0) setAccount(fetchAccounts[0]);

            const fetchChain = await window.ethereum.request({
                method: 'eth_chainId'
            }) as string;
            if (fetchChain) setChainId(fetchChain);

            return toast.success('Wallet connected!', { position: 'top-center' });
        } catch (error) {
            console.error(error);
            return toast.error('Failed to connect wallet!', { position: 'top-center' });
        } finally {
            setConnectingWallet(false);
        }
    }

    const getSignerContract = async () => {
        if (!window.ethereum) {
            toast.error('Metamask not installed!', { position: 'top-center' });
            return null;
        };

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new Contract(CONTRACT_ADDRESS, ABI, signer);
    };

    const getProviderContract = async (): Promise<Contract | null> => {
        if (!window.ethereum) {
            toast.error('Metamask not installed!', { position: 'top-center' });
            return null;
        };

        const provider = new ethers.BrowserProvider(window.ethereum);
        return new Contract(CONTRACT_ADDRESS, ABI, provider);
    };

    const mint = async (mintTo: string) => {
        try {
            if (!ethers.isAddress(mintTo)) return toast.error('Invalid address!', { position: 'top-center' })
            setMintLoading(true);
            setIndexerStatus('Sending transaction…');
            const contract = await getSignerContract();
            if (!contract) return;

            const tx = await contract.mint(mintTo);
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();

            const parseLogs = receipt.logs.map((log: any) => {
                try {
                    return contract.interface.parseLog(log);
                } catch (error: any) {

                    const message =
                        error.reason ??
                        error.revert?.args?.[0] ??
                        error.shortMessage ??
                        error.message ??
                        'Failed to parse event logs';

                    return toast.error(message, { position: 'top-center' });
                }
            });
            const transferLogs = parseLogs.find((parsed: any) => parsed?.name === 'Transfer');
            if (transferLogs) {
                const mintedId = transferLogs.args[2].toString();
                setTokenId(mintedId);
                setMintTo('');
                setIndexerStatus('Syncing with indexer…');
                pollUntilUpdated(30_000, 3_000);
                toast.success(`Mint successful! Minted token #${mintedId}!`, { position: 'top-center' });
            }

        } catch (error: any) {
            setIndexerStatus('Failed');
            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Transaction failed!';

            return toast.error(message, { position: 'top-center' });
        }
        finally {
            setMintLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    }

    const getBalance = async (checkBalanceFor: string) => {
        try {
            if (!ethers.isAddress(checkBalanceFor)) return toast.error('Invalid address!', { position: 'top-center' })
            setBalanceLoading(true);
            const contract = await getProviderContract();

            const fetchBalance = await contract?.balanceOf(checkBalanceFor);
            if (fetchBalance === null || fetchBalance === undefined) { return toast.error('Failed to fetch balance!') } else { setBalance(fetchBalance.toString()) };
            setBalanceAddress('');
            return;

        } catch (error) {
            console.error(error);
            return toast.error('Failed to fetch balance!', { position: 'top-center' });
        } finally {
            setBalanceLoading(false);
        };
    };

    const getOwner = async (tokenId: string) => {
        try {
            setOwnerLoading(true);

            const contract = await getProviderContract();
            if (!contract) return;

            const fetchOwner = await contract.ownerOf(tokenId);
            if (fetchOwner === ethers.ZeroAddress) return toast.info('Token is non-existant!', { position: 'top-center' });
            setOwner(fetchOwner);
            setFetchOwnerForToken('');
            return;

        } catch (error) {
            console.error(error);
            return toast.error('Failed to fetch owner', { position: 'top-center' });
        } finally {
            setOwnerLoading(false);
        };
    };

    const safeTransferFrom = async (from: string, to: string, tokenId: string) => {
        try {
            if (!ethers.isAddress(from)) return toast.error('Invalid from address!', { position: 'top-center' });
            if (!ethers.isAddress(to)) return toast.error('Invalid to address!', { position: 'top-center' })
            setSafeTransferLoading(true);
            setIndexerStatus('Sending transaction…');

            const contract = await getSignerContract();
            const tx = await contract?.safeTransferFrom(from, to, tokenId);
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();

            const parseLogs = receipt.logs.map((log: any) => {
                try {
                    return contract?.interface.parseLog(log);
                } catch (error) {
                    console.error(error);
                    return toast.error('Failed to parse tx logs!', { position: 'top-center' })
                }
            })
            const transferLogs = parseLogs.find((parsed: any) => parsed?.name === 'Transfer');
            if (transferLogs) {
                toast.success('Transfer succeded!', { position: 'top-center' });
                setIndexerStatus('Syncing with indexer…');
                pollUntilUpdated(30_000, 3_000);

                setSafeTransferFromAddress('');
                setSafeTransferToAddress('');
                setSafeTransferTokenId('');
                return;
            } else {
                setIndexerStatus('Failed');
                return toast.error('Failed to transfer!', { position: 'top-center' })
            }

        } catch (error: any) {
            console.error(error);
            setIndexerStatus('Failed');

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Transaction failed!';

            return toast.error(message, { position: 'top-center' });
        } finally {
            setSafeTransferLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    }

    const transferFrom = async (from: string, to: string, tokenId: string) => {
        try {
            if (!ethers.isAddress(from)) return toast.error('Invalid from address!', { position: 'top-center' });
            if (!ethers.isAddress(to)) return toast.error('Invalid to address!', { position: 'top-center' })
            setTransferLoading(true);
            setIndexerStatus('Sending transaction…');

            const contract = await getSignerContract();
            const tx = await contract?.transferFrom(from, to, tokenId);
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();

            const parseLogs = receipt.logs.map((log: any) => {
                try {
                    return contract?.interface.parseLog(log);
                } catch (error) {
                    console.error(error);
                    return toast.error('Failed to parse tx logs!', { position: 'top-center' })
                }
            })
            const transferLogs = parseLogs.find((parsed: any) => parsed?.name === 'Transfer');
            if (transferLogs) {
                toast.success('Transfer succeded!', { position: 'top-center' });
                setIndexerStatus('Syncing with indexer…');
                pollUntilUpdated(30_000, 3_000);

                setTransferFromAddress('');
                setTransferToAddress('');
                setTransferTokenId('');
                return;
            } else {
                setIndexerStatus('Failed');
                return toast.error('Failed to transfer!', { position: 'top-center' })
            }

        } catch (error: any) {
            console.error(error);
            setIndexerStatus('Failed');

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Transaction failed!';

            return toast.error(message, { position: 'top-center' });
        } finally {
            setTransferLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        }
    };

    const approve = async (address: string, tokenId: string) => {
        try {
            if (!ethers.isAddress(address)) return toast.error('Invalid address', { position: 'top-center' })
            setApproveLoading(true);
            setIndexerStatus('Sending transaction…');

            const contract = await getSignerContract();
            const tx = await contract?.approve(address, tokenId);
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();
            const parseLogs = receipt.logs.map((log: any) => {
                try {
                    return contract?.interface.parseLog(log);
                } catch (error: any) {

                    const message =
                        error.reason ??
                        error.revert?.args?.[0] ??
                        error.shortMessage ??
                        error.message ??
                        'Failed to parse event logs';

                    return toast.error(message, { position: 'top-center' });
                }
            });

            const approveLogs = parseLogs.find((parsed: any) => parsed?.name === 'Approval');
            if (approveLogs) {
                toast.success('Approval succeded!', { position: 'top-center' });
                setIndexerStatus('Syncing with indexer…');
                pollUntilUpdated(30_000, 3_000);

                setApproveAddress('');
                setApproveToken('');
                return;
            };

        } catch (error: any) {
            console.error(error);
            setIndexerStatus('Failed');

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Failed to approve';

            return toast.error(message, { position: 'top-center' })
        } finally {
            setApproveLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        };
    };


    const setApprovalForAll = async (address: string, isApproved: boolean) => {
        try {
            if (!ethers.isAddress(address)) return toast.error('Invalid address', { position: 'top-center' })
            setApprovalForAllLoading(true);
            setIndexerStatus('Sending transaction…');

            const contract = await getSignerContract();
            const tx = await contract?.setApprovalForAll(address, isApproved);
            setIndexerStatus('Mining transaction…');
            const receipt = await tx.wait();
            const parseLogs = receipt.logs.map((log: any) => {
                try {
                    return contract?.interface.parseLog(log);
                } catch (error: any) {

                    const message =
                        error.reason ??
                        error.revert?.args?.[0] ??
                        error.shortMessage ??
                        error.message ??
                        'Failed to parse event logs';

                    return toast.error(message, { position: 'top-center' });
                }
            });

            const approveLogs = parseLogs.find((parsed: any) => parsed?.name === 'ApprovalForAll');
            if (approveLogs) {
                toast.success('Approval succeded!', { position: 'top-center' });
                setIndexerStatus('Syncing with indexer…');
                pollUntilUpdated(30_000, 3_000);

                setApprovForAllAddress('');
                setIsApproved(false);
                return;
            };

        } catch (error: any) {
            console.error(error);
            setIndexerStatus('Failed');

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Failed to approve';

            return toast.error(message, { position: 'top-center' })
        } finally {
            setApprovalForAllLoading(false);
            setTimeout(() => setIndexerStatus(''), 4_000);
        };
    };

    const getApproved = async (tokenId: string) => {
        try {
            setGetApprovedLoading(true);
            const contract = await getProviderContract();
            const approvedAddr = await contract?.getApproved(tokenId);

            if (!approvedAddr || approvedAddr === ethers.ZeroAddress) return toast.info('Approval not set!', { position: 'top-center' });
            setApprovedAddress(approvedAddr);
            setCheckApprovalForToken('');

        } catch (error: any) {

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Failed to check approval';

            return toast.error(message, { position: 'top-center' })

        } finally {
            setGetApprovedLoading(false);
        }
    }

    const isApprovedForAll = async (owner: string, operator: string) => {
        try {
            if (!ethers.isAddress(owner)) return toast.error('Invalid owner address!', { position: 'top-center' });
            if (!ethers.isAddress(operator)) return toast.error('Invalid operator address!', { position: 'top-center' });

            setIsApprovedForAllLoading(true);
            const contract = await getProviderContract();
            const isApprovedForAll = await contract?.isApprovedForAll(owner, operator);
            setResultApprovedForAll(isApprovedForAll);
            return

        } catch (error: any) {

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Failed to check approval';

            return toast.error(message, { position: 'top-center' })

        } finally {
            setIsApprovedForAllLoading(false);
        }
    }

    // ── new functions (design.md §7–§8, E10) ─────────────────────────────────

    const fetchName = async () => {
        try {
            setNameLoading(true);
            const contract = await getProviderContract();
            if (!contract) return;
            const result = await contract.name();
            setNftName(result);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch name!', { position: 'top-center' });
        } finally {
            setNameLoading(false);
        }
    };

    const fetchSymbol = async () => {
        try {
            setSymbolLoading(true);
            const contract = await getProviderContract();
            if (!contract) return;
            const result = await contract.symbol();
            setNftSymbol(result);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch symbol!', { position: 'top-center' });
        } finally {
            setSymbolLoading(false);
        }
    };

    const querySubgraph = async (query: string) => {
        const res = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        return json.data;
    };

    const fetchIndexerEvents = async () => {
        try {
            setIndexerLoading(true);
            setIndexerError('');
            const data = await querySubgraph(`{
                transfers(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                    id _from _to _tokenId blockTimestamp transactionHash
                }
                approvals(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                    id _owner _approved _tokenId blockTimestamp transactionHash
                }
                approvalForAlls(first: 10, orderBy: blockTimestamp, orderDirection: desc) {
                    id _owner _operator _approved blockTimestamp transactionHash
                }
            }`);
            setNftTransfers(data.transfers ?? []);
            setNftApprovals(data.approvals ?? []);
            setApprovalForAlls(data.approvalForAlls ?? []);
        } catch (error: any) {
            setIndexerError(error.message ?? 'Failed to fetch indexer events');
        } finally {
            setIndexerLoading(false);
        }
    };

    const pollUntilUpdated = (maxWaitMs: number, intervalMs: number) => {
        const snapshotId = nftTransfers[0]?.id ?? null;
        const deadline = Date.now() + maxWaitMs;

        const tick = async () => {
            if (Date.now() > deadline) {
                setIndexerStatus('');
                return;
            }
            try {
                const data = await querySubgraph(`{
                    transfers(first: 1, orderBy: blockTimestamp, orderDirection: desc) { id }
                }`);
                const latestId = data.transfers?.[0]?.id ?? null;
                if (latestId && latestId !== snapshotId) {
                    await fetchIndexerEvents();
                    setIndexerStatus('Synced ✓');
                    setTimeout(() => setIndexerStatus(''), 2_000);
                    return;
                }
            } catch (_) { /* silent */ }
            setTimeout(tick, intervalMs);
        };

        setTimeout(tick, intervalMs);
    };

    // ── JSX ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen w-full bg-zinc-950 py-16 px-4 text-zinc-100">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">ERC-721</span>
                        <h1 className="text-xl font-semibold text-zinc-50">NFT Console</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1.5 border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
                            <span className={`h-1.5 w-1.5 rounded-full ${isAnyLoading ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`} />
                            {isAnyLoading ? "processing" : "idle"}
                        </Badge>
                        {account ? (
                            <>
                                <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-zinc-400">
                                    {chainId}
                                </Badge>
                                <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-mono text-xs text-cyan-300">
                                    {account.slice(0, 6)}…{account.slice(-4)}
                                </Badge>
                            </>
                        ) : (
                            <Button onClick={connectWallet} size="sm" className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                                {connectingWallet
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Connecting…</span>
                                    : "Connect Wallet"}
                            </Button>
                        )}
                    </div>
                </div>



                {/* ── NFT Info Card (E4) ── */}
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
                                {nameLoading
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span>
                                    : "Name"}
                            </Button>
                            <Button variant="outline" onClick={fetchSymbol} disabled={symbolLoading || !account}
                                className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                                {symbolLoading
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span>
                                    : "Symbol"}
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

                {/* ── Balance Card ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Balance</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Check how many NFTs an address owns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="balanceAddress" className="text-xs text-zinc-400">Address</Label>
                            <Input
                                id="balanceAddress"
                                type="text"
                                value={balanceAddress}
                                onChange={(e) => setBalanceAddress(e.target.value)}
                                placeholder="0x..."
                                disabled={balanceLoading}
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <Button variant="outline" onClick={() => getBalance(balanceAddress)}
                            disabled={balanceLoading || !account}
                            className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                            {balanceLoading
                                ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span>
                                : "Check Balance"}
                        </Button>
                        {balance && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-zinc-500">NFTs Owned</dt>
                                    <dd className="font-mono text-sm text-cyan-300">{balance}</dd>
                                </div>
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── Mint Card ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Mint NFT</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Mint a new token to any address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="mintTo" className="text-xs text-zinc-400">Recipient Address</Label>
                            <Input
                                id="mintTo"
                                type="text"
                                value={mintTo}
                                onChange={(e) => setMintTo(e.target.value)}
                                placeholder="0x..."
                                disabled={mintLoading}
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <Button onClick={() => mint(mintTo)}
                            disabled={mintLoading || !account || !mintTo}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                            {mintLoading
                                ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Minting…</span>
                                : "Mint NFT"}
                        </Button>
                        {tokenId && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-zinc-500">Last Minted</dt>
                                    <dd className="font-mono text-sm text-cyan-300">#{tokenId}</dd>
                                </div>
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── Token Query Card (E5) — ownerOf + getApproved ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Token Query</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Look up owner or approval by token ID.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="tokenIdQuery" className="text-xs text-zinc-400">Token ID</Label>
                            <Input
                                id="tokenIdQuery"
                                type="number"
                                value={tokenIdQuery}
                                onChange={(e) => setTokenIdQuery(e.target.value)}
                                placeholder="0"
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <div className="flex flex-row flex-wrap gap-3">
                            <Button variant="outline" onClick={() => getOwner(tokenIdQuery)}
                                disabled={ownerLoading || !account}
                                className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                                {ownerLoading
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span>
                                    : "ownerOf"}
                            </Button>
                            <Button variant="outline" onClick={() => getApproved(tokenIdQuery)}
                                disabled={getApprovedLoading || !account}
                                className="flex-1 min-w-0 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                                {getApprovedLoading
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span>
                                    : "getApproved"}
                            </Button>
                        </div>
                        {(owner || approvedAddress) && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                {owner && (
                                    <div className="flex items-center justify-between py-3">
                                        <dt className="text-xs text-zinc-500">Owner</dt>
                                        <dd className="truncate font-mono text-xs text-cyan-300 max-w-[60%]" title={owner}>
                                            {owner.slice(0, 10)}…{owner.slice(-8)}
                                        </dd>
                                    </div>
                                )}
                                {approvedAddress && (
                                    <div className="flex items-center justify-between py-3">
                                        <dt className="text-xs text-zinc-500">Approved</dt>
                                        <dd className="truncate font-mono text-xs text-emerald-300 max-w-[60%]" title={approvedAddress}>
                                            {approvedAddress.slice(0, 10)}…{approvedAddress.slice(-8)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── isApprovedForAll Card (E6) ── */}
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
                            <Input
                                id="isApprovedOwner"
                                type="text"
                                value={approvedForAllOwner}
                                onChange={(e) => setApprovedForAllOwner(e.target.value)}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="isApprovedOperator" className="text-xs text-zinc-400">Operator Address</Label>
                            <Input
                                id="isApprovedOperator"
                                type="text"
                                value={approvedForAllOperator}
                                onChange={(e) => setApprovedForAllOperator(e.target.value)}
                                placeholder="0x..."
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <Button variant="outline"
                            onClick={() => isApprovedForAll(approvedForAllOwner, approvedForAllOperator)}
                            disabled={isApprovedForAllLoading || !account}
                            className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                            {isApprovedForAllLoading
                                ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Fetching…</span>
                                : "Check"}
                        </Button>
                        {resultApproveForAll !== null && (
                            <dl className="mt-1 divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-zinc-500">Approved For All</dt>
                                    <dd className={`font-mono text-sm ${resultApproveForAll ? "text-emerald-300" : "text-zinc-400"}`}>
                                        {resultApproveForAll ? "true" : "false"}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* ── Transfer NFT Card (E7) — transferFrom + safeTransferFrom ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-100">Transfer NFT</CardTitle>
                        <CardDescription className="text-zinc-500">
                            Transfer a token from one address to another.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="transferFrom" className="text-xs text-zinc-400">From</Label>
                                <Input
                                    id="transferFrom"
                                    type="text"
                                    value={transferFromAddress}
                                    onChange={(e) => setTransferFromAddress(e.target.value)}
                                    placeholder="0x..."
                                    disabled={transferLoading || safeTransferLoading}
                                    className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="transferTo" className="text-xs text-zinc-400">To</Label>
                                <Input
                                    id="transferTo"
                                    type="text"
                                    value={transferToAddress}
                                    onChange={(e) => setTransferToAddress(e.target.value)}
                                    placeholder="0x..."
                                    disabled={transferLoading || safeTransferLoading}
                                    className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="transferTokenId" className="text-xs text-zinc-400">Token ID</Label>
                            <Input
                                id="transferTokenId"
                                type="number"
                                value={transferTokenId}
                                onChange={(e) => setTransferTokenId(e.target.value)}
                                placeholder="0"
                                disabled={transferLoading || safeTransferLoading}
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => transferFrom(transferFromAddress, transferToAddress, transferTokenId)}
                                disabled={transferLoading || !account || !transferFromAddress || !transferToAddress || !transferTokenId}
                                className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                                {transferLoading
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Transferring…</span>
                                    : "Transfer"}
                            </Button>
                            <Button variant="outline"
                                onClick={() => safeTransferFrom(transferFromAddress, transferToAddress, transferTokenId)}
                                disabled={safeTransferLoading || !account || !transferFromAddress || !transferToAddress || !transferTokenId}
                                className="w-full border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50">
                                {safeTransferLoading
                                    ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Transferring…</span>
                                    : "Safe Transfer"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Approve Card (E8) ── */}
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
                            <Input
                                id="approveTo"
                                type="text"
                                value={approveAddress}
                                onChange={(e) => setApproveAddress(e.target.value)}
                                placeholder="0x..."
                                disabled={approveLoading}
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="approveTokenId" className="text-xs text-zinc-400">Token ID</Label>
                            <Input
                                id="approveTokenId"
                                type="number"
                                value={approveToken}
                                onChange={(e) => setApproveToken(e.target.value)}
                                placeholder="0"
                                disabled={approveLoading}
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        <Button
                            onClick={() => approve(approveAddress, approveToken)}
                            disabled={approveLoading || !account || !approveAddress || !approveToken}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                            {approveLoading
                                ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Approving…</span>
                                : "Approve"}
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Set Approval For All Card (E9) ── */}
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
                            <Input
                                id="setApprovalOperator"
                                type="text"
                                value={approvalForAllAddress}
                                onChange={(e) => setApprovForAllAddress(e.target.value)}
                                placeholder="0x..."
                                disabled={approvalForAllLoading}
                                className="border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-cyan-400/40"
                            />
                        </div>
                        {/* Grant / Revoke toggle */}
                        <div className="flex gap-3">
                            <Button
                                variant={isApproved ? "outline" : "ghost"}
                                size="sm"
                                onClick={() => setIsApproved(true)}
                                className={isApproved
                                    ? "flex-1 border-emerald-700 bg-transparent text-emerald-300 hover:bg-zinc-800"
                                    : "flex-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}>
                                Grant
                            </Button>
                            <Button
                                variant={!isApproved ? "outline" : "ghost"}
                                size="sm"
                                onClick={() => setIsApproved(false)}
                                className={!isApproved
                                    ? "flex-1 border-red-700 bg-transparent text-red-300 hover:bg-zinc-800"
                                    : "flex-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"}>
                                Revoke
                            </Button>
                        </div>
                        <Button
                            onClick={() => setApprovalForAll(approvalForAllAddress, isApproved)}
                            disabled={approvalForAllLoading || !account || !approvalForAllAddress}
                            className="w-full bg-cyan-400 text-zinc-950 hover:bg-cyan-300">
                            {approvalForAllLoading
                                ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Setting…</span>
                                : "Set Approval For All"}
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Event Feed Card (E11) ── */}
                <Card className="border-zinc-800 bg-zinc-900/40">
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
                                className="border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                                {indexerLoading
                                    ? <span className="flex items-center gap-1.5"><Spinner className="h-3 w-3" /> Syncing</span>
                                    : "Refresh"}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">

                        {/* ── Indexer status banner (amber) ── */}
                        {indexerStatus && (
                            <div className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
                                indexerStatus.startsWith('Synced')
                                    ? 'border-emerald-500/30 bg-emerald-500/10'
                                    : 'border-amber-500/30 bg-amber-500/10'
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                    indexerStatus.startsWith('Synced')
                                        ? 'bg-emerald-400'
                                        : 'animate-pulse bg-amber-400'
                                }`} />
                                <span className={`font-mono text-xs ${
                                    indexerStatus.startsWith('Synced')
                                        ? 'text-emerald-300'
                                        : 'text-amber-300'
                                }`}>{indexerStatus}</span>
                            </div>
                        )}

                        {/* ── Indexer error banner (red) ── */}
                        {indexerError && (
                            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
                                <p className="font-mono text-xs text-red-400">⚠ {indexerError}</p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Check your subgraph deployment or <code className="text-zinc-300">SUBGRAPH_URL</code>.
                                </p>
                            </div>
                        )}

                        {/* Transfers */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Transfers</p>
                            <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                {nftTransfers.length === 0 ? (
                                    <div className="py-3 text-center font-mono text-xs text-zinc-600">No transfers yet.</div>
                                ) : nftTransfers.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between py-3">
                                        <dt className="flex flex-col gap-0.5">
                                            <span className="font-mono text-xs text-zinc-500">
                                                {t._from.slice(0, 6)}…{t._from.slice(-4)}
                                                {" → "}
                                                {t._to.slice(0, 6)}…{t._to.slice(-4)}
                                            </span>
                                            <span className="font-mono text-[10px] text-zinc-700">
                                                {new Date(Number(t.blockTimestamp) * 1000).toLocaleTimeString()}
                                            </span>
                                        </dt>
                                        <dd className="font-mono text-sm text-cyan-300">#{t._tokenId}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="flex items-center gap-3">
                            <Separator className="flex-1 bg-zinc-800" />
                            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">approvals</span>
                            <Separator className="flex-1 bg-zinc-800" />
                        </div>

                        {/* Approvals */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Approvals</p>
                            <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                {nftApprovals.length === 0 ? (
                                    <div className="py-3 text-center font-mono text-xs text-zinc-600">No approvals yet.</div>
                                ) : nftApprovals.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between py-3">
                                        <dt className="flex flex-col gap-0.5">
                                            <span className="font-mono text-xs text-zinc-500">
                                                {a._owner.slice(0, 6)}…{a._owner.slice(-4)}
                                                {" approved "}
                                                {a._approved.slice(0, 6)}…{a._approved.slice(-4)}
                                            </span>
                                            <span className="font-mono text-[10px] text-zinc-700">
                                                {new Date(Number(a.blockTimestamp) * 1000).toLocaleTimeString()}
                                            </span>
                                        </dt>
                                        <dd className="font-mono text-sm text-emerald-300">#{a._tokenId}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <div className="flex items-center gap-3">
                            <Separator className="flex-1 bg-zinc-800" />
                            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">approval for all</span>
                            <Separator className="flex-1 bg-zinc-800" />
                        </div>

                        {/* ApprovalForAll */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-mono uppercase tracking-widest text-zinc-600">Approval For All</p>
                            <dl className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4">
                                {approvalForAlls.length === 0 ? (
                                    <div className="py-3 text-center font-mono text-xs text-zinc-600">No approval-for-all events yet.</div>
                                ) : approvalForAlls.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between py-3">
                                        <dt className="flex flex-col gap-0.5">
                                            <span className="font-mono text-xs text-zinc-500">
                                                {a._owner.slice(0, 6)}…{a._owner.slice(-4)}
                                                {" → "}
                                                {a._operator.slice(0, 6)}…{a._operator.slice(-4)}
                                            </span>
                                            <span className="font-mono text-[10px] text-zinc-700">
                                                {new Date(Number(a.blockTimestamp) * 1000).toLocaleTimeString()}
                                            </span>
                                        </dt>
                                        <dd className={`font-mono text-sm ${a._approved ? "text-emerald-300" : "text-zinc-400"}`}>
                                            {a._approved ? "granted" : "revoked"}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
