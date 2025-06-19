# ERC20 Indexer

A Simple dirty, React-based dashboard that tracks crypto token balances (both native and ERC20) across multiple chains at specific historical block numbers.

Currently supports Ethereum, Arbitrum, Avalanche, Polygon, and Optimism networks, you can add a million more, you are only limited by what Quicknode AND alchemy support

Uses Alchemy and Quicknode, Inspired by https://github.com/alchemyplatform/erc20-indexer

![alt text](<Screenshot 2025-06-19 at 11.39.31.png>)

## Features
- Multi-chain balance tracking
- Historical balance lookup at specific blocks
- Support for both native tokens and ERC20 tokens
- Deleted tokens tracking

## Quick Start
```bash
npm install
npm run dev
```

## Configuration

### Block Numbers
To modify target block numbers for historical balance checks, edit `src/ChainInfo.js`:
```javascript
export const CHAIN_INFO = {
  "arb-mainnet": {
    blockNumber: 291029405,  // Arbitrum block number
  },
  "avax-mainnet": {
    blockNumber: 55159595,   // Avalanche block number
  },
  // ... other chains
};
```

### Environment Variables
Create a `.env` file in the project root:
```env
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_QUICKNODE_RPC_URL=your_quicknode_url
```

## Usage
1. Start the application
2. Enter a wallet address
3. View current and historical balances across all supported chains
4. (Optional) Delete tokens to move them to a separate tracking table

## Script usage
I have added an additional script called fetchbalance, if you dont like my UI and just want a terminal based version of this.
```
node src/scripts/fetchBalances.js
```