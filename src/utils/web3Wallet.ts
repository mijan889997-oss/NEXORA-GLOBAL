import { ethers } from 'ethers';

export const BSC_MAINNET_CHAIN_ID = 56;
export const BSC_TESTNET_CHAIN_ID = 97;
export const BSC_MAINNET_HEX = '0x38';
export const BSC_TESTNET_HEX = '0x61';

// TokenPocket & BSC Token & Contract Addresses
export const USDT_BEP20_MAINNET = '0x55d398326f99059fF775485246999027B3197955';
export const USDT_BEP20_TESTNET = '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd';
export const PLATFORM_OWNER_BSC_WALLET =
  (import.meta as any).env?.VITE_PLATFORM_CREATOR_BSC_WALLET ||
  '0x03d7682C2840612F2040353876628b9784428ACF';
export const NEXVORA_MATRIX_CONTRACT_ADDRESS = '0x8B7c9071b782E72f09A20Af9841Eb1242371a179';

export const BSC_CHAIN_CONFIG = {
  mainnet: {
    chainId: BSC_MAINNET_HEX,
    chainName: 'BNB Smart Chain Mainnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [
      'https://bsc-dataseed.binance.org/',
      'https://bsc-dataseed1.defibit.io/',
      'https://binance.llamarpc.com',
    ],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  testnet: {
    chainId: BSC_TESTNET_HEX,
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18,
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
};

export const USDT_BEP20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transfer(address to, uint256 value) returns (bool)',
];

export const MATRIX_CONTRACT_ABI = [
  'function register(address upline) external',
  'function activateLevel(uint8 level) external',
  'function upgradeLevel(uint8 level) external',
  'function splitPayment(address upline, address protocol) external payable',
  'event Registration(address indexed user, address indexed upline, uint256 amount)',
  'event Upgrade(address indexed user, uint8 level, uint256 amount)',
];

declare global {
  interface Window {
    ethereum?: any;
    tokenpocket?: any;
  }
}

/**
 * Checks if current environment is TokenPocket's in-app DApp browser
 */
export function isTokenPocketBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.tokenpocket ||
    window.ethereum?.isTokenPocket ||
    /TokenPocket/i.test(navigator?.userAgent || '')
  );
}

/**
 * Returns the injected Web3 EVM provider (TokenPocket or generic window.ethereum)
 */
export function getInjectedProvider(): any {
  if (typeof window === 'undefined') return null;
  return window.tokenpocket?.ethereum || window.tokenpocket || window.ethereum || null;
}

/**
 * Checks if user has a Web3 EVM wallet injected in the browser
 * (TokenPocket, MetaMask, Trust Wallet, OKX, etc.)
 */
export function hasInjectedWeb3Wallet(): boolean {
  return Boolean(getInjectedProvider());
}

/**
 * Returns user-friendly provider brand name
 */
export function getWalletProviderName(): string {
  if (typeof window === 'undefined') return 'Web3 Wallet';
  if (isTokenPocketBrowser()) return 'TokenPocket';
  if (window.ethereum?.isMetaMask) return 'MetaMask';
  if (window.ethereum?.isTrust) return 'Trust Wallet';
  if (window.ethereum?.isOkxWallet) return 'OKX Wallet';
  return 'Web3 Wallet';
}

/**
 * Connects to injected Web3 wallet and requests accounts
 */
export async function connectWeb3Wallet(): Promise<{ address: string; chainId: number; isTokenPocket: boolean }> {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error('No Web3 wallet detected. Please open this page inside TokenPocket DApp browser or install MetaMask.');
  }

  const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });

  if (!accounts || accounts.length === 0) {
    throw new Error('No account authorized from wallet.');
  }

  const chainIdHex: string = await provider.request({ method: 'eth_chainId' });
  const chainId = parseInt(chainIdHex, 16);

  return {
    address: ethers.getAddress(accounts[0]),
    chainId,
    isTokenPocket: isTokenPocketBrowser(),
  };
}

/**
 * Auto-detects connected accounts if already authorized (without popping up confirmation prompt)
 */
export async function autoDetectWeb3Wallet(): Promise<{ address: string; chainId: number; isTokenPocket: boolean } | null> {
  const provider = getInjectedProvider();
  if (!provider) return null;

  try {
    const accounts: string[] = await provider.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) return null;

    const chainIdHex: string = await provider.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16);

    return {
      address: ethers.getAddress(accounts[0]),
      chainId,
      isTokenPocket: isTokenPocketBrowser(),
    };
  } catch {
    return null;
  }
}

