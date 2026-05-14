import { RPC } from "./bridges";

type ChainType = "evm" | "solana" | "sui" | "algorand" | "near" | "noble" | "aptos" | "xrpl" | "stellar" | "starknet";

interface NativeTokenChain {
  chain: string;
  rpc: string;
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
      // === CCTP V2 EVM Chains (mainnet) ===
      { chain: "Ethereum", rpc: "https://ethereum-rpc.publicnode.com", token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      { chain: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc", token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
      { chain: "Base", rpc: "https://mainnet.base.org", token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
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
      { chain: "Sei", rpc: RPC.sei, token: "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392", decimals: 6 },
      { chain: "Ink", rpc: RPC.ink, token: "0x2D270e6886d130D724215A266106e6832161EAEd", decimals: 6 },
      { chain: "Morph", rpc: RPC.morph, token: "0xCfb1186F4e93D60E60a8bDd997427D1F33bc372B", decimals: 6 },
      { chain: "Codex", rpc: "https://rpc.codex.xyz", token: "0xd996633a415985DBd7D6D12f4A4343E31f5037cf", decimals: 6 },
      { chain: "EDGE", rpc: "https://edge-mainnet.g.alchemy.com/public", token: "0x98d2919b9A214E6Fa5384AC81E6864bA686Ad74c", decimals: 6 },
      { chain: "Pharos", rpc: "https://rpc.pharos.xyz", token: "0xC879C018dB60520F4355C26eD1a6D572cdAC1815", decimals: 6 },
      { chain: "Plume", rpc: "https://rpc.plume.org", token: "0x222365EF19F7947e5484218551B56bb3965Aa7aF", decimals: 6 },
      // === CCTP V2 Non-EVM ===
      { chain: "Solana", rpc: RPC.solana, token: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, type: "solana" },
      { chain: "Starknet", rpc: "https://starknet-rpc.publicnode.com", token: "0x033068F6539f8e6e6b131e6B2B814e6c34A5224bC66947c47DaB9dFeE93b35fb", decimals: 6, type: "starknet" },
      // === CCTP V1 Legacy ===
      { chain: "Sui", rpc: "https://fullnode.mainnet.sui.io", token: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC", decimals: 6, type: "sui" },
      { chain: "Aptos", rpc: "https://fullnode.mainnet.aptoslabs.com/v1", token: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b", decimals: 6, type: "aptos" },
      { chain: "Noble", rpc: "https://noble-api.polkachu.com", token: "uusdc", decimals: 6, type: "noble" },
    ],
  },
];

const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";
const ALERT_THRESHOLD_PCT = 30;

const FETCH_HEADERS = { "Content-Type": "application/json", "User-Agent": "bridge-monitor/1.0" };

async function ethCall(rpcUrl: string, to: string, data: string): Promise<bigint | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to, data }, "latest"], id: 1 }),
      cache: "no-store",
    });
    const json = await res.json();
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
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTokenSupply", params: [mint] }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.result?.value?.amount) {
      return Number(BigInt(json.result.value.amount)) / 1e6;
    }
  } catch (e) { console.error(`[SOLANA ERROR]`, e); }
  return null;
}

async function getSuiSupply(rpcUrl: string, coinType: string): Promise<number | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "suix_getTotalSupply", params: [coinType] }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.result?.value) {
      return Number(BigInt(json.result.value)) / 1e6;
    }
  } catch (e) { console.error(`[SUI ERROR]`, e); }
  return null;
}

async function getAlgorandSupply(rpcUrl: string, assetId: string): Promise<number | null> {
  try {
    // Get creator address from asset info
    const assetRes = await fetch(`${rpcUrl}/v2/assets/${assetId}`, { cache: "no-store" });
    const assetData = await assetRes.json();
    const creator = assetData?.asset?.params?.creator;
    const total = BigInt(assetData?.asset?.params?.total ?? 0);
    if (!creator) return null;
    // Get creator's balance (reserve)
    const balRes = await fetch(`${rpcUrl}/v2/accounts/${creator}/assets?asset-id=${assetId}`, { cache: "no-store" });
    const balData = await balRes.json();
    const reserve = BigInt(balData?.assets?.[0]?.amount ?? 0);
    return Number(total - reserve) / 1e6;
  } catch (e) { console.error(`[ALGORAND ERROR]`, e); }
  return null;
}

