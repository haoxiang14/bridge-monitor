import { BRIDGES } from "./bridges";
import { checkAllBridges } from "./rpc";
import { checkNativeTokens } from "./cctp";
import { sendLarkAlert } from "./lark";

export interface Env {
  LARK_WEBHOOK_URL?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function handleReconcile(env: Env): Promise<Response> {
  const [results, nativeTokens] = await Promise.all([
    checkAllBridges(BRIDGES),
    checkNativeTokens(),
  ]);

  if (env.LARK_WEBHOOK_URL) {
    const alerts = results.filter((r) => r.status === "ALERT");
    for (const alert of alerts) {
      await sendLarkAlert(env.LARK_WEBHOOK_URL, alert);
    }
  }

  return new Response(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      larkEnabled: !!env.LARK_WEBHOOK_URL,
      results,
      nativeTokens,
    }),
    {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    }
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    return handleReconcile(env);
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const [results] = await Promise.all([
      checkAllBridges(BRIDGES),
      checkNativeTokens(),
    ]);

    if (env.LARK_WEBHOOK_URL) {
      const alerts = results.filter((r) => r.status === "ALERT");
      for (const alert of alerts) {
        await sendLarkAlert(env.LARK_WEBHOOK_URL, alert);
      }
    }
  },
};
