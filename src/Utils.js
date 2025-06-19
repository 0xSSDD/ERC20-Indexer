export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)"
];

export function convertHexToDecimal(data) {
  const withDecimalBalances = data.map(token => ({
    ...token,
    tokenBalanceDecimal: BigInt(token.tokenBalance).toString()
  }));
  return withDecimalBalances;
}

export function filterEmptyBalances(data) {
  const filteredData = data.data.tokens.filter((token) => {
    return BigInt(token.tokenBalance) !== 0n;
  });
  return filteredData;
}

export function groupByAddressAndNetwork(arr) {
  const result = {};
  for (const token of arr) {
    const address = token.address;
    const network = token.network;
    // Remove address and network from the token info for the inner object
    const { address: _, network: __, ...rest } = token;

    if (!result[address]) {
      result[address] = {};
    }
    if (!result[address][network]) {
      result[address][network] = [];
    }
    result[address][network].push(rest);
  }
  return result;
}

/**
 * Generates chain-specific QuickNode RPC URLs from the base URL
 * @param {string} baseQuickNodeUrl - The base QuickNode URL (e.g., "https://quick-blue-pool.quiknode.pro/YOUR_API_KEY")
 * @param {string} chain - The chain identifier (e.g., "arb-mainnet", "avax-mainnet")
 * @returns {string} The chain-specific QuickNode RPC URL
 */
export function getQuickNodeRPCUrl(baseQuickNodeUrl, chain) {
  // Remove any trailing slashes from the base URL
  const cleanBaseUrl = baseQuickNodeUrl.replace(/\/+$/, '');

  switch (chain) {
    case 'arb-mainnet':
      return `${cleanBaseUrl.replace('quiknode.pro', 'arbitrum-mainnet.quiknode.pro')}`;

    case 'avax-mainnet':
      return `${cleanBaseUrl.replace('quiknode.pro', 'avalanche-mainnet.quiknode.pro')}/ext/bc/C/rpc/`;

    case 'eth-mainnet':
      return cleanBaseUrl;

    case 'matic-mainnet':
      return `${cleanBaseUrl.replace('quiknode.pro', 'matic.quiknode.pro')}`;

    case 'opt-mainnet':
      return `${cleanBaseUrl.replace('quiknode.pro', 'optimism.quiknode.pro')}`;

    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}
