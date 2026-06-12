import { BRIDGES } from "@/lib/bridges";
import { checkAllBridges } from "@/lib/rpc";
import { checkNativeTokens } from "@/lib/cctp";
import { checkXStocks } from "@/lib/xstocks";
import { checkOftAdapters, checkOftTokens } from "@/lib/oft";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function GET() {
  const [results, nativeTokens, xstocks, oftAdapters, oftTokens] = await Promise.all([
    withTimeout(checkAllBridges(BRIDGES), 30000, []),
    withTimeout(checkNativeTokens(), 30000, []),
    withTimeout(checkXStocks(), 55000, []),
    withTimeout(checkOftAdapters(), 30000, []),
    withTimeout(checkOftTokens(), 30000, []),
  ]);

  return Response.json({
    timestamp: new Date().toISOString(),
    results,
    nativeTokens,
    xstocks,
    oftAdapters,
    oftTokens,
  });
}
