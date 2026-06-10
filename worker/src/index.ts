import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { BRIDGES } from "./bridges.js";
import { checkAllBridges } from "./rpc.js";
import { checkNativeTokens } from "./cctp.js";
import { checkXStocks } from "./xstocks.js";
import { sendLarkAlert, sendXStocksLarkAlert, sendNativeTokenLarkAlert } from "./lark.js";

const STATE_FILE = ".cache/last-supply.json";
const SUPPLY_SPIKE_THRESHOLD = 10; // alert if supply increases > 10%

interface SupplyState {
  [symbol: string]: number;
}

function loadLastSupply(): SupplyState {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveLastSupply(state: SupplyState): void {
  try {
    mkdirSync(".cache", { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(state));
  } catch (e) {
    console.error("[WORKER] Failed to save supply state:", e);
  }
}

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
  let nativeAlertCount = 0;

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

  // Native token supply spike alerts — compare with last run
  const lastSupply = loadLastSupply();
  const currentSupply: SupplyState = {};

  for (const nt of nativeTokens) {
    if (nt.totalSupply === null || nt.status === "ERROR") continue;
    currentSupply[nt.symbol] = nt.totalSupply;

    const prev = lastSupply[nt.symbol];
    if (prev && prev > 0) {
      const changePct = ((nt.totalSupply - prev) / prev) * 100;
      console.log(`[NATIVE] ${nt.symbol}: prev=${prev.toFixed(0)} current=${nt.totalSupply.toFixed(0)} change=${changePct.toFixed(2)}%`);
      if (changePct > SUPPLY_SPIKE_THRESHOLD) {
        console.log(`[ALERT] Native token supply spike: ${nt.symbol} +${changePct.toFixed(2)}%`);
        const ok = await sendNativeTokenLarkAlert(larkUrl, nt, prev, changePct);
        if (ok) nativeAlertCount++;
      }
    } else {
      console.log(`[NATIVE] ${nt.symbol}: first run, recording baseline=${nt.totalSupply.toFixed(0)}`);
    }
  }

  saveLastSupply(currentSupply);

  console.log(`[WORKER] Done. Bridges: ${bridgeResults.length} checked, ${bridgeAlertCount} alerts. xStocks: ${xstocks.length} checked, ${xstocksAlertCount} alerts. Native: ${nativeTokens.length} checked, ${nativeAlertCount} alerts.`);
}

main().catch((e) => {
  console.error("[WORKER] Fatal error:", e);
  process.exit(1);
});
