import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  X,
  Wallet,
  AlertCircle,
  QrCode,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import {
  hasInjectedWeb3Wallet,
  isTokenPocketBrowser,
  getWalletProviderName,
  connectWeb3Wallet,
  autoDetectWeb3Wallet,
  switchToBscNetwork,
  sendBnbTransaction,
  executeTokenPocketUsdtActivation,
  getUsdtBalance,
  formatShortWalletAddress,
  buildBscScanUrl,
  BSC_MAINNET_CHAIN_ID,
  PLATFORM_OWNER_BSC_WALLET,
} from '../../utils/web3Wallet';
import { playMatrixChime, triggerMatrixUpgradeConfetti } from '../../utils/web3Effects';

interface P2PRouteDetails {
  type: 'activation' | 'upgrade';
  level?: number;
  costUsd: number;
  estimatedBnb: number;
  bnbPriceUsd: number;
  recipientAddress: string;
  recipientRole: string;
  uplineWallet?: string;
  protocolReserveWallet?: string;
  split?: {
    sponsorWallet: string;
    sponsorAmountUsd: number;
    protocolWallet: string;
    protocolAmountUsd: number;
  };
}

interface P2PTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'activation' | 'upgrade';
  level?: number;
  levelCost?: number;
  userAvailableBalance?: number;
  connectedWallet?: string | null;
  onWalletConnected?: (address: string) => void;
  onSuccess: (data: { txHash: string; bscScanUrl: string; level?: number }) => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

