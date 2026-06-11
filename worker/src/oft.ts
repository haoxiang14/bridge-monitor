import { RPC_LIST } from "./bridges.js";

const FETCH_HEADERS: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "bridge-monitor/1.0" };
const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";
const BALANCE_OF_SELECTOR = "0x70a08231";

function fetchWithTimeout(url: string, opts?: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

// LayerZero chain name → our RPC key
const CHAIN_MAP: Record<string, string> = {
  ethereum: "ethereum",
  arbitrum: "arbitrum",
  base: "base",
  optimism: "optimism",
  polygon: "polygon",
  bsc: "bnb",
  scroll: "scroll",
  mode: "mode",
  celo: "celo",
  mantle: "mantle",
  avalanche: "avalanche",
  ink: "ink",
  hyperliquid: "hyperevm",
  blast: "blast",
  linea: "linea",
  zksync: "zksync",
  fraxtal: "fraxtal",
  manta: "manta",
  metis: "metis",
  kava: "kava",
  zircuit: "zircuit",
  swell: "swell",
  morph: "morph",
  sei: "sei",
  bera: "berachain",
  worldchain: "worldchain",
  unichain: "unichain",
};

function getRpcs(lzChain: string): string[] | null {
  const key = CHAIN_MAP[lzChain];
  if (!key) return null;
  return RPC_LIST[key] ?? null;
}

// Tokens to monitor (from CSV, excluding USDe, USDT0, XAUT0)
// Grouped by symbol for lookup against LayerZero API
const OFT_ADAPTER_SYMBOLS: string[] = [
  "PORTAL", "MAVIA", "UB", "ACU", "SIGN", "DAM", "TST", "OPEN", "AVA",
  "C", "SIDUS", "VIRTUAL", "SWELL", "COMMON", "ALMANAK", "LBTC", "TRVL",
  "OPG", "MON", "PUFFER", "ILV", "ZRC", "ENSO", "OL", "TRIA", "SCOR",
  "ZAMA", "YB", "ROBO", "EGP1", "AGI", "RLS", "F", "SPK", "ZENT",
  "INSP", "WBTC", "ZORA", "FMC", "USDT", "ENA", "USDS", "PROVE",
  "SAND", "MOG", "KERNEL", "MYTH", "PLANET", "PENDLE", "BSB", "ELSA",
  "MONPRO", "DEGEN",
];

const OFT_TOKEN_SYMBOLS: string[] = [
  "0G", "CORN", "FAR", "OBX", "PIEVERSE", "PARAM", "RDNT", "SHARDS",
  "BB", "SOMI", "ALLO", "AIXBT", "BEAM", "CAKE", "EDU", "IRYS",
  "MOVE", "MOCA", "PENGU", "ORDER", "SOPH", "SYRUP", "WOO", "BASED",
];

interface LzDeployment {
  address: string;
  localDecimals: number;
  type: "OFT" | "OFT_ADAPTER";
  innerTokenAddress?: string;
}

interface LzTokenEntry {
  name: string;
  sharedDecimals: number;
  endpointVersion: string;
  deployments: Record<string, LzDeployment>;
}

type LzApiResponse = Record<string, LzTokenEntry[]>;

let lzCache: LzApiResponse | null = null;

async function fetchLzMetadata(): Promise<LzApiResponse> {
  if (lzCache) return lzCache;
  try {
    const res = await fetchWithTimeout(
      "https://metadata.layerzero-api.com/v1/metadata/experiment/ofts/list",
      {},
      15000
    );
    lzCache = await res.json() as LzApiResponse;
    return lzCache;
  } catch (e) {
    console.error("[OFT] Failed to fetch LayerZero metadata:", e);
    return {};
  }
}

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
  } catch {}
  return null;
}

async function getTotalSupply(rpcs: string[], token: string): Promise<bigint | null> {
  for (const rpc of rpcs) {
    const result = await evmCall(rpc, token, TOTAL_SUPPLY_SELECTOR);
    if (result !== null) return result;
  }
  return null;
}

async function getBalanceOf(rpcs: string[], token: string, holder: string): Promise<bigint | null> {
  const addr = holder.replace("0x", "").toLowerCase().padStart(64, "0");
  for (const rpc of rpcs) {
    const result = await evmCall(rpc, token, BALANCE_OF_SELECTOR + addr);
    if (result !== null) return result;
  }
  return null;
}

export interface OftAdapterResult {
  symbol: string;
  name: string;
  sourceChain: string;
  adapterAddress: string;
  tokenAddress: string;
  locked: number | null;
  totalMinted: number | null;
  delta: number | null;
  deltaPct: number | null;
  destinations: { chain: string; supply: number | null }[];
  status: "OK" | "ALERT" | "ERROR";
  timestamp: string;
}

