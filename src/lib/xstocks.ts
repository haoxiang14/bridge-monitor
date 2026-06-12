const FETCH_HEADERS: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "bridge-monitor/1.0" };

function fetchWithTimeout(url: string, opts: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

interface XStocksToken {
  symbol: string;
  underlying: string;
  evmAddress: string;
  solanaMint: string;
  tonJetton: string;
  tronAddress: string;
}

const TOKENS: XStocksToken[] = [
  { symbol: "AAPLx", underlying: "Apple", evmAddress: "0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a", solanaMint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", tonJetton: "EQDsjAwfKo-6FVZv2EYt-1CaZTY_ZL-pfkSId6jeQchNwmdo", tronAddress: "TZ7nsyCuQq1cusCtex6V4qbzWcb3NbibAM" },
  { symbol: "AMZNx", underlying: "Amazon", evmAddress: "0x3557ba345b01efa20a1bddc61f573bfd87195081", solanaMint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg", tonJetton: "EQCtD2-7qxHhQoNhxri2JSzH-dlmWqKYCDtlEZqRi3-56gd9", tronAddress: "TKbZf7Ni93pAB6ZHQLR2BxbnukRsB3WNvh" },
  { symbol: "COINx", underlying: "Coinbase", evmAddress: "0x364f210f430ec2448fc68a49203040f6124096f0", solanaMint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu", tonJetton: "EQCvk4Oq2l5Yts_S7Q4j08fB9Ftzx3IY-7UI1AqssyKGDt_I", tronAddress: "TCaGwbURbmdYkG7fE8uXdbnofhw1uhA9zL" },
  { symbol: "CRCLx", underlying: "Circle", evmAddress: "0xfebded1b0986a8ee107f5ab1a1c5a813491deceb", solanaMint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1", tonJetton: "EQB-RPtAAQeFSGW3gIj0zREh4N92MGXfqFzxAc6TRvu-zvYT", tronAddress: "TRXfha1owZvFk5ru7cmd5SXDX1uKtcCRJN" },
  { symbol: "GOOGLx", underlying: "Alphabet", evmAddress: "0xe92f673ca36c5e2efd2de7628f815f84807e803f", solanaMint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN", tonJetton: "EQALwJzXnxFjckNsurCi9O2kVg_0b1KdtjOSfvOedlY37iZc", tronAddress: "TX34MBKqsHzvon1JX4mokJ8CLeh5QmBqNd" },
  { symbol: "HOODx", underlying: "Robinhood", evmAddress: "0xe1385fdd5ffb10081cd52c56584f25efa9084015", solanaMint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg", tonJetton: "EQAHz1jK27NO5IdHrht8146-EFz9p4kSZZx2H1xXuNQOYp_r", tronAddress: "TUQsUkzfwKegioj2utgYxQ9scPFZ5Aj68M" },
  { symbol: "MCDx", underlying: "McDonald's", evmAddress: "0x80a77a372c1e12accda84299492f404902e2da67", solanaMint: "XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2", tonJetton: "EQBUtLkOu9vzKu3PW58c50WX7w89BtzwYYZlZGmvOr_Aq66U", tronAddress: "TCVJcRqEEpkbs2iSJtMumoTqPxrKPwCLaW" },
  { symbol: "METAx", underlying: "Meta", evmAddress: "0x96702be57cd9777f835117a809c7124fe4ec989a", solanaMint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu", tonJetton: "EQD3cgQg432BiCSRli-hMswoVuvNnO42FuMdc-AXqd83SfcV", tronAddress: "TGJaEbWPNmM6NErggxJwWQ5ChRH7KxXF3a" },
  { symbol: "NVDAx", underlying: "NVIDIA", evmAddress: "0xc845b2894dbddd03858fd2d643b4ef725fe0849d", solanaMint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", tonJetton: "EQCva-Of7acQdU_piADdlcbzsFtA-xJwZoctz8ZOXBdBoaB8", tronAddress: "TNMR6r9Z4cL7eWNrNQ4e4sm2XPhhifexZU" },
  { symbol: "TSLAx", underlying: "Tesla", evmAddress: "0x8ad3c73f833d3f9a523ab01476625f269aeb7cf0", solanaMint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", tonJetton: "EQB4IwqWZPUczntdry8vSN2tsJKt-9F7iIb7gEFREYYOB563", tronAddress: "TTfj39Vm7ATpNJMsfDUWYVzxK8mPPA4yYE" },
];

interface ChainConfig {
  chain: string;
  type: "evm" | "solana" | "ton" | "tron";
  rpc: string;
  fallbackRpcs?: string[];
  decimals: number;
}

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "UVGrLEK3k_XMj9YGYT1BD";

const CHAINS: ChainConfig[] = [
  { chain: "Ethereum", type: "evm", rpc: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://ethereum-rpc.publicnode.com", "https://1rpc.io/eth"], decimals: 18 },
  { chain: "Arbitrum", type: "evm", rpc: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://arb1.arbitrum.io/rpc", "https://arbitrum-one-rpc.publicnode.com"], decimals: 18 },
  { chain: "Mantle", type: "evm", rpc: `https://mantle-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://rpc.mantle.xyz", "https://mantle-rpc.publicnode.com"], decimals: 18 },
  { chain: "BSC", type: "evm", rpc: `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://bsc-dataseed.binance.org", "https://bsc-rpc.publicnode.com"], decimals: 18 },
  { chain: "Ink", type: "evm", rpc: `https://ink-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://rpc-gel.inkonchain.com"], decimals: 18 },
  { chain: "HyperEVM", type: "evm", rpc: `https://hyperliquid-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://rpc.hyperliquid.xyz/evm"], decimals: 18 },
  { chain: "Solana", type: "solana", rpc: process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, fallbackRpcs: ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"], decimals: 8 },
  { chain: "TON", type: "ton", rpc: "https://tonapi.io/v2", decimals: 8 },
  { chain: "Tron", type: "tron", rpc: "https://api.trongrid.io", decimals: 18 },
];

interface SystemWalletsCache {
  evm: string[];
  solana: string[];
  ton: string[];
  tron: string[];
  fetchedAt: number;
}

let walletsCache: SystemWalletsCache | null = null;
const WALLETS_CACHE_TTL = 300_000; // 5 minutes

async function fetchSystemWallets(): Promise<SystemWalletsCache> {
  if (walletsCache && Date.now() - walletsCache.fetchedAt < WALLETS_CACHE_TTL) {
    return walletsCache;
  }
  const [evmRes, svmRes, tonRes, tronRes] = await Promise.all([
    fetchWithTimeout("https://api.xstocks.fi/api/v2/public/system/wallets?networkType=Evm", {}).catch(() => null),
    fetchWithTimeout("https://api.xstocks.fi/api/v2/public/system/wallets?networkType=Svm", {}).catch(() => null),
    fetchWithTimeout("https://api.xstocks.fi/api/v2/public/system/wallets?networkType=Ton", {}).catch(() => null),
    fetchWithTimeout("https://api.xstocks.fi/api/v2/public/system/wallets?networkType=Tron", {}).catch(() => null),
  ]);
  const parse = async (res: Response | null): Promise<string[]> => {
    if (!res) return [];
    try {
      const json: any = await res.json();
      return (json.nodes ?? []).map((n: any) => n.address);
    } catch { return []; }
  };
  walletsCache = {
    evm: await parse(evmRes),
    solana: await parse(svmRes),
    ton: await parse(tonRes),
    tron: await parse(tronRes),
    fetchedAt: Date.now(),
  };
  // Fallback to known wallets if API fails
  if (walletsCache.evm.length === 0) {
    walletsCache.evm = [
      "0x5f7a4c11bde4f218f0025ef444c369d838ffa2ad",
      "0xdfb7c32e55c43e28e2e1febbfcda1e945f52f3b3",
      "0xdaab44b861f2768a57d49d7344eaf2fed0b1317b",
      "0xbe0f93a8a46f756d9f16d90342c93b872793f90a",
      "0x0a934bc9c64309c9654451f23d8331c2dad34c2a",
    ];
  }
  if (walletsCache.solana.length === 0) {
    walletsCache.solana = [
      "S7vYFFWH6BjJyEsdrPQpqpYTqLTrPRK6KW3VwsJuRaS",
      "75kTRu9w6sThZsTCU36pmiQLSvm9feSePTeh8179oHmR",
      "HmMxmEjTbpGqgDsCCmgNfQKCbeH6QcGe1xKn9UXqXFqk",
      "7pt9tkctJPK7PPNQJ77GKg8ZffSF6QxoMiCFYHxrtaCj",
    ];
  }
  if (walletsCache.ton.length === 0) {
    walletsCache.ton = [
      "EQCVLU9-UVFfm9Sct863y50nsF03Jr6uBn1tJm4n9g8QLeQX",
      "EQBodzEUX6sCX1C-eWoMpTJplth9GD4As7cDKC86vm0_Sb90",
    ];
  }
  if (walletsCache.tron.length === 0) {
    walletsCache.tron = [
      "TCq5ut4WNk9EWya4bAyeoCe7yEd7RRkExc",
      "TVVuuKekxnHs7Kaesy75k2AB9qnU5t5Bw5",
    ];
  }
  return walletsCache;
}

const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";
const BALANCE_OF_SELECTOR = "0x70a08231";

async function evmCall(rpc: string, to: string, data: string): Promise<bigint | null> {
  try {
    const res = await fetchWithTimeout(rpc, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to, data }, "latest"], id: 1 }),
    });
    const json: any = await res.json();
    if (json.result && json.result !== "0x" && json.result !== "0x0") {
      return BigInt(json.result);
    }
  } catch (e) {
    console.error(`[XSTOCKS EVM ERROR] ${rpc}:`, e);
  }
  return null;
}

async function evmTotalSupply(rpc: string, token: string): Promise<bigint | null> {
  return evmCall(rpc, token, TOTAL_SUPPLY_SELECTOR);
}

async function evmBalanceOf(rpc: string, token: string, wallet: string): Promise<bigint | null> {
  const addr = wallet.replace("0x", "").toLowerCase().padStart(64, "0");
  return evmCall(rpc, token, BALANCE_OF_SELECTOR + addr);
}

async function solanaTotalSupply(rpc: string, mint: string): Promise<bigint | null> {
  try {
    const res = await fetchWithTimeout(rpc, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTokenSupply", params: [mint] }),
    });
    const json: any = await res.json();
    if (json.result?.value?.amount) {
      return BigInt(json.result.value.amount);
    }
  } catch (e) { console.error(`[XSTOCKS SOLANA ERROR]`, e); }
  return null;
}

async function solanaBalanceOf(rpc: string, mint: string, wallet: string): Promise<bigint | null> {
  const rpcs = [rpc, "https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];
  for (const rpcUrl of rpcs) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
        const res = await fetchWithTimeout(rpcUrl, {
          method: "POST",
          headers: FETCH_HEADERS,
          body: JSON.stringify({
            jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner",
            params: [wallet, { mint }, { encoding: "jsonParsed" }],
          }),
        }, 20000);
        const json: any = await res.json();
        if (json.error) continue;
        const accounts = json.result?.value ?? [];
        let total = BigInt(0);
        for (const acc of accounts) {
          const amount = acc.account?.data?.parsed?.info?.tokenAmount?.amount;
          if (amount) total += BigInt(amount);
        }
        return total;
      } catch {}
    }
  }
  return BigInt(0);
}

function tonHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (process.env.TONAPI_KEY) {
    h["Authorization"] = `Bearer ${process.env.TONAPI_KEY}`;
  }
  return h;
}

async function tonTotalSupply(apiBase: string, jetton: string): Promise<bigint | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt));
      const res = await fetchWithTimeout(`${apiBase}/jettons/${jetton}`, { headers: tonHeaders() });
      if (res.status === 429) continue;
      const json: any = await res.json();
      if (json.total_supply) return BigInt(json.total_supply);
    } catch (e) { console.error(`[XSTOCKS TON ERROR]`, e); }
  }
  return null;
}

async function tonBalanceOf(apiBase: string, jetton: string, wallet: string): Promise<bigint | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * attempt));
      const res = await fetchWithTimeout(`${apiBase}/accounts/${wallet}/jettons/${jetton}`, { headers: tonHeaders() });
      if (res.status === 429) continue;
      const json: any = await res.json();
      if (json.balance) return BigInt(json.balance);
      return BigInt(0);
    } catch (e) { console.error(`[XSTOCKS TON BALANCE ERROR]`, e); }
  }
  return BigInt(0);
}

