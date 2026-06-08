import { RPC } from "./bridges.js";

type ChainType = "evm" | "solana" | "sui" | "algorand" | "near" | "noble" | "aptos" | "xrpl" | "stellar" | "starknet";

interface NativeTokenChain {
  chain: string;
  rpc: string;
  fallbackRpcs?: string[];
  token: string;
  decimals: number;
  type?: ChainType;
}

interface NativeTokenConfig {
  name: string;
  symbol: string;
  url: string;
  chains: NativeTokenChain[];
}

export const NATIVE_TOKENS: NativeTokenConfig[] = [
  {
    name: "Circle CCTP",
    symbol: "USDC",
    url: "https://www.circle.com/usdc",
    chains: [
      { chain: "Ethereum", rpc: "https://ethereum-rpc.publicnode.com", token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      { chain: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc", token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
      { chain: "Base", rpc: "https://base-rpc.publicnode.com", token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
      { chain: "Optimism", rpc: "https://mainnet.optimism.io", token: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
      { chain: "Polygon", rpc: "https://polygon-bor-rpc.publicnode.com", token: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
      { chain: "Avalanche", rpc: "https://api.avax.network/ext/bc/C/rpc", token: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
      { chain: "HyperEVM", rpc: RPC.hyperevm, token: "0xb88339CB7199b77E23DB6E890353E22632Ba630f", decimals: 6 },
      { chain: "Linea", rpc: "https://rpc.linea.build", token: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", decimals: 6 },
      { chain: "Sonic", rpc: "https://rpc.soniclabs.com", token: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", decimals: 6 },
      { chain: "Monad", rpc: RPC.monad, token: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", decimals: 6 },
      { chain: "XDC", rpc: "https://earpc.xinfin.network", token: "0xfA2958CB79b0491CC627c1557F441eF849Ca8eb1", decimals: 6 },
      { chain: "World Chain", rpc: RPC.worldchain, token: "0x79A02482A880bCe3F13E09da970dC34dB4cD24D1", decimals: 6 },
      { chain: "Unichain", rpc: RPC.unichain, token: "0x078D782b760474a361dDA0AF3839290b0EF57AD6", decimals: 6 },
      { chain: "Sei", rpc: "https://sei.drpc.org", fallbackRpcs: ["https://sei-evm-rpc.publicnode.com"], token: "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392", decimals: 6 },
      { chain: "Ink", rpc: "https://ink.drpc.org", fallbackRpcs: ["https://rpc-gel.inkonchain.com"], token: "0x2D270e6886d130D724215A266106e6832161EAEd", decimals: 6 },
      { chain: "Morph", rpc: "https://morph.drpc.org", fallbackRpcs: ["https://rpc-quicknode.morphl2.io"], token: "0xCfb1186F4e93D60E60a8bDd997427D1F33bc372B", decimals: 6 },
      { chain: "Codex", rpc: "https://rpc.codex.xyz", token: "0xd996633a415985DBd7D6D12f4A4343E31f5037cf", decimals: 6 },
      { chain: "EDGE", rpc: "https://edge-mainnet.g.alchemy.com/public", token: "0x98d2919b9A214E6Fa5384AC81E6864bA686Ad74c", decimals: 6 },
      { chain: "Pharos", rpc: "https://rpc.pharos.xyz", token: "0xC879C018dB60520F4355C26eD1a6D572cdAC1815", decimals: 6 },
      { chain: "Plume", rpc: "https://plume.drpc.org", fallbackRpcs: ["https://rpc.plume.org"], token: "0x222365EF19F7947e5484218551B56bb3965Aa7aF", decimals: 6 },
      { chain: "Solana", rpc: "https://solana.drpc.org", fallbackRpcs: ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"], token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, type: "solana" },
      { chain: "Starknet", rpc: "https://starknet.drpc.org", fallbackRpcs: ["https://starknet-rpc.publicnode.com"], token: "0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb", decimals: 6, type: "starknet" },
      { chain: "Sui", rpc: "https://sui.drpc.org", fallbackRpcs: ["https://sui-rpc.publicnode.com"], token: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC", decimals: 6, type: "sui" },
      { chain: "Aptos", rpc: "https://aptos.drpc.org/v1", fallbackRpcs: ["https://fullnode.mainnet.aptoslabs.com/v1"], token: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b", decimals: 6, type: "aptos" },
      { chain: "Noble", rpc: "https://noble-api.polkachu.com", fallbackRpcs: ["https://noble-rpc.polkachu.com"], token: "uusdc", decimals: 6, type: "noble" },
    ],
  },
];

const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";
const ALERT_THRESHOLD_PCT = 30;

const FETCH_HEADERS: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "bridge-monitor/1.0" };

function fetchWithTimeout(url: string, opts?: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

async function ethCall(rpcUrl: string, to: string, data: string): Promise<bigint | null> {
  try {
    const res = await fetchWithTimeout(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to, data }, "latest"], id: 1 }),
    });
    const json: any = await res.json();
    if (json.result && json.result !== "0x" && json.result !== "0x0") {
      return BigInt(json.result);
    }
  } catch (e) {
    console.error(`[CCTP RPC ERROR] ${rpcUrl}:`, e);
  }
  return null;
}

async function getSolanaSupply(rpcUrl: string, mint: string): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTokenSupply", params: [mint] }),
    });
    const json: any = await res.json();
    if (json.result?.value?.amount) {
      return Number(BigInt(json.result.value.amount)) / 1e6;
    }
  } catch (e) { console.error(`[SOLANA ERROR]`, e); }
  return null;
}

async function getSuiSupply(rpcUrl: string, coinType: string): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "suix_getTotalSupply", params: [coinType] }),
    });
    const json: any = await res.json();
    if (json.result?.value) {
      return Number(BigInt(json.result.value)) / 1e6;
    }
  } catch (e) { console.error(`[SUI ERROR]`, e); }
  return null;
}