export interface OftTokenResult {
  symbol: string;
  name: string;
  totalSupply: number | null;
  chainCount: number;
  successCount: number;
  chains: { chain: string; supply: number | null }[];
  status: "OK" | "ERROR";
  timestamp: string;
}

export async function checkOftAdapters(): Promise<OftAdapterResult[]> {
  const lzData = await fetchLzMetadata();
  const results: OftAdapterResult[] = [];

  for (const symbol of OFT_ADAPTER_SYMBOLS) {
    const entries = lzData[symbol];
    if (!entries || entries.length === 0) {
      console.log(`[OFT] ${symbol}: not found in LayerZero API`);
      continue;
    }

    for (const entry of entries) {
      const adapters = Object.entries(entry.deployments)
        .filter(([_, d]) => d.type === "OFT_ADAPTER")
        .map(([chain, d]) => ({ chain, ...d }));

      const ofts = Object.entries(entry.deployments)
        .filter(([_, d]) => d.type === "OFT")
        .map(([chain, d]) => ({ chain, ...d }));

      for (const adapter of adapters) {
        const sourceRpcs = getRpcs(adapter.chain);
        if (!sourceRpcs) continue;

        const tokenAddress = adapter.innerTokenAddress ?? adapter.address;
        const decimals = adapter.localDecimals;
        const divisor = 10 ** decimals;

        const lockedRaw = await getBalanceOf(sourceRpcs, tokenAddress, adapter.address);
        const locked = lockedRaw !== null ? Number(lockedRaw) / divisor : null;

        const destinations: { chain: string; supply: number | null }[] = [];
        let totalMinted = 0;
        let mintedSuccess = 0;

        for (const oft of ofts) {
          const destRpcs = getRpcs(oft.chain);
          if (!destRpcs) {
            destinations.push({ chain: oft.chain, supply: null });
            continue;
          }
          const supplyRaw = await getTotalSupply(destRpcs, oft.address);
          const supply = supplyRaw !== null ? Number(supplyRaw) / (10 ** oft.localDecimals) : null;
          destinations.push({ chain: oft.chain, supply });
          if (supply !== null) {
            totalMinted += supply;
            mintedSuccess++;
          }
        }

        const hasData = locked !== null && mintedSuccess > 0;
        const delta = hasData ? locked! - totalMinted : null;
        const deltaPct = hasData && locked! > 0 ? (delta! / locked!) * 100 : null;
        const status = !hasData ? "ERROR" : delta! < 0 ? "ALERT" : "OK";

        results.push({
          symbol,
          name: entry.name,
          sourceChain: adapter.chain,
          adapterAddress: adapter.address,
          tokenAddress,
          locked,
          totalMinted: mintedSuccess > 0 ? totalMinted : null,
          delta,
          deltaPct,
          destinations,
          status,
          timestamp: new Date().toISOString(),
        });

        if (status !== "ERROR") {
          console.log(`[OFT ADAPTER] ${symbol} (${adapter.chain}): locked=${locked?.toFixed(2)} minted=${totalMinted.toFixed(2)} delta=${delta?.toFixed(2)} status=${status}`);
        }
      }
    }
  }

  return results;
}

export async function checkOftTokens(): Promise<OftTokenResult[]> {
  const lzData = await fetchLzMetadata();
  const results: OftTokenResult[] = [];

  for (const symbol of OFT_TOKEN_SYMBOLS) {
    const entries = lzData[symbol];
    if (!entries || entries.length === 0) {
      console.log(`[OFT] ${symbol}: not found in LayerZero API`);
      continue;
    }

    for (const entry of entries) {
      const chains: { chain: string; supply: number | null }[] = [];
      let totalSupply = 0;
      let successCount = 0;

      const allDeployments = Object.entries(entry.deployments);

      for (const [chain, deployment] of allDeployments) {
        const rpcs = getRpcs(chain);
        if (!rpcs) {
          chains.push({ chain, supply: null });
          continue;
        }
        const supplyRaw = await getTotalSupply(rpcs, deployment.address);
        const supply = supplyRaw !== null ? Number(supplyRaw) / (10 ** deployment.localDecimals) : null;
        chains.push({ chain, supply });
        if (supply !== null) {
          totalSupply += supply;
          successCount++;
        }
      }

      results.push({
        symbol,
        name: entry.name,
        totalSupply: successCount > 0 ? totalSupply : null,
        chainCount: allDeployments.length,
        successCount,
        chains,
        status: successCount > 0 ? "OK" : "ERROR",
        timestamp: new Date().toISOString(),
      });

      if (successCount > 0) {
        console.log(`[OFT TOKEN] ${symbol}: totalSupply=${totalSupply.toFixed(2)} chains=${successCount}/${allDeployments.length}`);
      }
    }
  }

  return results;
}
