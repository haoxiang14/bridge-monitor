import { BRIDGES } from "@/lib/bridges";
import { checkAllBridges } from "@/lib/rpc";
import { checkNativeTokens } from "@/lib/cctp";
import { checkXStocks } from "@/lib/xstocks";
import { checkOftAdapters, checkOftTokens } from "@/lib/oft";

export const dynamic = "force-dynamic";

export async function GET() {
  const [results, nativeTokens, xstocks, oftAdapters, oftTokens] = await Promise.all([
    checkAllBridges(BRIDGES),
    checkNativeTokens(),
    checkXStocks(),
    checkOftAdapters(),
    checkOftTokens(),
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
