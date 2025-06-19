import { getQuickNodeRPCUrl } from './Utils.js';

let ALCHEMY_API_KEY;
let QUICKNODE_RPC_URL;

// Check if we're in Vite or Node environment
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // Vite environment
  ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;
  QUICKNODE_RPC_URL = import.meta.env.VITE_QUICKNODE_RPC_URL;
} else {
  // Node.js environment
  ALCHEMY_API_KEY = 'P-kKDDfmWVXc3MPjx2m39'; // Your API key
  QUICKNODE_RPC_URL = 'https://quick-blue-pool.quiknode.pro/5770c7df4335da62d94f49606f8cfaacf34fb173';
}

export { ALCHEMY_API_KEY, QUICKNODE_RPC_URL };
export const ALCHEMY_DATA_URL = `https://api.g.alchemy.com/data/v1/${ALCHEMY_API_KEY}/assets/tokens/balances/by-address`;

// The block numbers are for 1st January 2025 for diff chains
export const CHAIN_INFO = {
  "arb-mainnet": {
    alchemyBaseUrl: "https://arb-mainnet.g.alchemy.com/v2/",
    quicknodeRpcUrl: "https://quick-blue-pool.arbitrum-mainnet.quiknode.pro/5770c7df4335da62d94f49606f8cfaacf34fb173",
    blockNumber: 291029405,
  },
  "avax-mainnet": {
    alchemyBaseUrl: "https://avax-mainnet.g.alchemy.com/v2/",
    quicknodeRpcUrl: getQuickNodeRPCUrl(QUICKNODE_RPC_URL, "avax-mainnet"),
    blockNumber: 55159595,
  },
  "eth-mainnet": {
    alchemyBaseUrl: "https://eth-mainnet.g.alchemy.com/v2/",
    quicknodeRpcUrl: getQuickNodeRPCUrl(QUICKNODE_RPC_URL, "eth-mainnet"),
    blockNumber: 21533058,
  },
  "matic-mainnet": {
    alchemyBaseUrl: "https://polygon-mainnet.g.alchemy.com/v2/",
    quicknodeRpcUrl: getQuickNodeRPCUrl(QUICKNODE_RPC_URL, "matic-mainnet"),
    blockNumber: 66197907,
  },
  "opt-mainnet": {
    alchemyBaseUrl: "https://opt-mainnet.g.alchemy.com/v2/",
    quicknodeRpcUrl: getQuickNodeRPCUrl(QUICKNODE_RPC_URL, "opt-mainnet"),
    blockNumber: 130088611,
  },
};

export const networks = [
  "arb-mainnet",
  "avax-mainnet",
  "base-mainnet",
  "eth-mainnet",
  "matic-mainnet",
  "opt-mainnet",
];