function tronAddressToHex(base58: string): string {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = BigInt(0);
  for (const char of base58) {
    num = num * BigInt(58) + BigInt(ALPHABET.indexOf(char));
  }
  const hex = num.toString(16).padStart(50, "0");
  return hex.slice(0, 42);
}

async function tronCall(rpc: string, contractBase58: string, selector: string, parameter: string): Promise<bigint | null> {
  const headers: Record<string, string> = { ...FETCH_HEADERS };
  if (process.env.TRONGRID_API_KEY) {
    headers["TRON-PRO-API-KEY"] = process.env.TRONGRID_API_KEY;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1500 * attempt));
      const res = await fetchWithTimeout(`${rpc}/wallet/triggerconstantcontract`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          owner_address: "410000000000000000000000000000000000000000",
          contract_address: tronAddressToHex(contractBase58),
          function_selector: selector,
          parameter,
        }),
      }, 12000);
      if (res.status === 429 || res.status === 503) continue;
      const json: any = await res.json();
      const result = json?.constant_result?.[0];
      if (result) return BigInt("0x" + result);
      return BigInt(0);
    } catch (e) {
      if (attempt === 2) console.error(`[XSTOCKS TRON ERROR] ${selector}:`, e);
    }
  }
  return null;
}

async function tronTotalSupply(rpc: string, contractBase58: string): Promise<bigint | null> {
  return tronCall(rpc, contractBase58, "totalSupply()", "");
}

