import React, { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Spinner,
  Text,
  HStack,
  Tag,
  IconButton,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { getBalancesForAddress } from './balance.js';
import { networks } from './ChainInfo.js';
import { DeleteIcon, RepeatIcon } from '@chakra-ui/icons';

const COLUMNS = [
  'Chain',
  'Token Name',
  'Symbol',
  'Decimals',
  'Current Balance',
  '1 Jan 2025 Balance',
  'Block Number',
  'Token Address',
  'Logo',
  'Actions',
];

function formatAmount(amount, decimals) {
  if (!amount) return 'N/A';
  if (decimals === undefined || decimals === null) decimals = 18;
  try {
    const amt = BigInt(amount);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = amt / divisor;
    const fraction = amt % divisor;
    if (decimals === 0) return whole.toString();
    const fractionStr = fraction.toString().padStart(decimals, '0');
    return `${whole.toString()}.${fractionStr}`;
  } catch {
    return amount;
  }
}

function flattenBalances(balancesObj) {
  // Returns an array of { chain, ...tokenData }
  const rows = [];
  for (const address in balancesObj) {
    for (const chain in balancesObj[address]) {
      for (const token of balancesObj[address][chain]) {
        rows.push({
          chain,
          ...token,
        });
      }
    }
  }
  return rows;
}

function getRowKey(row, idx) {
  // Unique key for each row
  return `${row.chain || ''}_${row.tokenAddress || 'native'}_${row.symbol || ''}_${idx}`;
}

function App() {
  const [address, setAddress] = useState('');
  const [rows, setRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('lg', 'dark-lg');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setRows([]);
    setDeletedRows([]);
    try {
      const data = await getBalancesForAddress(address.trim());
      const flatRows = flattenBalances(data);
      setRows(flatRows);
    } catch (err) {
      setError('Failed to fetch balances. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Remove row (move to deleted)
  const handleRemoveRow = (rowKey) => {
    setRows(prev => {
      const idx = prev.findIndex((row, i) => getRowKey(row, i) === rowKey);
      if (idx === -1) return prev;
      const [removed] = prev.splice(idx, 1);
      setDeletedRows(d => [...d, { ...removed, _deletedKey: rowKey }]);
      return [...prev];
    });
  };

  // Undelete row (move back to main)
  const handleUndeleteRow = (rowKey) => {
    setDeletedRows(prev => {
      const idx = prev.findIndex(row => row._deletedKey === rowKey);
      if (idx === -1) return prev;
      const [restored] = prev.splice(idx, 1);
      setRows(r => [...r, restored]);
      return [...prev];
    });
  };

  return (
    <Box w="100vw" minH="100vh" bg="gray.50" p={8}>
      <Center>
        <Flex direction="column" align="center" w="100%">
          <Heading mb={2} fontSize={40} fontWeight="extrabold" color="gray.800" letterSpacing="tight">
            Free Token Indexer
          </Heading>
          <Text mb={2} color="gray.600" fontSize="lg">
            Enter an address to view all token and native balances across supportedchains.
          </Text>
          <HStack mb={4} spacing={2}>
            <Text fontWeight="bold" color="gray.700">Supported Chains:</Text>
            {networks.map(chain => (
              <Tag key={chain} colorScheme="blue" borderRadius="full" fontSize="md" px={3} py={1}>
                {chain}
              </Tag>
            ))}
          </HStack>
          <Flex mb={8} gap={2} w="100%" maxW="700px" justify="center">
            <Input
              placeholder="Wallet Address"
              value={address}
              onChange={e => setAddress(e.target.value)}
              bg="white"
              fontSize={20}
              borderRadius="lg"
              boxShadow="md"
              px={6}
              py={6}
              h="56px"
              w="600px"
              _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 2px #3182ce33' }}
            />
            <Button
              colorScheme="blue"
              onClick={handleFetch}
              isLoading={loading}
              disabled={!address.trim()}
              borderRadius="lg"
              px={8}
              h="56px"
              fontSize="lg"
              fontWeight="bold"
              boxShadow="md"
            >
              Fetch Balances
            </Button>
          </Flex>
          {error && (
            <Text color="red.500" mb={4} fontSize="lg">
              {error}
            </Text>
          )}
          {loading && <Spinner size="xl" />}
          {!loading && (
            <Box
              w="100%"
              maxW="1400px"
              borderRadius="2xl"
              boxShadow={cardShadow}
              overflowX="auto"
              bg={cardBg}
              p={6}
              mt={2}
            >
              <Table
                variant="simple"
                size="md"
                sx={{
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  minWidth: '1200px',
                }}
              >
                <Thead position="sticky" top={0} bg="gray.100" zIndex={1}>
                  <Tr>
                    {COLUMNS.map(col => (
                      <Th
                        key={col}
                        fontWeight="bold"
                        fontSize="lg"
                        borderBottom="2px solid #3182ce"
                        py={4}
                        px={3}
                        textAlign="left"
                        bg="gray.100"
                        whiteSpace="nowrap"
                        letterSpacing="tight"
                      >
                        {col}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.length === 0 && (
                    <Tr>
                      <Td colSpan={COLUMNS.length} textAlign="center" py={8} color="gray.400" fontSize="lg">
                        No data to display. Enter an address and fetch balances.
                      </Td>
                    </Tr>
                  )}
                  {rows.map((row, idx) => {
                    const decimals =
                      row.decimals !== undefined && row.decimals !== null
                        ? row.decimals
                        : 18;
                    const rowKey = getRowKey(row, idx);
                    return (
                      <Tr
                        key={rowKey}
                        _hover={{
                          bg: '#F7FAFC',
                        }}
                        style={{
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <Td px={3}>{row.chain || 'N/A'}</Td>
                        <Td px={3}>{row.name || 'N/A'}</Td>
                        <Td px={3}>{row.symbol || 'N/A'}</Td>
                        <Td px={3}>{decimals}</Td>
                        <Td px={3}>
                          {formatAmount(row.tokenBalanceDecimal, decimals)}
                        </Td>
                        <Td px={3}>
                          {formatAmount(row.tokenBalanceAtBlock, decimals)}
                        </Td>
                        <Td px={3}>{row.blockNumber || 'N/A'}</Td>
                        <Td px={3}>
                          {row.tokenAddress ? (
                            row.tokenAddress
                          ) : (
                            <Text as="span" color="gray.400">
                              Native
                            </Text>
                          )}
                        </Td>
                        <Td px={3}>
                          {row.logo ? (
                            <Image src={row.logo} alt="logo" boxSize="24px" />
                          ) : (
                            <Text as="span" color="gray.400">
                              N/A
                            </Text>
                          )}
                        </Td>
                        <Td px={3}>
                          <IconButton
                            aria-label="Remove"
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemoveRow(rowKey)}
                            _hover={{ bg: 'red.50', color: 'red.600' }}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* Deleted Table */}
          {deletedRows.length > 0 && (
            <>
              <Divider my={10} />
              <Box
                w="100%"
                maxW="1400px"
                borderRadius="2xl"
                boxShadow={cardShadow}
                overflowX="auto"
                bg={cardBg}
                p={6}
                mt={2}
              >
                <Heading fontSize="2xl" mb={4} color="gray.700">
                  Deleted Tokens
                </Heading>
                <Table
                  variant="simple"
                  size="md"
                  sx={{
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    minWidth: '1200px',
                  }}
                >
                  <Thead position="sticky" top={0} bg="gray.100" zIndex={1}>
                    <Tr>
                      {COLUMNS.map(col => (
                        <Th
                          key={col}
                          fontWeight="bold"
                          fontSize="lg"
                          borderBottom="2px solid #3182ce"
                          py={4}
                          px={3}
                          textAlign="left"
                          bg="gray.100"
                          whiteSpace="nowrap"
                          letterSpacing="tight"
                        >
                          {col}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {deletedRows.map((row, idx) => {
                      const decimals =
                        row.decimals !== undefined && row.decimals !== null
                          ? row.decimals
                          : 18;
                      const rowKey = row._deletedKey || getRowKey(row, idx);
                      return (
                        <Tr
                          key={rowKey}
                          style={{
                            opacity: 0.7,
                            background: '#FFF5F5',
                          }}
                        >
                          <Td px={3}>{row.chain || 'N/A'}</Td>
                          <Td px={3}>{row.name || 'N/A'}</Td>
                          <Td px={3}>{row.symbol || 'N/A'}</Td>
                          <Td px={3}>{decimals}</Td>
                          <Td px={3}>
                            {formatAmount(row.tokenBalanceDecimal, decimals)}
                          </Td>
                          <Td px={3}>
                            {formatAmount(row.tokenBalanceAtBlock, decimals)}
                          </Td>
                          <Td px={3}>{row.blockNumber || 'N/A'}</Td>
                          <Td px={3}>
                            {row.tokenAddress ? (
                              row.tokenAddress
                            ) : (
                              <Text as="span" color="gray.400">
                                Native
                              </Text>
                            )}
                          </Td>
                          <Td px={3}>
                            {row.logo ? (
                              <Image src={row.logo} alt="logo" boxSize="24px" />
                            ) : (
                              <Text as="span" color="gray.400">
                                N/A
                              </Text>
                            )}
                          </Td>
                          <Td px={3}>
                            <IconButton
                              aria-label="Restore"
                              icon={<RepeatIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleUndeleteRow(rowKey)}
                              _hover={{ bg: 'blue.50', color: 'blue.600' }}
                            />
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </>
          )}
        </Flex>
      </Center>
    </Box>
  );
}

export default App;
