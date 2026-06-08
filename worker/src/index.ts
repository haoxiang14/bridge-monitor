import { BRIDGES } from "./bridges";
import { checkAllBridges } from "./rpc";
import { checkNativeTokens } from "./cctp";
import { checkXStocks } from "./xstocks";
import { sendLarkAlert, sendXStocksLarkAlert } from "./lark";

export interface Env {
  LARK_WEBHOOK_URL?: string;
}

async function runMonitor(env: Env): Promise<{ bridgeAlerts: number; xstocksAlerts: number }> {
  const [bridgeResults, nativeTokens, xstocks] = await Promise.all([
    checkAllBridges(BRIDGES),
    checkNativeTokens(),
    checkXStocks(),
  ]);

  let bridgeAlertCount = 0;
  let xstocksAlertCount = 0;

  if (env.LARK_WEBHOOK_URL) {
    const bridgeAlerts = bridgeResults.filter((r) => r.status === "ALERT");
    for (const alert of bridgeAlerts) {
      await sendLarkAlert(env.LARK_WEBHOOK_URL, alert);
      bridgeAlertCount++;
    }

    const xstocksAlerts = xstocks.filter((xs) => {
      if (xs.status === "ERROR" || xs.circulating === null || xs.sharesHeld === null) return false;
      if (xs.circulating <= 0) return false;
      const reserve = (xs.sharesHeld / xs.circulating) * 100;
      return reserve < 100;
    });
    for (const alert of xstocksAlerts) {
      await sendXStocksLarkAlert(env.LARK_WEBHOOK_URL, alert);
      xstocksAlertCount++;
    }
  }

  return { bridgeAlerts: bridgeAlertCount, xstocksAlerts: xstocksAlertCount };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      });
    }

    const { bridgeAlerts, xstocksAlerts } = await runMonitor(env);

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        bridgeAlerts,
        xstocksAlerts,
        larkEnabled: !!env.LARK_WEBHOOK_URL,
      }),
      { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const { bridgeAlerts, xstocksAlerts } = await runMonitor(env);
    console.log(`[CRON] Done. Bridge alerts: ${bridgeAlerts}, xStocks alerts: ${xstocksAlerts}`);
  },
};
