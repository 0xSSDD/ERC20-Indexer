import { ALCHEMY_DATA_URL, ALCHEMY_API_KEY, networks, CHAIN_INFO} from './ChainInfo.js';
import { groupByAddressAndNetwork, filterEmptyBalances, convertHexToDecimal, ERC20_ABI } from './Utils.js';
import { ethers } from "ethers";

/**
 * Fetches and processes balances for a given address.
 * @param {string} address - The wallet address to check.
 * @returns {Object} - Processed balances object.
 */
export async function getBalancesForAddress(address) {
  try {
    const response = await fetch(ALCHEMY_DATA_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        addresses: [
          {
            address,
            networks: networks
          }
        ]
      })
    });
    const data = await response.json();
    const filteredData = filterEmptyBalances(data);
    const withDecimalBalances = convertHexToDecimal(filteredData);

    const grouped = groupByAddressAndNetwork(withDecimalBalances);
    const withMetadata = await addTokenMetadataFromAlchemy(grouped);
    const withHistorical = await addHistoricalBalances(withMetadata, address);
    return withHistorical;
  } catch (error) {
    throw error;
  }
}

async function addTokenMetadataFromAlchemy(groupedObj) {
  async function fetchMetadata(network, tokenAddress) {
    if (!tokenAddress) return null;
    const url = `${CHAIN_INFO[network].alchemyBaseUrl}${ALCHEMY_API_KEY}`;
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenMetadata",
        params: [tokenAddress],
        id: 1
      })
    };
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data.result || null;
    } catch (error) {
      console.error(`Error fetching metadata for ${tokenAddress} on ${network}:`, error);
      return null;
    }
  }

  const metaPromises = [];
  const metaMap = {};
  for (const address in groupedObj) {
    for (const network in groupedObj[address]) {
      for (const token of groupedObj[address][network]) {
        if (token.tokenAddress) {
          const key = `${network}|${token.tokenAddress}`;
          if (!metaMap[key]) {
            metaPromises.push(
              fetchMetadata(network, token.tokenAddress).then(meta => {
                metaMap[key] = meta;
              })
            );
          }
        }
      }
    }
  }
  await Promise.all(metaPromises);

  const result = JSON.parse(JSON.stringify(groupedObj));
  for (const address in result) {
    for (const network in result[address]) {
      for (const token of result[address][network]) {
        if (token.tokenAddress) {
          const meta = metaMap[`${network}|${token.tokenAddress}`];
          if (meta) {
            token.name = meta.name;
            token.symbol = meta.symbol;
            token.decimals = meta.decimals;
            token.logo = meta.logo;
          }
        }
      }
    }
  }
  return result;
}

async function addHistoricalBalances(groupedObj, walletAddress) {
  const result = JSON.parse(JSON.stringify(groupedObj));

  for (const address in result) {
    for (const network in result[address]) {
      const chainInfo = CHAIN_INFO[network];
      if (!chainInfo) continue;
      const { quicknodeRpcUrl, blockNumber } = chainInfo;
      const provider = new ethers.providers.JsonRpcProvider(quicknodeRpcUrl);

      for (const token of result[address][network]) {
        token.blockNumber = blockNumber;
        try {
          if (!token.tokenAddress) {
            const bal = await provider.getBalance(walletAddress, blockNumber);
            token.tokenBalanceAtBlock = bal.toString();
          } else {
            const contract = new ethers.Contract(token.tokenAddress, ERC20_ABI, provider);
            const bal = await contract.balanceOf(walletAddress, { blockTag: blockNumber });
            token.tokenBalanceAtBlock = bal.toString();
          }
        } catch (err) {
          console.error(`Error fetching balance for ${walletAddress} on ${network} token ${token.tokenAddress}:`, err);
          token.tokenBalanceAtBlock = null;
        }
      }
    }
  }
  return result;
}