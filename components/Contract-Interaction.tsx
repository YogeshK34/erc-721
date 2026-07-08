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
import { Switch } from "./ui/switch";

export const ContractInteraction = () => {
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
            const contract = await getSignerContract();
            if (!contract) return;

            const tx = await contract.mint(mintTo);
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
                const tokenId = transferLogs.args[2].toString();
                setTokenId(tokenId);
                setMintTo('');

                return toast.success(`Mint successful! Minted token ${tokenId}!`, { position: 'top-center' });
            }

        } catch (error: any) {

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            // create the error message 
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

            const contract = await getSignerContract();
            const tx = await contract?.safeTransferFrom(from, to, tokenId);
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

                setSafeTransferFromAddress('');
                setSafeTransferToAddress('');
                setSafeTransferTokenId('');
                return;
            } else {
                return toast.error('Failed to transfer!', { position: 'top-center' })
            }

        } catch (error: any) {
            console.error(error);

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            // create the error message 
            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Transaction failed!';

            return toast.error(message, { position: 'top-center' });
        } finally {
            setSafeTransferLoading(false);
        }
    }

    const transferFrom = async (from: string, to: string, tokenId: string) => {
        try {
            if (!ethers.isAddress(from)) return toast.error('Invalid from address!', { position: 'top-center' });
            if (!ethers.isAddress(to)) return toast.error('Invalid to address!', { position: 'top-center' })
            setTransferLoading(true);

            const contract = await getSignerContract();
            const tx = await contract?.transferFrom(from, to, tokenId);
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

                setTransferFromAddress('');
                setTransferToAddress('');
                setTransferTokenId('');
                return;
            } else {
                return toast.error('Failed to transfer!', { position: 'top-center' })
            }

        } catch (error: any) {
            console.error(error);

            if (error.code === 'ACTION_REJECTED') {
                return toast.error('User denied transaction', { position: 'top-center' })
            };

            // create the error message 
            const message =
                error.reason ??
                error.revert?.args?.[0] ??
                error.shortMessage ??
                error.message ??
                'Transaction failed!';

            return toast.error(message, { position: 'top-center' });
        } finally {
            setTransferLoading(false);
        }
    };

    const approve = async (address: string, tokenId: string) => {
        try {
            if (!ethers.isAddress(address)) return toast.error('Invalid address', { position: 'top-center' })
            setApproveLoading(true);

            const contract = await getSignerContract();
            const tx = await contract?.approve(address, tokenId);

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

                setApproveAddress('');
                setApproveToken('');
                return;
            };

        } catch (error: any) {
            console.error(error);

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
        };
    };


    const setApprovalForAll = async (address: string, isApproved: boolean) => {
        try {
            if (!ethers.isAddress(address)) return toast.error('Invalid address', { position: 'top-center' })
            setApprovalForAllLoading(true);

            const contract = await getSignerContract();
            const tx = await contract?.setApprovalForAll(address, isApproved);

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

                setApprovForAllAddress('');
                setIsApproved(false);
                return;
            };

        } catch (error: any) {
            console.error(error);

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
        };
    };

    const getApproved = async (tokenId: string) => {
        try {
            setGetApprovedLoading(true);
            const contract = await getProviderContract();
            const approvedAddress = await contract?.getApproved(tokenId);

            if (!approvedAddress || approvedAddress === ethers.ZeroAddress) return toast.info('Approval not set!', { position: 'top-center' });
            setApprovedAddress(approvedAddress);
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

    return (
        <div>
            {walletFetching ? <><Spinner /> <Label> Connecting...</Label></> :
                account ? (
                    <>
                        <Label>Connected Account: {account}</Label>
                        <Label>Chain: {chainId}</Label>
                    </>
                ) : (
                    <Button onClick={connectWallet}>{connectingWallet ? <><Spinner /><Label>Connecting...</Label></> : 'Connect  Wallet'}</Button>
                )}

            <Label>Mint NFTs</Label>
            <Input
                type='text'
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
                disabled={mintLoading}
                placeholder="Enter address to mint tokens to"
                required
            />
            <Button onClick={() => mint(mintTo)} disabled={mintLoading}>{mintLoading ? <><Spinner /> <Label>Minting NFTs...</Label></> : 'Mint NFT'}</Button>
            {tokenId && <Label>Minted token&apos;s Id: {tokenId}</Label>}

            <Label>Fetch number of Tokens</Label>
            <Input
                type='text'
                value={balanceAddress}
                onChange={(e) => setBalanceAddress(e.target.value)}
                disabled={balanceLoading}
                placeholder="Enter address to fetch no of tokens held"
                required
            />
            <Button onClick={() => getBalance(balanceAddress)} disabled={balanceLoading}>{balanceLoading ? <><Spinner /> <Label>Fetching balance...</Label></> : 'Check Balance'}</Button>
            {balance && <Label>No of tokens for address: {balanceAddress || 'queried address'} are {balance}</Label>}

            <Label>Check owner of a token</Label>
            <Input
                type='text'
                value={fetchOwnerForToken}
                onChange={(e) => setFetchOwnerForToken(e.target.value)}
                disabled={ownerLoading}
                placeholder="Enter token to fetch owner"
                required
            />
            <Button onClick={() => getOwner(fetchOwnerForToken)} disabled={ownerLoading}>{ownerLoading ? <> <Spinner /> <Label>Checking Ownership...</Label></> : 'Check Owner'}</Button>
            {owner && <Label>Owner of token is: {owner}</Label>}

            <Label>SafeTransferFrom: checks if recipient can handle NFT (recommended)</Label>
            <Input
                type='text'
                value={safeTransferFromAddress}
                onChange={(e) => setSafeTransferFromAddress(e.target.value)}
                disabled={safeTransferLoading}
                placeholder="Enter from address"
                required
            />

            <Input
                type='text'
                value={safeTransferToAddress}
                onChange={(e) => setSafeTransferToAddress(e.target.value)}
                disabled={safeTransferLoading}
                placeholder="Enter to address"
                required
            />

            <Input
                type='text'
                value={safeTransferTokenId}
                onChange={(e) => setSafeTransferTokenId(e.target.value)}
                disabled={safeTransferLoading}
                placeholder="Enter tokenId"
                required
            />

            <Button onClick={() => safeTransferFrom(safeTransferFromAddress, safeTransferToAddress, safeTransferTokenId)}
                disabled={safeTransferLoading}>{safeTransferLoading ? <><Spinner /> <Label>Transferring...</Label></> : 'Transfer'}
            </Button>

            <Label>TransferFrom: directly transfers, no check (not-recommended)</Label>
            <Input
                type='text'
                value={transferFromAddress}
                onChange={(e) => setTransferFromAddress(e.target.value)}
                disabled={transferLoading}
                placeholder="Enter from address"
                required
            />

            <Input
                type='text'
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
                disabled={transferLoading}
                placeholder="Enter to address"
                required
            />

            <Input
                type='text'
                value={transferTokenId}
                onChange={(e) => setTransferTokenId(e.target.value)}
                disabled={transferLoading}
                placeholder="Enter tokenId"
                required
            />

            <Button onClick={() => transferFrom(transferFromAddress, transferToAddress, transferTokenId)}
                disabled={transferLoading}>{transferLoading ? <><Spinner /> <Label>Transferring...</Label></> : 'Transfer'}
            </Button>

            <Label>Approve: grant permission to move tokens on your behalf</Label>
            <Input
                type='text'
                value={approveAddress}
                onChange={(e) => setApproveAddress(e.target.value)}
                disabled={approveLoading}
                placeholder="Enter address to grant permission"
                required
            />

            <Input
                type='text'
                value={approveToken}
                onChange={(e) => setApproveToken(e.target.value)}
                disabled={approveLoading}
                placeholder="Enter tokenId"
                required
            />

            <Button onClick={() => approve(approveAddress, approveToken)}
                disabled={approveLoading}>{approveLoading ? <><Spinner /> <Label>Approving...</Label></> : 'Approve'}
            </Button>

            <Label>ApprovalForAll: grant permission to move all tokens on your behalf</Label>
            <Input
                type='text'
                value={approvalForAllAddress}
                onChange={(e) => setApprovForAllAddress(e.target.value)}
                disabled={approvalForAllLoading}
                placeholder="Enter address to grant permission"
                required
            />

            <Switch
                checked={isApproved}
                onCheckedChange={setIsApproved}
                disabled={approvalForAllLoading}
            />

            <Button onClick={() => setApprovalForAll(approvalForAllAddress, isApproved)}
                disabled={approvalForAllLoading}>{approvalForAllLoading ? <><Spinner /> <Label>Approving...</Label></> : 'Approve'}
            </Button>

            <Label>Check approval for a token</Label>
            <Input
                type='text'
                value={checkApprovalForToken}
                onChange={(e) => setCheckApprovalForToken(e.target.value)}
                placeholder="Enter token id"
                disabled={getApprovedLoading}
                required
            />

            <Button onClick={() => getApproved(checkApprovalForToken)} disabled={getApprovedLoading}>{getApprovedLoading ? <><Spinner /> <Label>Checking Approval....</Label></> : 'Check Approval'}</Button>
            {approvedAddress && <Label>Approved Address: {approvedAddress}</Label>}

            <Label>Check an address approval</Label>
            <Input
                type='text'
                value={approvedForAllOwner}
                onChange={(e) => setApprovedForAllOwner(e.target.value)}
                placeholder="Enter owner's address"
                disabled={isApprovedForAllLoading}
                required
            />

            <Input
                type='text'
                value={approvedForAllOperator}
                onChange={(e) => setApprovedForAllOperator(e.target.value)}
                placeholder="Enter operator's address"
                disabled={isApprovedForAllLoading}
                required
            />

            <Button onClick={() => isApprovedForAll(approvedForAllOwner, approvedForAllOperator)} disabled={isApprovedForAllLoading}>{isApprovedForAllLoading ? <><Spinner /> <Label>Checking Approval....</Label></> : 'Check Approval'}</Button>
            {resultApproveForAll !== null && (
                <Label>
                    {approvedForAllOperator}
                    {resultApproveForAll ? " is " : " is not "}
                    approved for {approvedForAllOwner}
                </Label>
            )}
        </div>
    )
}
