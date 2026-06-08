export interface Env {
  GITHUB_PAT: string;
}

async function triggerWorkflow(env: Env): Promise<{ status: number; body: string }> {
  const res = await fetch(
    "https://api.github.com/repos/haoxiang14/bridge-monitor/actions/workflows/monitor.yml/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "bridge-monitor-pinger",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref: "main" }),
    }
  );
  const body = await res.text();
  return { status: res.status, body };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const result = await triggerWorkflow(env);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const result = await triggerWorkflow(env);
    console.log(`[PINGER] Triggered workflow: status=${result.status}`);
  },
};
