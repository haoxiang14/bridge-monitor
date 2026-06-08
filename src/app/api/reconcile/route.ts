import { BRIDGES } from "@/lib/bridges";
import { checkAllBridges } from "@/lib/rpc";
import { checkNativeTokens } from "@/lib/cctp";
import { checkXStocks } from "@/lib/xstocks";

export const dynamic = "force-dynamic";

export async function GET() {
  const [results, nativeTokens, xstocks] = await Promise.all([
    checkAllBridges(BRIDGES),
    checkNativeTokens(),
    checkXStocks(),
  ]);

  return Response.json({
    timestamp: new Date().toISOString(),
    results,
    nativeTokens,
    xstocks,
  });
}