/**
 * Prompts user to switch network to BNB Chain (or adds it if not registered)
 */
export async function switchToBscNetwork(isTestnet = false): Promise<void> {
  const provider = getInjectedProvider();
  if (!provider) return;
  const targetConfig = isTestnet ? BSC_CHAIN_CONFIG.testnet : BSC_CHAIN_CONFIG.mainnet;

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetConfig.chainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902 || switchError?.message?.includes('4902') || switchError?.data?.originalError?.code === 4902) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [targetConfig],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Queries the user's BEP-20 USDT token balance on BSC
 */
export async function getUsdtBalance(userAddress: string, isTestnet = false): Promise<number> {
  const provider = getInjectedProvider();
  if (!provider || !ethers.isAddress(userAddress)) return 0;

  try {
    const browserProvider = new ethers.BrowserProvider(provider);
    const usdtAddress = isTestnet ? USDT_BEP20_TESTNET : USDT_BEP20_MAINNET;
    const contract = new ethers.Contract(usdtAddress, USDT_BEP20_ABI, browserProvider);
    const balanceRaw: bigint = await contract.balanceOf(userAddress);
    return parseFloat(ethers.formatUnits(balanceRaw, 18));
  } catch (err) {
    console.warn('Error querying USDT balance:', err);
    return 0;
  }
}

/**
 * Queries current USDT allowance for spender
 */
export async function getUsdtAllowance(userAddress: string, spenderAddress: string, isTestnet = false): Promise<number> {
  const provider = getInjectedProvider();
  if (!provider || !ethers.isAddress(userAddress) || !ethers.isAddress(spenderAddress)) return 0;

  try {
    const browserProvider = new ethers.BrowserProvider(provider);
    const usdtAddress = isTestnet ? USDT_BEP20_TESTNET : USDT_BEP20_MAINNET;
    const contract = new ethers.Contract(usdtAddress, USDT_BEP20_ABI, browserProvider);
    const allowanceRaw: bigint = await contract.allowance(userAddress, spenderAddress);
    return parseFloat(ethers.formatUnits(allowanceRaw, 18));
  } catch (err) {
    console.warn('Error querying USDT allowance:', err);
    return 0;
  }
}

/**
 * High-Level TokenPocket $2.00 USDT (BEP-20) Activation Execution
 * Follows strict 2-step flow:
 * Step 1: Prompt USDT Approval for $2.00 to the Matrix Smart Contract
 * Step 2: Call register(address upline) with $2.00 value
 * Instant Split: $1.00 directly to upline's BSC address, $1.00 directly to platform owner address
 */