async function getAptosSupply(rpcUrl: string, moduleAddr: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${rpcUrl}/accounts/${moduleAddr}/resource/0x1::fungible_asset::ConcurrentSupply`,
      { cache: "no-store" }
    );
    const json = await res.json();
    const value = json?.data?.current?.value;
    if (value) return Number(BigInt(value)) / 1e6;
  } catch (e) { console.error(`[APTOS ERROR]`, e); }
  return null;
}

async function getNobleSupply(rpcUrl: string, denom: string): Promise<number | null> {
  try {
    const res = await fetch(`${rpcUrl}/cosmos/bank/v1beta1/supply/by_denom?denom=${denom}`, { cache: "no-store" });
    const json = await res.json();
    if (json?.amount?.amount) {
      return Number(BigInt(json.amount.amount)) / 1e6;
    }
  } catch (e) { console.error(`[NOBLE ERROR]`, e); }
  return null;
}

async function getNearSupply(rpcUrl: string, accountId: string): Promise<number | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "query",
        params: { request_type: "call_function", finality: "final", account_id: accountId, method_name: "ft_total_supply", args_base64: "e30=" },
      }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.result?.result) {
      const raw = new TextDecoder().decode(new Uint8Array(json.result.result));
      return Number(BigInt(JSON.parse(raw))) / 1e6;
    }
  } catch (e) { console.error(`[NEAR ERROR]`, e); }
  return null;
}

async function getXrplSupply(rpcUrl: string, issuer: string): Promise<number | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ method: "gateway_balances", params: [{ account: issuer, hotwallet: [], ledger_index: "validated" }] }),
      cache: "no-store",
    });
    const json = await res.json();
    const obligations = json?.result?.obligations;
    if (obligations) {
      // Find USDC obligation (may be hex-encoded key or "USD")
      for (const [, value] of Object.entries(obligations)) {
        return Number(value as string);
      }
    }
  } catch (e) { console.error(`[XRPL ERROR]`, e); }
  return null;
}

async function getStellarSupply(rpcUrl: string, issuer: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${rpcUrl}/assets?asset_code=USDC&asset_issuer=${issuer}&limit=1`,
      { cache: "no-store" }
    );
    const json = await res.json();
    const record = json?._embedded?.records?.[0];
    if (record) {
      const amount = Number(record.amount ?? 0);
      const claimable = Number(record.claimable_balances_amount ?? 0);
      const pools = Number(record.liquidity_pools_amount ?? 0);
      return amount + claimable + pools;
    }
  } catch (e) { console.error(`[STELLAR ERROR]`, e); }
  return null;
}

async function getStarknetSupply(rpcUrl: string, contract: string): Promise<number | null> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "starknet_call",
        params: [{ contract_address: contract, entry_point_selector: "0x1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836", calldata: [] }, "latest"],
      }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.result) {
      const low = BigInt(json.result[0]);
      const high = json.result[1] ? BigInt(json.result[1]) : BigInt(0);
      const total = low + (high << BigInt(128));
      return Number(total) / 1e6;
    }
  } catch (e) { console.error(`[STARKNET ERROR]`, e); }
  return null;
}

async function getChainSupply(chain: NativeTokenChain): Promise<number | null> {
  switch (chain.type) {
    case "solana":
      return getSolanaSupply(chain.rpc, chain.token);
    case "sui":
      return getSuiSupply(chain.rpc, chain.token);
    case "algorand":
      return getAlgorandSupply(chain.rpc, chain.token);
    case "aptos":
      return getAptosSupply(chain.rpc, chain.token);
    case "noble":
      return getNobleSupply(chain.rpc, chain.token);
    case "near":
      return getNearSupply(chain.rpc, chain.token);
    case "xrpl":
      return getXrplSupply(chain.rpc, chain.token);
    case "stellar":
      return getStellarSupply(chain.rpc, chain.token);
    case "starknet":
      return getStarknetSupply(chain.rpc, chain.token);
    default: {
      const raw = await ethCall(chain.rpc, chain.token, TOTAL_SUPPLY_SELECTOR);
      return raw !== null ? Number(raw) / (10 ** chain.decimals) : null;
    }
  }
}

export interface ChainSupply {
  chain: string;
  token: string;
  supply: number | null;
  prevSupply: number | null;
  change: number | null;
  changePct: number | null;
  alert: boolean;
}

export interface NativeTokenResult {
  name: string;
  symbol: string;
  url: string;
  totalSupply: number | null;
  chainCount: number;
  successCount: number;
  chains: ChainSupply[];
  change: number | null;
  changePct: number | null;
  status: "OK" | "ALERT" | "MONITORING";
  alertChains: string[];
  timestamp: string;
}

let previousChainSupplies: Record<string, Record<string, number>> = {};

export async function checkNativeTokens(): Promise<NativeTokenResult[]> {
  const results: NativeTokenResult[] = [];

  for (const config of NATIVE_TOKENS) {
    const supplies = await Promise.all(
      config.chains.map(async (c): Promise<ChainSupply> => {
        const supply = await getChainSupply(c);
        const prev = previousChainSupplies[config.symbol]?.[c.chain] ?? null;

        let change: number | null = null;
        let changePct: number | null = null;
        let alert = false;

        if (supply !== null && prev !== null) {
          change = supply - prev;
          changePct = prev > 0 ? (change / prev) * 100 : 0;
          if (Math.abs(changePct) > ALERT_THRESHOLD_PCT) {
            alert = true;
          }
        }

        return { chain: c.chain, token: c.token, supply, prevSupply: prev, change, changePct, alert };
      })
    );

    const successChains = supplies.filter((s) => s.supply !== null);
    const totalSupply = successChains.reduce((sum, s) => sum + (s.supply ?? 0), 0);

    const prevTotal = Object.values(previousChainSupplies[config.symbol] ?? {}).reduce((a, b) => a + b, 0);
    const totalChange = prevTotal > 0 ? totalSupply - prevTotal : null;
    const totalChangePct = prevTotal > 0 ? (totalChange! / prevTotal) * 100 : null;

    if (successChains.length > 0) {
      if (!previousChainSupplies[config.symbol]) {
        previousChainSupplies[config.symbol] = {};
      }
      for (const s of successChains) {
        previousChainSupplies[config.symbol][s.chain] = s.supply!;
      }
    }

    const alertChains = supplies.filter((s) => s.alert).map((s) => s.chain);
    const status = alertChains.length > 0 ? "ALERT" : prevTotal > 0 ? "OK" : "MONITORING";

    results.push({
      name: config.name,
      symbol: config.symbol,
      url: config.url,
      totalSupply: successChains.length > 0 ? totalSupply : null,
      chainCount: config.chains.length,
      successCount: successChains.length,
      chains: supplies,
      change: totalChange,
      changePct: totalChangePct,
      status,
      alertChains,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