async function tronBalanceOf(rpc: string, contractBase58: string, walletBase58: string): Promise<bigint | null> {
  const walletHex = tronAddressToHex(walletBase58).slice(2).padStart(64, "0");
  const result = await tronCall(rpc, contractBase58, "balanceOf(address)", walletHex);
  return result ?? BigInt(0);
}

async function fetchPoR(symbol: string): Promise<{ sharesHeld: number | null; circulatingSupply: number | null }> {
  try {
    const res = await fetchWithTimeout(`https://api.xstocks.fi/api/v2/public/proof-of-reserves/${symbol}`, {});
    const json: any = await res.json();
    return {
      sharesHeld: json.sharesHeld ? Number(json.sharesHeld) : null,
      circulatingSupply: json.circulatingSupply ? Number(json.circulatingSupply) : null,
    };
  } catch {
    return { sharesHeld: null, circulatingSupply: null };
  }
}

function getTokenAddress(token: XStocksToken, chain: ChainConfig): string {
  switch (chain.type) {
    case "evm": return token.evmAddress;
    case "solana": return token.solanaMint;
    case "ton": return token.tonJetton;
    case "tron": return token.tronAddress;
  }
}

function getSystemWallets(chain: ChainConfig, wallets: SystemWalletsCache): string[] {
  switch (chain.type) {
    case "evm": return wallets.evm;
    case "solana": return wallets.solana;
    case "ton": return wallets.ton;
    case "tron": return wallets.tron;
  }
}