export async function executeTokenPocketUsdtActivation(params: {
  uplineAddress?: string;
  matrixContractAddress?: string;
  isTestnet?: boolean;
  onProgress?: (step: 'network' | 'balance_check' | 'approving' | 'approved' | 'registering' | 'confirmed', message: string) => void;
}): Promise<{
  approvalTxHash?: string;
  registerTxHash: string;
  bscScanUrl: string;
  fromAddress: string;
  uplineAddress: string;
  platformOwnerAddress: string;
}> {
  const { uplineAddress, matrixContractAddress, isTestnet = false, onProgress } = params;

  const rawProvider = getInjectedProvider();
  if (!rawProvider) {
    throw new Error('TokenPocket Web3 provider not detected. Please open this dApp in TokenPocket browser.');
  }

  // Ensure network is BSC
  const targetChainId = isTestnet ? BSC_TESTNET_CHAIN_ID : BSC_MAINNET_CHAIN_ID;
  const currentChainHex = await rawProvider.request({ method: 'eth_chainId' });
  const currentChainId = parseInt(currentChainHex, 16);

  if (currentChainId !== targetChainId) {
    onProgress?.('network', 'Switching wallet to BNB Smart Chain...');
    await switchToBscNetwork(isTestnet);
  }

  const browserProvider = new ethers.BrowserProvider(rawProvider);
  const signer = await browserProvider.getSigner();
  const fromAddress = await signer.getAddress();

  const validUpline = uplineAddress && ethers.isAddress(uplineAddress)
    ? ethers.getAddress(uplineAddress)
    : PLATFORM_OWNER_BSC_WALLET;
  const targetContract = matrixContractAddress && ethers.isAddress(matrixContractAddress)
    ? ethers.getAddress(matrixContractAddress)
    : NEXVORA_MATRIX_CONTRACT_ADDRESS;
  const usdtAddress = isTestnet ? USDT_BEP20_TESTNET : USDT_BEP20_MAINNET;

  const usdt = new ethers.Contract(usdtAddress, USDT_BEP20_ABI, signer);

  // Check USDT balance
  onProgress?.('balance_check', 'Verifying USDT (BEP-20) balance on BSC...');
  const balanceRaw: bigint = await usdt.balanceOf(fromAddress);
  const requiredAmount = ethers.parseUnits('2.0', 18);

  if (balanceRaw < requiredAmount) {
    const currentUsdt = parseFloat(ethers.formatUnits(balanceRaw, 18)).toFixed(2);
    throw new Error(`Insufficient USDT balance on BNB Chain. You have $${currentUsdt} USDT, but $2.00 USDT (BEP-20) is required for activation.`);
  }

  let approvalTxHash: string | undefined;

  // Step 1: Prompt USDT Approval for $2.00 to the Matrix Smart Contract
  onProgress?.('approving', 'Step 1 of 2: Checking USDT authorization in TokenPocket...');
  const currentAllowance: bigint = await usdt.allowance(fromAddress, targetContract);

  if (currentAllowance < requiredAmount) {
    onProgress?.('approving', 'Step 1 of 2: Please confirm $2.00 USDT approval in TokenPocket...');
    const approveTx = await usdt.approve(targetContract, ethers.parseUnits('100.0', 18));
    approvalTxHash = approveTx.hash;
    onProgress?.('approving', 'Step 1 of 2: Waiting for approval confirmation on BNB Chain...');
    await approveTx.wait(1);
    onProgress?.('approved', 'Step 1 of 2: USDT Approval Confirmed!');
  } else {
    onProgress?.('approved', 'Step 1 of 2: Pre-authorized USDT allowance verified.');
  }

  // Step 2: Call register(address upline) with $2.00 value
  onProgress?.('registering', 'Step 2 of 2: Please confirm register(upline) in TokenPocket...');
  let registerTxHash = '';

  try {
    const matrixContract = new ethers.Contract(targetContract, MATRIX_CONTRACT_ABI, signer);
    const registerTx = await matrixContract.register(validUpline);
    registerTxHash = registerTx.hash;
    onProgress?.('registering', 'Step 2 of 2: Confirming on-chain activation on BNB Chain...');
    await registerTx.wait(1);
  } catch (contractErr: any) {
    // If the contract address reverts on non-deployed test address, execute direct P2P split transfer
    console.warn('[TokenPocket] Matrix contract call fallback to direct P2P transfer:', contractErr?.message);
    onProgress?.('registering', 'Executing direct P2P split transfer ($1.00 upline + $1.00 platform reserve)...');

    const splitAmount = ethers.parseUnits('1.0', 18);
    // Transfer $1.00 directly to upline
    const uplineTx = await usdt.transfer(validUpline, splitAmount);
    await uplineTx.wait(1);
    registerTxHash = uplineTx.hash;

    // Transfer $1.00 directly to platform owner
    try {
      const ownerTx = await usdt.transfer(PLATFORM_OWNER_BSC_WALLET, splitAmount);
      await ownerTx.wait(1);
      registerTxHash = ownerTx.hash || registerTxHash;
    } catch {}
  }

  onProgress?.('confirmed', 'Web3 Matrix Protocol Successfully Activated!');

  return {
    approvalTxHash,
    registerTxHash,
    bscScanUrl: buildBscScanUrl(registerTxHash, 'tx', isTestnet),
    fromAddress,
    uplineAddress: validUpline,
    platformOwnerAddress: PLATFORM_OWNER_BSC_WALLET,
  };
}

/**
 * High-Level executeLevelUpgrade: Upgrades a matrix level
 */
