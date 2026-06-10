import { ReconcileResult } from "./rpc.js";
import { XStocksResult } from "./xstocks.js";

const L1_EXPLORERS: Record<string, { name: string; url: string }> = {
  "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x470458C91978D2d929704489Ad730DC3E3001113": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x60af2681bcc4886935f428a1386a4a68973f7c4f": { name: "Etherscan", url: "https://etherscan.io/address/" },
  "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee": { name: "Etherscan", url: "https://etherscan.io/address/" },
};

const L2_EXPLORERS: Record<string, { name: string; url: string }> = {
  "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9": { name: "Mantlescan", url: "https://mantlescan.xyz/token/" },
  "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE": { name: "Mantlescan", url: "https://mantlescan.xyz/token/" },
  "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2": { name: "Mantlescan", url: "https://mantlescan.xyz/token/" },
  "0x2cfc85d8e48f8eab294be644d9e25c3030863003": { name: "Worldscan", url: "https://worldscan.org/token/" },
  "0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1": { name: "OP Etherscan", url: "https://optimistic.etherscan.io/token/" },
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": { name: "Polygonscan", url: "https://polygonscan.com/token/" },
  "4SoQ8UkWfeDH47T56PA53CZCeW4KytYCiU65CwBWoJUt": { name: "Solscan", url: "https://solscan.io/token/" },
};

function fmt(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export async function sendLarkAlert(
  webhookUrl: string,
  result: ReconcileResult
): Promise<boolean> {
  const l1 = L1_EXPLORERS[result.l1Lock] ?? { name: "Etherscan", url: "https://etherscan.io/address/" };
  const l2 = L2_EXPLORERS[result.l2Token] ?? { name: "Explorer", url: "https://etherscan.io/address/" };

  const card = {
    header: {
      template: "red",
      title: { tag: "plain_text", content: "Bridge Insolvency Alert" },
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Bridge**\n${result.bridge}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Token**\n${result.token}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Locked (L1)**\n${fmt(result.locked)}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Minted (L2)**\n${fmt(result.minted)}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Delta**\n${fmt(result.delta)}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Delta %**\n${result.deltaPct?.toFixed(4) ?? "—"}%` } },
        ],
      },
      { tag: "hr" },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: { tag: "plain_text", content: "View Dashboard" },
            type: "primary",
            multi_url: { url: "https://bridge-monitor-theta.vercel.app/" },
          },
          {
            tag: "button",
            text: { tag: "plain_text", content: result.bridge },
            type: "default",
            multi_url: { url: result.bridgeUrl },
          },
          {
            tag: "button",
            text: { tag: "plain_text", content: `${l1.name} (${result.token} Locked)` },
            type: "default",
            multi_url: { url: `${l1.url}${result.l1Lock}` },
          },
        ],
      },
      {
        tag: "div",
        text: {
          tag: "lark_md",
          content: "**Response Guide:**\n1. Open dashboard to verify alert details\n2. Check L1 locked balance on Etherscan\n3. Check L2 minted supply on chain explorer\n4. If confirmed, notify team lead immediately\n5. Escalate to bridge team if delta persists > 15 min",
        },
      },
      {
        tag: "note",
        elements: [{ tag: "plain_text", content: result.timestamp }],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "interactive", card }),
    });
    const json: any = await res.json();
    console.log(`[LARK] Bridge alert for ${result.bridge} ${result.token}: status=${res.status} code=${json.code} msg=${json.msg ?? json.StatusMessage}`);
    return json.code === 0;
  } catch (e) {
    console.error("[LARK] Error sending bridge alert:", e);
    return false;
  }
}

export async function sendXStocksLarkAlert(
  webhookUrl: string,
  result: XStocksResult
): Promise<boolean> {
  const circulating = result.porCirculating ?? result.circulating!;
  const reserve = circulating > 0
    ? ((result.sharesHeld! / circulating) * 100).toFixed(2)
    : "N/A";

  const card = {
    header: {
      template: "orange",
      title: { tag: "plain_text", content: "xStocks Under-Reserved Alert" },
    },
    elements: [
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Token**\n${result.symbol}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Underlying**\n${result.underlying}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Shares Held**\n${fmt(result.sharesHeld)}` } },
          { is_short: true, text: { tag: "lark_md", content: `**Circulating (PoR)**\n${fmt(circulating)}` } },
        ],
      },
      {
        tag: "div",
        fields: [
          { is_short: true, text: { tag: "lark_md", content: `**Reserve Ratio**\n${reserve}%` } },
          { is_short: true, text: { tag: "lark_md", content: `**Chains Queried**\n${result.successCount}/${result.chainCount}` } },
        ],
      },
      { tag: "hr" },
      {
        tag: "action",
        actions: [
          {
            tag: "button",
            text: { tag: "plain_text", content: "View Dashboard" },
            type: "primary",
            multi_url: { url: "https://bridge-monitor-theta.vercel.app/" },
          },
        ],
      },
      {
        tag: "div",
        text: {
          tag: "lark_md",
          content: "**Response Guide:**\n1. Open dashboard to verify reserve ratio\n2. Check on-chain circulating supply vs PoR API\n3. Verify if chain RPCs are healthy (TON/Tron failures can inflate circulating)\n4. If reserve genuinely < 100%, notify team lead\n5. Confirm shares held on broker matches PoR API",
        },
      },
      {
        tag: "note",
        elements: [{ tag: "plain_text", content: result.timestamp }],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg_type: "interactive", card }),
    });
    const json: any = await res.json();
    console.log(`[LARK] xStocks alert for ${result.symbol}: status=${res.status} code=${json.code} msg=${json.msg ?? json.StatusMessage}`);
    return json.code === 0;
  } catch (e) {
    console.error("[LARK] Error sending xStocks alert:", e);
    return false;
  }
}