export const P2PTransactionModal: React.FC<P2PTransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  level,
  levelCost = 2,
  userAvailableBalance = 0,
  connectedWallet,
  onWalletConnected,
  onSuccess,
  apiFetch,
}) => {
  const [route, setRoute] = useState<P2PRouteDetails | null>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [manualTxHash, setManualTxHash] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'usdt' | 'wallet' | 'manual' | 'balance'>('usdt');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stepStatus, setStepStatus] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localWallet, setLocalWallet] = useState<string | null>(connectedWallet || null);
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null);
  const [isTokenPocket, setIsTokenPocket] = useState<boolean>(false);

  // Auto-detect TokenPocket / Injected Web3 Provider on mount
  useEffect(() => {
    if (!isOpen) return;

    const isTP = isTokenPocketBrowser();
    setIsTokenPocket(isTP);

    // If already has injected wallet, auto-detect account
    if (hasInjectedWeb3Wallet()) {
      autoDetectWeb3Wallet()
        .then((conn) => {
          if (conn) {
            setLocalWallet(conn.address);
            if (onWalletConnected) onWalletConnected(conn.address);
            getUsdtBalance(conn.address).then(setUsdtBalance);
          }
        })
        .catch(() => null);
    }
  }, [isOpen, onWalletConnected]);

  useEffect(() => {
    if (connectedWallet) {
      setLocalWallet(connectedWallet);
      getUsdtBalance(connectedWallet).then(setUsdtBalance);
    }
  }, [connectedWallet]);

  // Default tab selection based on transaction type
  useEffect(() => {
    if (type === 'activation') {
      setActiveTab('usdt');
    } else {
      setActiveTab('wallet');
    }
  }, [type]);

  // Fetch true P2P routing details from server
  useEffect(() => {
    if (!isOpen) return;
    const fetchRoute = async () => {
      try {
        setLoadingRoute(true);
        setErrorMessage(null);
        const query = type === 'upgrade' ? `type=upgrade&level=${level}` : 'type=activation';
        const res = await apiFetch(`/api/matrix/p2p-route?${query}`);
        if (res && res.success && res.route) {
          setRoute(res.route);
        } else {
          setRoute({
            type,
            level,
            costUsd: levelCost,
            estimatedBnb: Number((levelCost / 640).toFixed(6)),
            bnbPriceUsd: 640,
            recipientAddress: PLATFORM_OWNER_BSC_WALLET,
            recipientRole: 'Verified Upline Sponsor',
            uplineWallet: PLATFORM_OWNER_BSC_WALLET,
            protocolReserveWallet: PLATFORM_OWNER_BSC_WALLET,
          });
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load on-chain P2P routing parameters.');
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [isOpen, type, level, levelCost, apiFetch]);

  if (!isOpen) return null;

  const providerName = getWalletProviderName();
  const uplineRecipient = route?.uplineWallet || route?.recipientAddress || PLATFORM_OWNER_BSC_WALLET;
  const protocolRecipient = route?.protocolReserveWallet || PLATFORM_OWNER_BSC_WALLET;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playMatrixChime('click');
    setTimeout(() => setCopied(false), 2000);
  };

  // Connect Web3 wallet
  const handleConnect = async () => {
    try {
      setIsProcessing(true);
      setStepStatus(`Requesting connection from ${providerName}...`);
      const { address, chainId } = await connectWeb3Wallet();
      setLocalWallet(address);
      if (onWalletConnected) onWalletConnected(address);

      // Query USDT balance
      const bal = await getUsdtBalance(address);
      setUsdtBalance(bal);

      // Bind to backend
      await apiFetch('/api/matrix/bind-wallet', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: address }),
      }).catch(() => null);

      if (chainId !== BSC_MAINNET_CHAIN_ID) {
        setStepStatus('Switching to BNB Smart Chain...');
        await switchToBscNetwork();
      }

      setStepStatus('Wallet connected & ready!');
      playMatrixChime('click');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect Web3 wallet.');
    } finally {
      setIsProcessing(false);
    }
  };

  // TOKENPOCKET $2.00 ACTIVATION INTEGRATION (USDT BEP-20)
  // Step 1: Prompt USDT Approval for $2.00 to Matrix Smart Contract
  // Step 2: Call register(address upline) with $2.00 value
  // Instant Split: $1.00 directly to upline, $1.00 directly to platform owner
  const handleTokenPocketUsdtActivation = async () => {
    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStepIndex(1);

    try {
      let activeAddr = localWallet;
      if (!activeAddr) {
        setStepStatus(`Connecting ${providerName}...`);
        const conn = await connectWeb3Wallet();
        activeAddr = conn.address;
        setLocalWallet(activeAddr);
        if (onWalletConnected) onWalletConnected(activeAddr);
      }

      // Execute Orchestrated 2-Step Activation
      const result = await executeTokenPocketUsdtActivation({
        uplineAddress: uplineRecipient,
        onProgress: (step, msg) => {
          setStepStatus(msg);
          if (step === 'approving') setCurrentStepIndex(1);
          if (step === 'registering') setCurrentStepIndex(2);
        },
      });

      setStepStatus('Verifying activation on BNB Chain ledger...');

      // Notify backend to confirm and flip status to ACTIVE
      const res = await apiFetch('/api/matrix/activate', {
        method: 'POST',
        body: JSON.stringify({
          txHash: result.registerTxHash,
          fromWallet: activeAddr,
          currency: 'USDT',
        }),
      });

      if (res && res.success) {
        playMatrixChime('upgrade');
        triggerMatrixUpgradeConfetti();
        onSuccess({
          txHash: result.registerTxHash,
          bscScanUrl: result.bscScanUrl,
          level,
        });
        onClose();
      } else {
        throw new Error(res?.message || 'On-chain verification could not be confirmed.');
      }
    } catch (err: any) {
      console.error('TokenPocket USDT activation failed:', err);
      setErrorMessage(err.message || 'Transaction was rejected or could not be verified on BNB Chain.');
    } finally {
      setIsProcessing(false);
      setStepStatus('');
      setCurrentStepIndex(0);
    }
  };

  // Alternative BNB Native 1-Click Send via Connected Wallet
  const handleSendViaWeb3 = async () => {
    if (!route) return;
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      let activeAddr = localWallet;
      if (!activeAddr) {
        setStepStatus(`Connecting ${providerName}...`);
        const conn = await connectWeb3Wallet();
        activeAddr = conn.address;
        setLocalWallet(activeAddr);
        if (onWalletConnected) onWalletConnected(activeAddr);
      }

      setStepStatus('Ensuring BNB Smart Chain network...');
      await switchToBscNetwork().catch(() => null);

      setStepStatus(`Sign transaction in ${providerName}...`);
      const recipient = route.recipientAddress;
      const bnbAmount = route.estimatedBnb.toString();

      const txHash = await sendBnbTransaction({
        fromAddress: activeAddr,
        toAddress: recipient,
        amountBnb: bnbAmount,
      });

      setStepStatus('Broadcasting & verifying on BNB Chain RPC...');

      // Submit TxHash to backend for verification
      const endpoint = type === 'upgrade' ? '/api/matrix/upgrade' : '/api/matrix/activate';
      const payload =
        type === 'upgrade'
          ? { level, txHash, fromWallet: activeAddr, currency: 'BNB' }
          : { txHash, fromWallet: activeAddr, currency: 'BNB' };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        playMatrixChime('upgrade');
        triggerMatrixUpgradeConfetti();
        onSuccess({
          txHash: res.txHash || txHash,
          bscScanUrl: res.bscScanUrl || buildBscScanUrl(txHash, 'tx'),
          level,
        });
        onClose();
      } else {
        throw new Error(res?.message || 'On-chain verification could not be confirmed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction was canceled or could not be verified on BNB Chain.');
    } finally {
      setIsProcessing(false);
      setStepStatus('');
    }
  };

  // Manual TxHash submission
  const handleVerifyManualTx = async () => {
    if (!manualTxHash.trim()) {
      setErrorMessage('Please enter a valid 66-character BscScan transaction hash (starts with 0x).');
      return;
    }

    const cleanHash = manualTxHash.trim();
    if (!cleanHash.startsWith('0x') || cleanHash.length !== 66) {
      setErrorMessage('Invalid transaction hash format. Must be 66 hex characters starting with 0x.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setStepStatus('Verifying BscScan transaction hash with BNB Chain RPC...');

    try {
      const endpoint = type === 'upgrade' ? '/api/matrix/upgrade' : '/api/matrix/activate';
      const payload =
        type === 'upgrade'
          ? { level, txHash: cleanHash, fromWallet: localWallet || '0x0000000000000000000000000000000000000000', currency: 'BNB' }
          : { txHash: cleanHash, fromWallet: localWallet || '0x0000000000000000000000000000000000000000', currency: 'BNB' };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        playMatrixChime('upgrade');
        triggerMatrixUpgradeConfetti();
        onSuccess({
          txHash: res.txHash || cleanHash,
          bscScanUrl: res.bscScanUrl || buildBscScanUrl(cleanHash, 'tx'),
          level,
        });
        onClose();
      } else {
        throw new Error(res?.message || 'Transaction hash could not be confirmed on BNB Chain.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Ensure the transaction is confirmed on BscScan.');
    } finally {
      setIsProcessing(false);
      setStepStatus('');
    }
  };

  // Internal Ledger Balance Fallback
  const handlePayViaBalance = async () => {
    if (userAvailableBalance < levelCost) {
      setErrorMessage(`Insufficient balance. You need $${levelCost.toFixed(2)}, currently have $${userAvailableBalance.toFixed(2)}.`);
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setStepStatus('Executing 100% P2P settlement from account ledger...');

    try {
      const endpoint = type === 'upgrade' ? '/api/matrix/upgrade' : '/api/matrix/activate';
      const payload = type === 'upgrade' ? { level } : {};

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success) {
        playMatrixChime('upgrade');
        triggerMatrixUpgradeConfetti();
        onSuccess({
          txHash: res.txHash || '',
          bscScanUrl: res.bscScanUrl || '',
          level,
        });
        onClose();
      } else {
        throw new Error(res?.message || 'Internal ledger settlement failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed.');
    } finally {
      setIsProcessing(false);
      setStepStatus('');
    }
  };

  const recipientShort = route ? formatShortWalletAddress(route.recipientAddress) : '0x...';
  const bscScanRecipient = route ? buildBscScanUrl(route.recipientAddress, 'address') : '#';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-5 sm:p-6 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-950/50">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white font-['Space_Grotesk']">
                  {type === 'upgrade' ? `Level ${level} Upgrade` : 'Protocol Activation ($2.00)'}
                </h3>
                {isTokenPocket ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                    ⚡ TokenPocket BEP-20
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                    BNB Chain P2P
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">100% Peer-to-Peer decentralized routing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Activation Instant Split Breakdown Card */}
        {type === 'activation' ? (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Activation Protocol Fee:</span>
                <span className="text-xl font-extrabold text-emerald-400 font-['Space_Grotesk']">
                  $2.00 USDT <span className="text-xs font-normal text-slate-400 font-sans">(BEP-20)</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Target Token:</span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  USDT on BSC
                </span>
              </div>
            </div>

            {/* Instant Split Visualizer */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300">
                  <span>50% Direct Upline</span>
                  <span>$1.00</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate mt-1">
                  {formatShortWalletAddress(uplineRecipient)}
                </p>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-medium">Instant Sponsor Bonus</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                  <span>50% Protocol Reserve</span>
                  <span>$1.00</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate mt-1">
                  {formatShortWalletAddress(protocolRecipient)}
                </p>
                <span className="text-[9px] text-cyan-400 block mt-0.5 font-medium">Network Liquidity Pool</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
              <strong className="text-emerald-400">Zero Intermediary Holding:</strong> $1.00 goes directly to your sponsor's BSC wallet and $1.00 to the platform reserve. Immediately flips status to <strong>ACTIVE</strong>.
            </p>
          </div>
        ) : (
          /* Level Upgrade Price & Direct Route Card */
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Transaction Value:</span>
              <div className="text-right">
                <span className="text-xl font-extrabold text-white font-['Space_Grotesk']">
                  ${levelCost.toFixed(2)} USD
                </span>
                {route && (
                  <span className="block text-xs text-emerald-400 font-mono font-bold">
                    ≈ {route.estimatedBnb} BNB
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recipient ({route?.recipientRole || 'Upline Node'}):</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-cyan-300 text-xs font-bold">{recipientShort}</span>
                  {route && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(route.recipientAddress)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Copy Address"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a
                        href={bscScanRecipient}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View on BscScan"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 leading-relaxed">
                <span className="text-emerald-400 font-bold">Zero Fund Holding:</span> 100% of this payment is routed directly to the verified upline node on BNB Chain.
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
          {type === 'activation' ? (
            <button
              type="button"
              onClick={() => setActiveTab('usdt')}
              className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'usdt'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>USDT (BEP-20)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Web3 Wallet</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Manual TxHash</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'balance'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Balance</span>
          </button>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Status progress bar */}
        {isProcessing && (
          <div className="mt-3 p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-cyan-400" />
            <span className="font-semibold">{stepStatus || 'Processing transaction on BNB Chain...'}</span>
          </div>
        )}

        {/* TAB 1: TOKENPOCKET $2.00 USDT (BEP-20) 2-STEP FLOW */}
        {activeTab === 'usdt' && (
          <div className="mt-4 space-y-3">
            {/* Connected Wallet & Balance Check */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">TokenPocket / Web3:</span>
              <div className="flex items-center gap-2">
                {localWallet ? (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-mono font-bold">
                      {formatShortWalletAddress(localWallet)}
                    </span>
                    {usdtBalance !== null && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-cyan-300 font-mono font-bold">
                        ${usdtBalance.toFixed(2)} USDT
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={isProcessing}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px]"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            {/* 2-Step Interactive Indicators */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                TokenPocket Activation Sequence:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    currentStepIndex === 1
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : currentStepIndex > 1
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentStepIndex > 1 ? <Check className="w-3 h-3 text-emerald-400" /> : '1'}
                  </span>
                  <div>
                    <span className="font-bold block text-[11px]">USDT Approval</span>
                    <span className="text-[9px] text-slate-400">Authorizes $2.00</span>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    currentStepIndex === 2
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <span className="font-bold block text-[11px]">register(upline)</span>
                    <span className="text-[9px] text-slate-400">Executes Instant Split</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleTokenPocketUsdtActivation}
              disabled={isProcessing || loadingRoute}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.35)]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing in TokenPocket...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pay $2.00 & Activate (TokenPocket USDT)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: 1-CLICK WEB3 WALLET (BNB) */}
        {activeTab === 'wallet' && (
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Connected Wallet:</span>
              <div className="flex items-center gap-2">
                {localWallet ? (
                  <span className="text-emerald-400 font-mono font-bold">
                    {formatShortWalletAddress(localWallet)}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Not connected</span>
                )}
                {!localWallet && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={isProcessing}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px]"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendViaWeb3}
              disabled={isProcessing || loadingRoute}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.35)]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Confirming on BNB Chain...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Send {route ? `${route.estimatedBnb} BNB` : `$${levelCost.toFixed(2)}`} via {providerName}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: MANUAL TXHASH INPUT */}
        {activeTab === 'manual' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <p className="text-slate-400">
                1. Transfer <span className="text-emerald-400 font-bold">{route?.estimatedBnb || (levelCost / 640).toFixed(6)} BNB</span> or <span className="text-cyan-300 font-bold">${levelCost.toFixed(2)} USDT</span> on BNB Chain to:
              </p>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all flex items-center justify-between">
                <span>{route?.recipientAddress}</span>
                {route && (
                  <button
                    type="button"
                    onClick={() => handleCopy(route.recipientAddress)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
              <p className="text-slate-400">2. Paste your confirmed BscScan Transaction Hash below:</p>
              <input
                type="text"
                placeholder="0x... (66 characters)"
                value={manualTxHash}
                onChange={(e) => setManualTxHash(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyManualTx}
              disabled={isProcessing || !manualTxHash.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying on BscScan...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify On-Chain TxHash</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 4: PAY VIA INTERNAL LEDGER BALANCE */}
        {activeTab === 'balance' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your Available Balance:</span>
                <span className="text-emerald-400 font-extrabold font-['Space_Grotesk'] text-sm">
                  ${userAvailableBalance.toFixed(2)} USD
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Required:</span>
                <span className="text-white font-extrabold font-['Space_Grotesk'] text-sm">
                  ${levelCost.toFixed(2)} USD
                </span>
              </div>
              {userAvailableBalance < levelCost && (
                <p className="text-[11px] text-amber-400 bg-amber-950/30 p-2 rounded-lg border border-amber-900/50">
                  Insufficient balance. Pay directly via TokenPocket USDT (BEP-20) or Web3 Wallet.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePayViaBalance}
              disabled={isProcessing || userAvailableBalance < levelCost}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing instant settlement...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Pay ${levelCost.toFixed(2)} from Balance</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Decentralized Trust Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Decentralized P2P Protocol</span>
          </span>
          <span className="font-mono">BNB Smart Chain (BEP-20)</span>
        </div>
      </div>
    </div>
  );
};
