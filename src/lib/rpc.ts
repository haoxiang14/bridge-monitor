import { RPC, RPC_LIST, BridgeConfig, L2Target } from "./bridges";

async function ethCallSingle(rpcUrl: string, to: string, data: string): Promise<bigint | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{ to, data }, "latest"],
        id: 1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const json: any = await res.json();
    if (json.result && json.result !== "0x" && json.result !== "0x0") {
      return BigInt(json.result);
    }
  } catch (e) {
    // silent, will try fallback
  }
  return null;
}

async function ethCall(rpcUrl: string, to: string, data: string): Promise<bigint | null> {
  const result = await ethCallSingle(rpcUrl, to, data);
  if (result !== null) return result;

  const chain = Object.entries(RPC).find(([, url]) => url === rpcUrl)?.[0];
  if (chain && RPC_LIST[chain]) {
    for (const fallback of RPC_LIST[chain].slice(1)) {
      const fallbackResult = await ethCallSingle(fallback, to, data);
      if (fallbackResult !== null) return fallbackResult;
    }
  }
  return null;
}

function balanceOfCalldata(holder: string): string {
  return "0x70a08231" + holder.slice(2).toLowerCase().padStart(64, "0");
}

const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";

async function getSolanaTokenSupply(rpcUrl: string, mintAddress: string): Promise<bigint | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenSupply",
        params: [mintAddress],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const json: any = await res.json();
    if (json.result?.value?.amount) {
      return BigInt(json.result.value.amount);
    }
  } catch (e) {
    console.error(`[SOLANA RPC ERROR] ${rpcUrl}:`, e);
  }
  return null;
}

export interface L2Breakdown {
  label: string;
  token: string;
  minted: number | null;
}

export interface ReconcileResult {
  bridge: string;
  bridgeUrl: string;
  path: string;
  token: string;
  l1Lock: string;
  l2Token: string;
  locked: number | null;
  minted: number | null;
  delta: number | null;
  deltaPct: number | null;
  status: "OK" | "ALERT" | "ERROR";
  timestamp: string;
  l2Breakdown?: L2Breakdown[];
}

async function getL2Supply(target: L2Target): Promise<{ raw: bigint | null; decimals: number }> {
  const rpcUrl = RPC[target.l2Rpc];
  if (target.l2Type === "solana") {
    const raw = await getSolanaTokenSupply(rpcUrl, target.l2Token);
    return { raw, decimals: target.l2Decimals ?? 9 };
  }
  const raw = await ethCall(rpcUrl, target.l2Token, TOTAL_SUPPLY_SELECTOR);
  return { raw, decimals: target.l2Decimals ?? 18 };
}

export async function checkBridge(config: BridgeConfig): Promise<ReconcileResult> {
  const l1Rpc = RPC[config.l1Rpc];

  const result: ReconcileResult = {
    bridge: config.bridge,
    bridgeUrl: config.bridgeUrl,
    path: config.path,
    token: config.token,
    l1Lock: config.l1Lock,
    l2Token: config.l2Token,
    locked: null,
    minted: null,
    delta: null,
    deltaPct: null,
    status: "ERROR",
    timestamp: new Date().toISOString(),
  };

  const lockedRaw = await ethCall(l1Rpc, config.l1Token, balanceOfCalldata(config.l1Lock));

  if (config.l2Targets && config.l2Targets.length > 0) {
    const supplies: { raw: bigint | null; decimals: number }[] = [];
    for (let i = 0; i < config.l2Targets.length; i += 10) {
      const chunk = config.l2Targets.slice(i, i + 10);
      const chunkResults = await Promise.all(chunk.map(getL2Supply));
      supplies.push(...chunkResults);
    }
    const l1Divisor = 10 ** config.decimals;
    const locked = lockedRaw !== null ? Number(lockedRaw) / l1Divisor : null;

    let totalMinted = 0;
    let successCount = 0;
    const breakdown: L2Breakdown[] = [];

    for (let i = 0; i < supplies.length; i++) {
      const { raw, decimals } = supplies[i];
      if (raw !== null) {
        const minted = Number(raw) / (10 ** decimals);
        totalMinted += minted;
        successCount++;
        breakdown.push({ label: config.l2Targets[i].label, token: config.l2Targets[i].l2Token, minted });
      } else {
        breakdown.push({ label: config.l2Targets[i].label, token: config.l2Targets[i].l2Token, minted: null });
      }
    }

    if (locked !== null && successCount > 0) {
      const delta = locked - totalMinted;
      const deltaPct = locked > 0 ? (delta / locked) * 100 : 0;
      result.locked = locked;
      result.minted = totalMinted;
      result.delta = delta;
      result.deltaPct = deltaPct;
      result.status = delta >= 0 ? "OK" : "ALERT";
      result.l2Breakdown = breakdown;
    }
  } else {
    const l2Rpc = RPC[config.l2Rpc];
    let mintedRaw: bigint | null;

    if (config.l2Type === "solana") {
      mintedRaw = await getSolanaTokenSupply(l2Rpc, config.l2Token);
    } else {
      mintedRaw = await ethCall(l2Rpc, config.l2Token, TOTAL_SUPPLY_SELECTOR);
    }

    if (lockedRaw !== null && mintedRaw !== null) {
      const l1Divisor = 10 ** config.decimals;
      const l2Divisor = config.l2Type === "solana" ? 10 ** 9 : 10 ** config.decimals;
      const locked = Number(lockedRaw) / l1Divisor;
      const minted = Number(mintedRaw) / l2Divisor;
      const delta = locked - minted;
      const deltaPct = locked > 0 ? (delta / locked) * 100 : 0;

      result.locked = locked;
      result.minted = minted;
      result.delta = delta;
      result.deltaPct = deltaPct;
      result.status = delta >= 0 ? "OK" : "ALERT";
    }
  }

  return result;
}

async function batch<T>(items: T[], fn: (item: T) => Promise<unknown>, size: number): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    await Promise.all(items.slice(i, i + size).map(fn));
  }
}

export async function checkAllBridges(bridges: BridgeConfig[]): Promise<ReconcileResult[]> {
  const results: ReconcileResult[] = [];
  for (const bridge of bridges) {
    results.push(await checkBridge(bridge));
  }
  return results;
}