async function getTotalSupply(chain: ChainConfig, tokenAddr: string): Promise<bigint | null> {
  const rpcs = [chain.rpc, ...(chain.fallbackRpcs ?? [])];
  for (const rpc of rpcs) {
    let result: bigint | null = null;
    switch (chain.type) {
      case "evm": result = await evmTotalSupply(rpc, tokenAddr); break;
      case "solana": result = await solanaTotalSupply(rpc, tokenAddr); break;
      case "ton": result = await tonTotalSupply(rpc, tokenAddr); break;
      case "tron": result = await tronTotalSupply(rpc, tokenAddr); break;
    }
    if (result !== null) return result;
  }
  return null;
}

async function getWalletBalance(chain: ChainConfig, tokenAddr: string, wallet: string): Promise<bigint> {
  const rpcs = [chain.rpc, ...(chain.fallbackRpcs ?? [])];
  for (const rpc of rpcs) {
    let result: bigint | null = null;
    switch (chain.type) {
      case "evm": result = await evmBalanceOf(rpc, tokenAddr, wallet); break;
      case "solana": result = await solanaBalanceOf(rpc, tokenAddr, wallet); break;
      case "ton": result = await tonBalanceOf(rpc, tokenAddr, wallet); break;
      case "tron": result = await tronBalanceOf(rpc, tokenAddr, wallet); break;
    }
    if (result !== null) return result;
  }
  return BigInt(0);
}

export interface XStocksChainDetail {
  chain: string;
  token: string;
  totalSupply: number | null;
  systemHeld: number | null;
  circulating: number | null;
}

export interface XStocksSystemWallet {
  chain: string;
  address: string;
  balance: number | null;
}

export interface XStocksResult {
  symbol: string;
  underlying: string;
  totalSupply: number | null;
  systemHeld: number | null;
  circulating: number | null;
  sharesHeld: number | null;
  porCirculating: number | null;
  chainCount: number;
  successCount: number;
  chains: XStocksChainDetail[];
  systemWallets: XStocksSystemWallet[];
  status: "OK" | "ERROR";
  timestamp: string;
}

