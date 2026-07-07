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

    useEffect(() => {
        const checkExistingWallet = async () => {
            try {
                if (typeof window === 'undefined' || !window.ethereum) return toast.error('Metamask not installed!');
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
        }

        checkExistingWallet();

        const handleAccountChanged = async (accounts: string[]) => {
            try {
                if (accounts.length > 0) setAccount(accounts[0]);
            } catch (error) {
                console.error(error);
                return toast.error('Failed to load new account!', { position: 'top-center' });
            }
        };

        const handleChainChanged = async (chainId: string) => {
            try {
                if (chainId) setChainId(chainId);
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
            if (typeof window === 'undefined' || !window.ethereum) return toast.error('Metamask not installed!');
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
            return toast.error('Failed to connect wallet!');
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

            const tx = await contract?.mint(mintTo);
            const receipt = await tx.wait();

            const parseLogs = await receipt.logs.map((log: any) => {
                try {
                    return contract?.interface.parseLog(log);
                } catch (error) {
                    return toast.error(`error`);
                }
            });
            const transferLogs = await parseLogs.find((parsed: any) => parsed?.name === 'Transfer');
            if (transferLogs) {
                const tokenId = transferLogs.args[2].toString();
                setTokenId(tokenId);

                return toast.success(`Mint successful! Minted token ${tokenId}!`, { position: 'top-center' });
            }

        } catch (error) {
            console.error(error);
            return
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
            if (!fetchBalance) setBalance(fetchBalance);
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

        } catch (error) {
            console.error(error);
            return toast.error('Failed to fetch owner', { position: 'top-center' });
        } finally {
            setOwnerLoading(false);
        };
    };

    return (
        <div>
            {(mintLoading || walletFetching || connectingWallet || balanceLoading || ownerLoading) && <Spinner />}

            {account ? (
                <>
                    <Label>Connected Account: {account}</Label>
                    <Label>Chain: {chainId}</Label>
                </>
            ) : (
                <Button onClick={connectWallet}>Connect Wallet</Button>
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
            <Button onClick={() => mint(mintTo)} disabled={mintLoading}>Mint NFT</Button>
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
            <Button onClick={() => getBalance(balanceAddress)} disabled={balanceLoading}>Check Balance</Button>
            {balance && <Label>No of tokens for address: {account} are: {balance}</Label>}

            <Label>Check owner of a token</Label>
            <Input
                type='text'
                value={fetchOwnerForToken}
                onChange={(e) => setFetchOwnerForToken(e.target.value)}
                disabled={ownerLoading}
                placeholder="Enter token to fetch owner"
                required
            />
            <Button onClick={() => getOwner(fetchOwnerForToken)} disabled={ownerLoading}>Fetch Owner</Button>
            {owner && <Label>Owner of token is: {owner}</Label>}

        </div>
    )
}
