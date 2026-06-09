"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface L2Breakdown {
  label: string;
  token: string;
  minted: number | null;
}

interface ReconcileResult {
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

interface ChainSupply {
  chain: string;
  token: string;
  supply: number | null;
  prevSupply: number | null;
  change: number | null;
  changePct: number | null;
  alert: boolean;
}

interface NativeTokenResult {
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

interface XStocksChainDetail {
  chain: string;
  token: string;
  totalSupply: number | null;
  systemHeld: number | null;
  circulating: number | null;
}

interface XStocksSystemWallet {
  chain: string;
  address: string;
  balance: number | null;
}

interface XStocksResult {
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

interface ApiResponse {
  timestamp: string;
  results: ReconcileResult[];
  nativeTokens: NativeTokenResult[];
  xstocks: XStocksResult[];
}

const POLL_INTERVAL = 300_000;

const EXPLORER_URLS: Record<string, { name: string; url: string }> = {
  "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x470458C91978D2d929704489Ad730DC3E3001113": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x60af2681bcc4886935f428a1386a4a68973f7c4f": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9": { name: "Mantlescan", url: "https://mantlescan.xyz/address/" },
  "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE": { name: "Mantlescan", url: "https://mantlescan.xyz/address/" },
  "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2": { name: "Mantlescan", url: "https://mantlescan.xyz/address/" },
  "0x6199CCd9273A1E0e41e2cC18d9dAcd1E9382F58E": { name: "Mantlescan", url: "https://mantlescan.xyz/address/" },
  "0x2cfc85d8e48f8eab294be644d9e25c3030863003": { name: "Worldscan", url: "https://worldscan.org/address/" },
  "0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1": { name: "OP Etherscan", url: "https://optimistic.etherscan.io/address/" },
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": { name: "Polygonscan", url: "https://polygonscan.com/address/" },
  "4SoQ8UkWfeDH47T56PA53CZCeW4KytYCiU65CwBWoJUt": { name: "Solscan", url: "https://solscan.io/token/" },
  "0x36721e62edea413dc5195c4ca9c5a7eb175feb6b": { name: "HyperEVM Scan", url: "https://hyperevmscan.io/token/" },
};

const CHAIN_EXPLORERS: Record<string, { name: string; url: string }> = {
  "Ethereum": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "Arbitrum": { name: "Arbiscan", url: "https://arbiscan.io/address/" },
  "Arbitrum One": { name: "Arbiscan", url: "https://arbiscan.io/address/" },
  "Base": { name: "Basescan", url: "https://basescan.org/address/" },
  "Avalanche": { name: "Snowtrace", url: "https://snowtrace.io/address/" },
  "Berachain": { name: "Berascan", url: "https://berascan.com/address/" },
  "Celo": { name: "Celoscan", url: "https://celoscan.io/address/" },
  "Conflux eSpace": { name: "ConfluxScan", url: "https://evm.confluxscan.org/address/" },
  "Corn": { name: "Cornscan", url: "https://cornscan.io/address/" },
  "Flare": { name: "Flarescan", url: "https://flarescan.com/address/" },
  "HyperEVM": { name: "HyperEVM Scan", url: "https://hyperevmscan.io/address/" },
  "Hedera": { name: "Hashscan", url: "https://hashscan.io/mainnet/contract/" },
  "Ink": { name: "Inkscan", url: "https://explorer.inkonchain.com/address/" },
  "Linea": { name: "Lineascan", url: "https://lineascan.build/address/" },
  "Mantle": { name: "Mantlescan", url: "https://mantlescan.xyz/address/" },
  "MegaETH": { name: "MegaETH Explorer", url: "https://megaexplorer.xyz/address/" },
  "Monad": { name: "Monad Explorer", url: "https://explorer.monad.xyz/address/" },
  "Morph": { name: "MorphScan", url: "https://explorer.morphl2.io/address/" },
  "Optimism": { name: "OP Etherscan", url: "https://optimistic.etherscan.io/address/" },
  "Plasma": { name: "Plasma Explorer", url: "https://explorer.plasma.io/address/" },
  "Polygon": { name: "Polygonscan", url: "https://polygonscan.com/address/" },
  "Polygon PoS": { name: "Polygonscan", url: "https://polygonscan.com/address/" },
  "Rootstock": { name: "RSK Explorer", url: "https://explorer.rootstock.io/address/" },
  "Sei": { name: "Seitrace", url: "https://seitrace.com/address/" },
  "Sonic": { name: "Sonicscan", url: "https://sonicscan.org/address/" },
  "Stable": { name: "Stable Explorer", url: "https://explorer.stable.xyz/address/" },
  "Tempo": { name: "Tempo Explorer", url: "https://explorer.tempo.xyz/address/" },
  "Unichain": { name: "Uniscan", url: "https://uniscan.xyz/address/" },
  "World Chain": { name: "Worldscan", url: "https://worldscan.org/address/" },
  "XLayer": { name: "XLayer Explorer", url: "https://www.okx.com/web3/explorer/xlayer/address/" },
  "ZKsync": { name: "ZKsync Explorer", url: "https://explorer.zksync.io/address/" },
  "Solana": { name: "Solscan", url: "https://solscan.io/token/" },
  "XDC": { name: "XDC Explorer", url: "https://xdc.blocksscan.io/address/" },
  "Sui": { name: "Suiscan", url: "https://suiscan.xyz/mainnet/coin/" },
  "Algorand": { name: "Allo Explorer", url: "https://allo.info/asset/" },
  "Aptos": { name: "Aptos Explorer", url: "https://explorer.aptoslabs.com/account/" },
  "Noble": { name: "Mintscan", url: "https://www.mintscan.io/noble/assets/" },
  "NEAR": { name: "NEAR Explorer", url: "https://nearblocks.io/address/" },
  "XRPL": { name: "XRPL Explorer", url: "https://xrpscan.com/account/" },
  "Stellar": { name: "Stellar Expert", url: "https://stellar.expert/explorer/public/asset/USDC-" },
  "Codex": { name: "Codex Explorer", url: "https://explorer.codex.xyz/address/" },
  "EDGE": { name: "EDGE Explorer", url: "https://explorer.edge.network/address/" },
  "Pharos": { name: "Pharos Explorer", url: "https://explorer.pharos.xyz/address/" },
  "Plume": { name: "Plume Explorer", url: "https://explorer.plume.org/address/" },
  "Starknet": { name: "Starkscan", url: "https://starkscan.co/contract/" },
  // USDe OFT chains
  "Ethereum (Lockbox)": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "BNB Chain": { name: "BscScan", url: "https://bscscan.com/address/" },
  "Blast": { name: "Blastscan", url: "https://blastscan.io/address/" },
  "Zircuit": { name: "Zircuit Explorer", url: "https://explorer.zircuit.com/address/" },
  "Swell": { name: "Swell Explorer", url: "https://explorer.swellnetwork.io/address/" },
  "Fraxtal": { name: "Fraxscan", url: "https://fraxscan.com/address/" },
  "Scroll": { name: "Scrollscan", url: "https://scrollscan.com/address/" },
  "Manta": { name: "Manta Explorer", url: "https://pacific-explorer.manta.network/address/" },
  "Mode": { name: "Mode Explorer", url: "https://explorer.mode.network/address/" },
  "Metis": { name: "Andromeda Explorer", url: "https://andromeda-explorer.metis.io/address/" },
  "Kava": { name: "Kava Explorer", url: "https://explorer.kava.io/address/" },
  "zkSync": { name: "zkSync Explorer", url: "https://explorer.zksync.io/address/" },
  "TON": { name: "Tonscan", url: "https://tonscan.org/jetton/" },
  // xStocks chains
  "BSC": { name: "BscScan", url: "https://bscscan.com/address/" },
  "Tron": { name: "Tronscan", url: "https://tronscan.org/#/contract/" },
};

function getExplorer(addr: string): { name: string; url: string } {
  return EXPLORER_URLS[addr] ?? { name: "Etherscan", url: "https://etherscan.io/address/" };
}

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  if (Math.abs(n) >= 1_000_000) {
    return (n / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "M";
  }
  if (Math.abs(n) >= 1_000) {
    return (n / 1_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "K";
  }
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatFull(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

export default function Dashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReconcileResult | null>(null);
  const [selectedNative, setSelectedNative] = useState<NativeTokenResult | null>(null);
  const [selectedXStock, setSelectedXStock] = useState<XStocksResult | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reconcile");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);


  const errorCount = data?.results.filter((r) => r.status === "ERROR").length ?? 0;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#6ee7b7] animate-pulse" />
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Bridge Reconciliation Monitor
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Updated {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "—"}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={fetchData}
              disabled={loading}
              className="h-7 px-3 text-xs"
            >
              {loading ? "..." : "Refresh"}
            </Button>
          </div>
        </header>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Status</div>
            <div className="text-xl font-bold">
              {errorCount > 0 ? (
                <span className="text-amber-400">DEGRADED</span>
              ) : (
                <span className="text-emerald-400">HEALTHY</span>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bridges</div>
            <div className="text-xl font-bold">9</div>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Tokens</div>
            <div className="text-xl font-bold">22</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
            Failed to fetch: {error}
          </div>
        )}

        {/* Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            业务使用桥
          </h2>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Bridge</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Path</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Token</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Locked (L1)</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Minted (L1/L2)</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Delta</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Delta %</TableHead>
                  <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.results.map((r, i) => (
                  <TableRow
                    key={i}
                    onClick={() => setSelected(r)}
                    className={`cursor-pointer transition-colors border-border ${
                      r.status === "ALERT"
                        ? "bg-red-500/5 hover:bg-red-500/10"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <TableCell>
                      <a
                        href={r.bridgeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {r.bridge}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{r.path}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{r.token}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatNumber(r.locked)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatNumber(r.minted)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className={r.delta !== null && r.delta < 0 ? "text-red-400" : "text-emerald-400"}>
                        {r.delta !== null ? `${r.delta >= 0 ? "+" : ""}${formatNumber(r.delta)}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {r.deltaPct !== null ? `${r.deltaPct.toFixed(4)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.status === "OK" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          OK
                        </span>
                      )}
                      {r.status === "ALERT" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          ALERT
                        </span>
                      )}
                      {r.status === "ERROR" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                          ERROR
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!data && !error && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Fetching on-chain data...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Native Cross-chain Tokens */}
        {data?.nativeTokens && data.nativeTokens.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              跨链原生代币
            </h2>
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Protocol</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Token</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Total Supply</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Chains</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Change</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Change %</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.nativeTokens.map((nt, i) => (
                    <TableRow
                      key={i}
                      onClick={() => setSelectedNative(nt)}
                      className="cursor-pointer transition-colors border-border hover:bg-accent/50"
                    >
                      <TableCell>
                        <a
                          href={nt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {nt.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{nt.symbol}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(nt.totalSupply)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className="text-muted-foreground">{nt.successCount}/{nt.chainCount}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {nt.change !== null ? (
                          <span className={nt.change < 0 ? "text-red-400" : nt.change > 0 ? "text-emerald-400" : "text-muted-foreground"}>
                            {nt.change >= 0 ? "+" : ""}{formatNumber(nt.change)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {nt.changePct !== null ? `${nt.changePct.toFixed(4)}%` : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {nt.status === "OK" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            OK
                          </span>
                        )}
                        {nt.status === "ALERT" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            ALERT
                          </span>
                        )}
                        {nt.status === "MONITORING" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            1st POLL
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* xStocks Section */}
        {data?.xstocks && data.xstocks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              xStocks 代币化股票
            </h2>
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Token</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Underlying</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Total Supply</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">System Held</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Circulating</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Shares Held</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Reserve</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-right">Chains</TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-medium text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.xstocks.map((xs, i) => (
                    <TableRow
                      key={i}
                      onClick={() => setSelectedXStock(xs)}
                      className="cursor-pointer transition-colors border-border hover:bg-accent/50"
                    >
                      <TableCell>
                        <span className="font-mono text-sm font-medium text-foreground">{xs.symbol}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{xs.underlying}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(xs.totalSupply)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-amber-400">
                        {formatNumber(xs.systemHeld)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-400">
                        {formatNumber(xs.circulating)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-blue-400">
                        {formatNumber(xs.sharesHeld)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {xs.circulating !== null && xs.sharesHeld !== null && xs.circulating > 0 ? (
                          <span className={xs.sharesHeld >= xs.circulating ? "text-emerald-400" : "text-red-400"}>
                            {((xs.sharesHeld / xs.circulating) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <span className="text-muted-foreground">{xs.successCount}/{xs.chainCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {xs.status === "OK" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            OK
                          </span>
                        )}
                        {xs.status === "ERROR" && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            ERROR
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-xs text-muted-foreground text-center">
          Polling every 5 minutes via public RPCs | Click a row for contract details
        </footer>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="bg-card border-border !max-w-4xl !w-[85vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-8">
              <span className="text-lg">{selected?.token}</span>
              <span className="text-muted-foreground font-normal">— {selected?.bridge}</span>
              {selected?.status === "OK" && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OK</Badge>
              )}
              {selected?.status === "ALERT" && (
                <Badge variant="destructive">ALERT</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 mt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Explorer Links */}
              <div className="flex gap-2 flex-wrap">
                <a
                  href={selected.bridgeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-accent transition-colors"
                >
                  {selected.bridge}
                </a>
                <a
                  href={getExplorer(selected.l1Lock).url + selected.l1Lock}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-accent transition-colors"
                >
                  {getExplorer(selected.l1Lock).name}: L1 Lock
                </a>
                {!selected.l2Breakdown && (
                  <a
                    href={getExplorer(selected.l2Token).url + selected.l2Token}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-accent transition-colors"
                  >
                    {getExplorer(selected.l2Token).name}: L2 Token
                  </a>
                )}
              </div>

              {/* Path & Contract Addresses */}
              <div className={`grid gap-3 ${selected.l2Breakdown ? "grid-cols-2" : "grid-cols-3"}`}>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Bridge Path</div>
                  <div className="text-sm text-foreground">{selected.path}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">L1 Lock Contract</div>
                  <div className="font-mono text-xs text-foreground break-all leading-relaxed">{selected.l1Lock}</div>
                </div>
                {!selected.l2Breakdown && (
                  <div className="rounded-lg bg-secondary/50 border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">L2 Token Contract</div>
                    <div className="font-mono text-xs text-foreground break-all leading-relaxed">{selected.l2Token}</div>
                  </div>
                )}
              </div>

              {/* Supply Summary */}
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Supply Reconciliation</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Locked (L1)</span>
                    <span className="font-mono text-sm">{formatFull(selected.locked)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">
                      {selected.l2Breakdown ? `Total Minted (${selected.l2Breakdown.filter(b => b.minted !== null).length} chains)` : "Minted (L1/L2)"}
                    </span>
                    <span className="font-mono text-sm">{formatFull(selected.minted)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Delta</span>
                    <span className={`font-mono text-sm font-medium ${selected.delta !== null && selected.delta < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {selected.delta !== null ? `${selected.delta >= 0 ? "+" : ""}${formatFull(selected.delta)}` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Delta %</span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {selected.deltaPct !== null ? `${selected.deltaPct.toFixed(4)}%` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-L2 Breakdown */}
              {selected.l2Breakdown && (
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Chain Breakdown</div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Chain</th>
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Token Contract</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">Supply</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.l2Breakdown.map((b, i) => {
                          const explorer = CHAIN_EXPLORERS[b.label] ?? getExplorer(b.token);
                          return (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="px-3 py-1.5 text-foreground">{b.label}</td>
                              <td className="px-3 py-1.5">
                                <a
                                  href={explorer.url + b.token}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                  {b.token.slice(0, 6)}...{b.token.slice(-4)}
                                </a>
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono">
                                {b.minted !== null ? formatNumber(b.minted) : <span className="text-muted-foreground">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[10px] text-muted-foreground text-right">
                Last checked: {new Date(selected.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Native Token Detail Modal */}
      <Dialog open={!!selectedNative} onOpenChange={(open) => !open && setSelectedNative(null)}>
        <DialogContent className="bg-card border-border !max-w-4xl !w-[85vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-8">
              <span className="text-lg">{selectedNative?.symbol}</span>
              <span className="text-muted-foreground font-normal">— {selectedNative?.name}</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedNative?.successCount}/{selectedNative?.chainCount} chains
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedNative && (
            <div className="space-y-5 mt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Total Supply</div>
                  <div className="font-mono text-sm text-foreground">{formatFull(selectedNative.totalSupply)}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Change (last poll)</div>
                  <div className={`font-mono text-sm ${selectedNative.change !== null && selectedNative.change < 0 ? "text-red-400" : selectedNative.change !== null && selectedNative.change > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {selectedNative.change !== null ? `${selectedNative.change >= 0 ? "+" : ""}${formatFull(selectedNative.change)}` : "First poll — no delta yet"}
                  </div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Model</div>
                  <div className="text-sm text-foreground">Burn & Mint (native issuance)</div>
                </div>
              </div>

              {/* Alert info */}
              {selectedNative.alertChains.length > 0 && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
                  Supply spike detected on: {selectedNative.alertChains.join(", ")} (&gt;30% change in one poll)
                </div>
              )}

              {/* Per-chain breakdown */}
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Per-Chain Supply</div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className="text-left px-3 py-2 text-muted-foreground font-medium">Chain</th>
                        <th className="text-left px-3 py-2 text-muted-foreground font-medium">Contract</th>
                        <th className="text-right px-3 py-2 text-muted-foreground font-medium">Supply</th>
                        <th className="text-right px-3 py-2 text-muted-foreground font-medium">Change</th>
                        <th className="text-right px-3 py-2 text-muted-foreground font-medium">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedNative.chains
                        .filter((c) => c.supply !== null)
                        .sort((a, b) => (b.supply ?? 0) - (a.supply ?? 0))
                        .map((c, i) => {
                          const explorer = CHAIN_EXPLORERS[c.chain] ?? { name: "Explorer", url: "https://etherscan.io/address/" };
                          const share = selectedNative.totalSupply ? ((c.supply ?? 0) / selectedNative.totalSupply) * 100 : 0;
                          return (
                            <tr key={i} className={`border-b border-border last:border-0 hover:bg-secondary/30 ${c.alert ? "bg-red-500/10" : ""}`}>
                              <td className="px-3 py-1.5 text-foreground">
                                {c.alert && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />}
                                {c.chain}
                              </td>
                              <td className="px-3 py-1.5">
                                <a
                                  href={explorer.url + c.token}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                  {c.token.slice(0, 6)}...{c.token.slice(-4)}
                                </a>
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono">{formatNumber(c.supply)}</td>
                              <td className="px-3 py-1.5 text-right font-mono">
                                {c.change !== null ? (
                                  <span className={c.alert ? "text-red-400 font-medium" : c.change > 0 ? "text-emerald-400" : c.change < 0 ? "text-red-400" : "text-muted-foreground"}>
                                    {c.change >= 0 ? "+" : ""}{formatNumber(c.change)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">{share.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      {selectedNative.chains
                        .filter((c) => c.supply === null)
                        .map((c, i) => (
                          <tr key={`err-${i}`} className="border-b border-border last:border-0">
                            <td className="px-3 py-1.5 text-muted-foreground">{c.chain}</td>
                            <td className="px-3 py-1.5 font-mono text-muted-foreground">{c.token.slice(0, 6)}...{c.token.slice(-4)}</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-[10px] text-muted-foreground text-right">
                Last checked: {new Date(selectedNative.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* xStocks Detail Modal */}
      <Dialog open={!!selectedXStock} onOpenChange={(open) => !open && setSelectedXStock(null)}>
        <DialogContent className="bg-card border-border !max-w-4xl !w-[85vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 pr-8">
              <span className="text-lg">{selectedXStock?.symbol}</span>
              <span className="text-muted-foreground font-normal">— {selectedXStock?.underlying}</span>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedXStock?.successCount}/{selectedXStock?.chainCount} chains
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedXStock && (
            <div className="space-y-5 mt-2 max-h-[70vh] overflow-y-auto pr-1">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Total Supply (on-chain)</div>
                  <div className="font-mono text-sm text-foreground">{formatFull(selectedXStock.totalSupply)}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">System Held (Locked)</div>
                  <div className="font-mono text-sm text-amber-400">{formatFull(selectedXStock.systemHeld)}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Circulating (on-chain calc)</div>
                  <div className="font-mono text-sm text-emerald-400">{formatFull(selectedXStock.circulating)}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Circulating (PoR API)</div>
                  <div className="font-mono text-sm text-foreground">{formatFull(selectedXStock.porCirculating)}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Shares Held (PoR)</div>
                  <div className="font-mono text-sm text-blue-400">{formatFull(selectedXStock.sharesHeld)}</div>
                </div>
                <div className="rounded-lg bg-secondary/50 border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Reserve Ratio</div>
                  <div className={`font-mono text-sm ${selectedXStock.circulating && selectedXStock.sharesHeld && selectedXStock.sharesHeld >= selectedXStock.circulating ? "text-emerald-400" : "text-red-400"}`}>
                    {selectedXStock.circulating && selectedXStock.sharesHeld ? ((selectedXStock.sharesHeld / selectedXStock.circulating) * 100).toFixed(2) + "%" : "—"}
                  </div>
                </div>
              </div>

              {/* Per-chain breakdown */}
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Chain Breakdown</div>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className="text-left px-3 py-2 text-muted-foreground font-medium">Chain</th>
                        <th className="text-left px-3 py-2 text-muted-foreground font-medium">Contract</th>
                        <th className="text-right px-3 py-2 text-muted-foreground font-medium">Total Supply</th>
                        <th className="text-right px-3 py-2 text-muted-foreground font-medium">System Held</th>
                        <th className="text-right px-3 py-2 text-muted-foreground font-medium">Circulating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedXStock.chains
                        .filter((c) => c.totalSupply !== null)
                        .sort((a, b) => (b.circulating ?? 0) - (a.circulating ?? 0))
                        .map((c, i) => {
                          const explorer = CHAIN_EXPLORERS[c.chain] ?? { name: "Explorer", url: "https://etherscan.io/address/" };
                          return (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="px-3 py-1.5 text-foreground">{c.chain}</td>
                              <td className="px-3 py-1.5">
                                <a
                                  href={explorer.url + c.token}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-400 hover:text-blue-300 hover:underline"
                                >
                                  {c.token.slice(0, 6)}...{c.token.slice(-4)}
                                </a>
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono">{formatNumber(c.totalSupply)}</td>
                              <td className="px-3 py-1.5 text-right font-mono text-amber-400">{formatNumber(c.systemHeld)}</td>
                              <td className="px-3 py-1.5 text-right font-mono text-emerald-400">{formatNumber(c.circulating)}</td>
                            </tr>
                          );
                        })}
                      {selectedXStock.chains
                        .filter((c) => c.totalSupply === null)
                        .map((c, i) => (
                          <tr key={`err-${i}`} className="border-b border-border last:border-0">
                            <td className="px-3 py-1.5 text-muted-foreground">{c.chain}</td>
                            <td className="px-3 py-1.5 font-mono text-muted-foreground">{c.token.slice(0, 6)}...{c.token.slice(-4)}</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
                            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Wallets */}
              {selectedXStock.systemWallets.length > 0 && (
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">System Wallets (Locked)</div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Chain</th>
                          <th className="text-left px-3 py-2 text-muted-foreground font-medium">Wallet</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedXStock.systemWallets
                          .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0))
                          .map((sw, i) => (
                            <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="px-3 py-1.5 text-foreground">{sw.chain}</td>
                              <td className="px-3 py-1.5 font-mono text-muted-foreground">
                                {sw.address.slice(0, 8)}...{sw.address.slice(-6)}
                              </td>
                              <td className="px-3 py-1.5 text-right font-mono text-amber-400">{formatNumber(sw.balance)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[10px] text-muted-foreground text-right">
                Last checked: {new Date(selectedXStock.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