async function checkSingleToken(token: XStocksToken, wallets: SystemWalletsCache): Promise<XStocksResult> {
  const chains: XStocksChainDetail[] = [];
  const systemWallets: XStocksSystemWallet[] = [];
  let totalSupplyAll = 0;
  let systemHeldAll = 0;
  let successCount = 0;

  const por = await fetchPoR(token.symbol);

  const evmChains = CHAINS.filter(c => c.type === "evm");
  const solanaChains = CHAINS.filter(c => c.type === "solana");
  const tonChains = CHAINS.filter(c => c.type === "ton");
  const tronChains = CHAINS.filter(c => c.type === "tron");

  const evmResults = await Promise.all(
    [...evmChains, ...solanaChains].map(async (chain) => {
      const tokenAddr = getTokenAddress(token, chain);
      const supply = await getTotalSupply(chain, tokenAddr);
      if (supply === null) {
        return { chain, tokenAddr, supply: null, systemHeld: null, walletBalances: [] };
      }
      const chainWallets = getSystemWallets(chain, wallets);
      const balances = await Promise.all(
        chainWallets.map(async (wallet) => {
          const bal = await getWalletBalance(chain, tokenAddr, wallet);
          return { wallet, balance: bal };
        })
      );
      const totalSystemHeld = balances.reduce((sum, b) => sum + b.balance, BigInt(0));
      return { chain, tokenAddr, supply, systemHeld: totalSystemHeld, walletBalances: balances };
    })
  );

  // TON: sequential (rate limit only applies without API key)
  const tonResults = [];
  for (const chain of tonChains) {
    const tokenAddr = getTokenAddress(token, chain);
    const supply = await getTotalSupply(chain, tokenAddr);
    if (supply === null) {
      tonResults.push({ chain, tokenAddr, supply: null, systemHeld: null, walletBalances: [] });
      continue;
    }
    const chainWallets = getSystemWallets(chain, wallets);
    const balances = [];
    for (const wallet of chainWallets) {
      const bal = await getWalletBalance(chain, tokenAddr, wallet);
      balances.push({ wallet, balance: bal });
    }
    const totalSystemHeld = balances.reduce((sum, b) => sum + b.balance, BigInt(0));
    tonResults.push({ chain, tokenAddr, supply, systemHeld: totalSystemHeld, walletBalances: balances });
  }

  // Tron calls sequentially to avoid rate limiting
  const tronResults = [];
  for (const chain of tronChains) {
    const tokenAddr = getTokenAddress(token, chain);
    const supply = await getTotalSupply(chain, tokenAddr);
    if (supply === null) {
      tronResults.push({ chain, tokenAddr, supply: null, systemHeld: null, walletBalances: [] });
      continue;
    }
    const chainWallets = getSystemWallets(chain, wallets);
    const balances = [];
    for (const wallet of chainWallets) {
      const bal = await getWalletBalance(chain, tokenAddr, wallet);
      balances.push({ wallet, balance: bal });
    }
    const totalSystemHeld = balances.reduce((sum, b) => sum + b.balance, BigInt(0));
    tronResults.push({ chain, tokenAddr, supply, systemHeld: totalSystemHeld, walletBalances: balances });
  }

  const chainResults = [...evmResults, ...tonResults, ...tronResults];

  for (const result of chainResults) {
    const decimals = result.chain.decimals;
    const divisor = 10 ** decimals;

    if (result.supply !== null) {
      const supplyNum = Number(result.supply) / divisor;
      const heldNum = result.systemHeld !== null ? Number(result.systemHeld) / divisor : 0;
      totalSupplyAll += supplyNum;
      systemHeldAll += heldNum;
      successCount++;
      chains.push({
        chain: result.chain.chain,
        token: result.tokenAddr,
        totalSupply: supplyNum,
        systemHeld: heldNum,
        circulating: supplyNum - heldNum,
      });

      for (const wb of result.walletBalances) {
        const balNum = Number(wb.balance) / divisor;
        if (balNum > 0) {
          systemWallets.push({
            chain: result.chain.chain,
            address: wb.wallet,
            balance: balNum,
          });
        }
      }
    } else {
      chains.push({
        chain: result.chain.chain,
        token: result.tokenAddr,
        totalSupply: null,
        systemHeld: null,
        circulating: null,
      });
    }
  }

  return {
    symbol: token.symbol,
    underlying: token.underlying,
    totalSupply: successCount > 0 ? totalSupplyAll : null,
    systemHeld: successCount > 0 ? systemHeldAll : null,
    circulating: successCount > 0 ? totalSupplyAll - systemHeldAll : null,
    sharesHeld: por.sharesHeld,
    porCirculating: por.circulatingSupply,
    chainCount: CHAINS.length,
    successCount,
    chains,
    systemWallets,
    status: successCount > 0 ? "OK" : "ERROR",
    timestamp: new Date().toISOString(),
  };
}

export async function checkXStocks(): Promise<XStocksResult[]> {
  const wallets = await fetchSystemWallets();
  const results: XStocksResult[] = [];
  for (const token of TOKENS) {
    results.push(await checkSingleToken(token, wallets));
  }
  return results;
}
