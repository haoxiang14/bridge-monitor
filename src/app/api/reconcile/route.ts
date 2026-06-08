import { BRIDGES } from "@/lib/bridges";
import { checkAllBridges } from "@/lib/rpc";
import { checkNativeTokens } from "@/lib/cctp";
import { checkXStocks } from "@/lib/xstocks";
import { sendLarkAlert } from "@/lib/lark";

export const dynamic = "force-dynamic";

export async function GET() {
  const [results, nativeTokens, xstocks] = await Promise.all([
    checkAllBridges(BRIDGES),
    checkNativeTokens(),
    checkXStocks(),
  ]);

  const larkUrl = process.env.LARK_WEBHOOK_URL;
  if (larkUrl) {
    const alerts = results.filter((r) => r.status === "ALERT");
    for (const alert of alerts) {
      await sendLarkAlert(larkUrl, alert);
    }
  }

  return Response.json({
    timestamp: new Date().toISOString(),
    larkEnabled: !!larkUrl,
    results,
    nativeTokens,
    xstocks,
  });
}
