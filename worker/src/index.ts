import { BRIDGES } from "./bridges.js";
import { checkAllBridges } from "./rpc.js";
import { checkNativeTokens } from "./cctp.js";
import { checkXStocks } from "./xstocks.js";
import { sendLarkAlert, sendXStocksLarkAlert } from "./lark.js";

async function main() {
  const larkUrl = process.env.LARK_WEBHOOK_URL;
  if (!larkUrl) {
    console.error("[WORKER] LARK_WEBHOOK_URL not set, exiting.");
    process.exit(1);
  }

  console.log(`[WORKER] Starting bridge monitor check at ${new Date().toISOString()}`);

  const [bridgeResults, nativeTokens, xstocks] = await Promise.all([
    checkAllBridges(BRIDGES),
    checkNativeTokens(),
    checkXStocks(),
  ]);

  // Bridge insolvency alerts
  const bridgeAlerts = bridgeResults.filter((r) => r.status === "ALERT");
  for (const alert of bridgeAlerts) {
    console.log(`[ALERT] Bridge insolvency: ${alert.bridge} ${alert.token} delta=${alert.delta}`);
    await sendLarkAlert(larkUrl, alert);
  }

  // xStocks reserve alerts (reserve < 100%)
  const xstocksAlerts = xstocks.filter((xs) => {
    if (xs.status === "ERROR" || xs.circulating === null || xs.sharesHeld === null) return false;
    if (xs.circulating <= 0) return false;
    const reserve = (xs.sharesHeld / xs.circulating) * 100;
    return reserve < 100;
  });
  for (const alert of xstocksAlerts) {
    const reserve = ((alert.sharesHeld! / alert.circulating!) * 100).toFixed(2);
    console.log(`[ALERT] xStocks under-reserved: ${alert.symbol} reserve=${reserve}%`);
    await sendXStocksLarkAlert(larkUrl, alert);
  }

  const totalAlerts = bridgeAlerts.length + xstocksAlerts.length;
  console.log(`[WORKER] Done. Bridges: ${bridgeResults.length} checked, ${bridgeAlerts.length} alerts. xStocks: ${xstocks.length} checked, ${xstocksAlerts.length} alerts.`);

  if (totalAlerts > 0) {
    console.log(`[WORKER] ${totalAlerts} alert(s) sent to Lark.`);
  }
}

main().catch((e) => {
  console.error("[WORKER] Fatal error:", e);
  process.exit(1);
});
