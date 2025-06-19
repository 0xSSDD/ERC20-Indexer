import { getBalancesForAddress } from '../balance.js';

const ADDRESS_TO_CHECK = "0xb7275dd78e005d7d191fee57ed9448feabf708ef";

async function main() {
  try {
    const data = await getBalancesForAddress(ADDRESS_TO_CHECK);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching balances:', error);
  }
}

main().catch(console.error);