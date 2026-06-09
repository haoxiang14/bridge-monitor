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

  let bridgeAlertCount = 0;
  let xstocksAlertCount = 0;

  // Bridge insolvency alerts
  const bridgeAlerts = bridgeResults.filter((r) => r.status === "ALERT");
  for (const alert of bridgeAlerts) {
    console.log(`[ALERT] Bridge insolvency: ${alert.bridge} ${alert.token} delta=${alert.delta}`);
    const ok = await sendLarkAlert(larkUrl, alert);
    if (ok) bridgeAlertCount++;
  }

  // xStocks reserve alerts — use PoR API's circulating (authoritative) to avoid
  // false positives from TON/chain RPC failures inflating on-chain circulating
  const xstocksAlerts = xstocks.filter((xs) => {
    if (xs.status === "ERROR" || xs.sharesHeld === null) return false;
    const circulating = xs.porCirculating ?? xs.circulating;
    if (circulating === null || circulating <= 0) return false;
    const reserve = (xs.sharesHeld / circulating) * 100;
    return reserve < 100;
  });
  for (const alert of xstocksAlerts) {
    const circulating = alert.porCirculating ?? alert.circulating!;
    const reserve = ((alert.sharesHeld! / circulating) * 100).toFixed(2);
    console.log(`[ALERT] xStocks under-reserved: ${alert.symbol} reserve=${reserve}% (using ${alert.porCirculating ? 'PoR' : 'on-chain'} circulating=${circulating.toFixed(2)})`);
    const ok = await sendXStocksLarkAlert(larkUrl, alert);
    if (ok) xstocksAlertCount++;
  }

  console.log(`[WORKER] Done. Bridges: ${bridgeResults.length} checked, ${bridgeAlertCount} alerts sent. xStocks: ${xstocks.length} checked, ${xstocksAlertCount} alerts sent.`);
}

main().catch((e) => {
  console.error("[WORKER] Fatal error:", e);
  process.exit(1);
});