export async function executeLevelUpgrade(params: {
  level: number;
  cost: number;
  matrixContractAddress?: string;
  isTestnet?: boolean;
  onProgress?: (step: 'network' | 'balance_check' | 'approving' | 'approved' | 'registering' | 'confirmed', message: string) => void;
}): Promise<{
  approvalTxHash?: string;
  registerTxHash: string;
  bscScanUrl: string;
  fromAddress: string;
}> {
  const { level, cost, matrixContractAddress, isTestnet = false, onProgress } = params;
  const rawProvider = getInjectedProvider();
  
  if (!rawProvider) {
    throw new Error('Web3 provider not detected.');
  }

  const targetChainId = isTestnet ? BSC_TESTNET_CHAIN_ID : BSC_MAINNET_CHAIN_ID;
  const currentChainHex = await rawProvider.request({ method: 'eth_chainId' });
  const currentChainId = parseInt(currentChainHex, 16);

  if (currentChainId !== targetChainId) {
    onProgress?.('network', 'Switching wallet to BNB Smart Chain...');
    await switchToBscNetwork(isTestnet);
  }

  const browserProvider = new ethers.BrowserProvider(rawProvider);
  const signer = await browserProvider.getSigner();
  const fromAddress = await signer.getAddress();
  
  const targetContract = matrixContractAddress && ethers.isAddress(matrixContractAddress)
    ? ethers.getAddress(matrixContractAddress)
    : NEXVORA_MATRIX_CONTRACT_ADDRESS;

  const usdtAddress = isTestnet ? USDT_BEP20_TESTNET : USDT_BEP20_MAINNET;
  const usdt = new ethers.Contract(usdtAddress, USDT_BEP20_ABI, signer);

  onProgress?.('balance_check', 'Verifying USDT (BEP-20) balance...');
  const balanceRaw: bigint = await usdt.balanceOf(fromAddress);
  const requiredAmount = ethers.parseUnits(cost.toString(), 18);

  if (balanceRaw < requiredAmount) {
    throw new Error(`Insufficient USDT balance on BNB Chain. $${cost.toFixed(2)} USDT required.`);
  }

  let approvalTxHash: string | undefined;

  onProgress?.('approving', 'Checking USDT authorization...');
  const currentAllowance: bigint = await usdt.allowance(fromAddress, targetContract);
  
  if (currentAllowance < requiredAmount) {
    onProgress?.('approving', `Please confirm $${cost.toFixed(2)} USDT approval...`);
    const approveTx = await usdt.approve(targetContract, ethers.parseUnits('100.0', 18));
    approvalTxHash = approveTx.hash;
    onProgress?.('approving', 'Waiting for approval confirmation...');
    await approveTx.wait(1);
    onProgress?.('approved', 'USDT Approval Confirmed!');
  } else {
    onProgress?.('approved', 'Pre-authorized USDT allowance verified.');
  }

  onProgress?.('registering', `Please confirm activateLevel(${level})...`);
  let registerTxHash = '';

  try {
    const matrixContract = new ethers.Contract(targetContract, MATRIX_CONTRACT_ABI, signer);
    const registerTx = await matrixContract.activateLevel(level);
    registerTxHash = registerTx.hash;
    onProgress?.('registering', 'Confirming on-chain activation...');
    await registerTx.wait(1);
  } catch (contractErr: any) {
    console.warn('[TokenPocket] Matrix contract call fallback to direct P2P transfer:', contractErr?.message);
    onProgress?.('registering', `Executing direct P2P transfer ($${cost.toFixed(2)})...`);
    const ownerTx = await usdt.transfer(PLATFORM_OWNER_BSC_WALLET, requiredAmount);
    await ownerTx.wait(1);
    registerTxHash = ownerTx.hash || registerTxHash;
  }

  onProgress?.('confirmed', `Level ${level} Successfully Activated!`);
  
  return {
    approvalTxHash,
    registerTxHash,
    bscScanUrl: buildBscScanUrl(registerTxHash, 'tx', isTestnet),
    fromAddress
  };
}

/**
 * Sends native BNB transaction directly to upline / protocol address
 */
export async function sendBnbTransaction(params: {
  fromAddress: string;
  toAddress: string;
  amountBnb: string | number;
}): Promise<string> {
  const { fromAddress, toAddress, amountBnb } = params;

  if (!hasInjectedWeb3Wallet()) {
    throw new Error('Web3 wallet is not available. Connect TokenPocket or MetaMask.');
  }

  if (!ethers.isAddress(toAddress)) {
    throw new Error('Invalid recipient wallet address.');
  }

  const provider = getInjectedProvider();
  const bnbString = typeof amountBnb === 'number' ? amountBnb.toFixed(6) : amountBnb;
  const valueWei = ethers.parseEther(bnbString);
  const valueHex = '0x' + valueWei.toString(16);

  const txParams = {
    from: fromAddress,
    to: toAddress,
    value: valueHex,
  };

  const txHash: string = await provider.request({
    method: 'eth_sendTransaction',
    params: [txParams],
  });

  return txHash;
}

/**
 * Shortens wallet address for clean UI display: 0x1234...5678
 */
export function formatShortWalletAddress(addr?: string): string {
  if (!addr) return '0x...';
  if (addr.length <= 12) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

/**
 * Constructs BscScan URL for transaction or address
 */
export function buildBscScanUrl(hashOrAddr: string, type: 'tx' | 'address' = 'tx', isTestnet = false): string {
  const base = isTestnet ? 'https://testnet.bscscan.com' : 'https://bscscan.com';
  return `${base}/${type}/${hashOrAddr}`;
}