async function getAptosSupply(rpcUrl: string, moduleAddr: string): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(
      `${rpcUrl}/accounts/${moduleAddr}/resource/0x1::fungible_asset::ConcurrentSupply`,
    );
    const json: any = await res.json();
    const value = json?.data?.current?.value;
    if (value) return Number(BigInt(value)) / 1e6;
  } catch (e) { console.error(`[APTOS ERROR]`, e); }
  return null;
}

async function getNobleSupply(rpcUrl: string, denom: string): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(`${rpcUrl}/cosmos/bank/v1beta1/supply/by_denom?denom=${denom}`, {});
    const json: any = await res.json();
    if (json?.amount?.amount) {
      return Number(BigInt(json.amount.amount)) / 1e6;
    }
  } catch (e) { console.error(`[NOBLE ERROR]`, e); }
  return null;
}

async function getStarknetSupply(rpcUrl: string, contract: string): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "starknet_call",
        params: [{ contract_address: contract, entry_point_selector: "0x1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836", calldata: [] }, "latest"],
      }),
    });
    const json: any = await res.json();
    if (json.result) {
      const low = BigInt(json.result[0]);
      const high = json.result[1] ? BigInt(json.result[1]) : BigInt(0);
      const total = low + (high << BigInt(128));
      return Number(total) / 1e6;
    }
  } catch (e) { console.error(`[STARKNET ERROR]`, e); }
  return null;
}

async function getChainSupplySingle(rpc: string, chain: NativeTokenChain): Promise<number | null> {
  switch (chain.type) {
    case "solana":
      return getSolanaSupply(rpc, chain.token);
    case "sui":
      return getSuiSupply(rpc, chain.token);
    case "aptos":
      return getAptosSupply(rpc, chain.token);
    case "noble":
      return getNobleSupply(rpc, chain.token);
    case "starknet":
      return getStarknetSupply(rpc, chain.token);
    default: {
      const raw = await ethCall(rpc, chain.token, TOTAL_SUPPLY_SELECTOR);
      return raw !== null ? Number(raw) / (10 ** chain.decimals) : null;
    }
  }
}

async function getChainSupply(chain: NativeTokenChain): Promise<number | null> {
  const result = await getChainSupplySingle(chain.rpc, chain);
  if (result !== null) return result;

  if (chain.fallbackRpcs) {
    for (const fallback of chain.fallbackRpcs) {
      const fallbackResult = await getChainSupplySingle(fallback, chain);
      if (fallbackResult !== null) return fallbackResult;
    }
  }
  return null;
}

export interface ChainSupply {
  chain: string;
  token: string;
  supply: number | null;
}

export interface NativeTokenResult {
  name: string;
  symbol: string;
  url: string;
  totalSupply: number | null;
  chainCount: number;
  successCount: number;
  chains: ChainSupply[];
  status: "OK" | "ALERT" | "ERROR";
  timestamp: string;
}

export async function checkNativeTokens(): Promise<NativeTokenResult[]> {
  const results: NativeTokenResult[] = [];

  for (const config of NATIVE_TOKENS) {
    const supplies: ChainSupply[] = [];
    for (let i = 0; i < config.chains.length; i += 12) {
      const chunk = config.chains.slice(i, i + 12);
      const chunkResults = await Promise.all(
        chunk.map(async (c): Promise<ChainSupply> => {
          const supply = await getChainSupply(c);
          return { chain: c.chain, token: c.token, supply };
        })
      );
      supplies.push(...chunkResults);
    }

    const successChains = supplies.filter((s) => s.supply !== null);
    const totalSupply = successChains.reduce((sum, s) => sum + (s.supply ?? 0), 0);

    results.push({
      name: config.name,
      symbol: config.symbol,
      url: config.url,
      totalSupply: successChains.length > 0 ? totalSupply : null,
      chainCount: config.chains.length,
      successCount: successChains.length,
      chains: supplies,
      status: successChains.length > 0 ? "OK" : "ERROR",
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
