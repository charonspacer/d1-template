import { renderHtml } from "./renderHtml";

export class AgentCore {
  state: DurableObjectState;
  env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Read agent memory
    if (url.pathname === "/state") {
      const memory = await this.state.storage.get("memory") || {};
      return new Response(JSON.stringify(memory), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }

    // Update agent memory
    if (url.pathname === "/update") {
      const body = await request.json();
      await this.state.storage.put("memory", body);
      return new Response("ok");
    }

    return new Response("AgentCore online");
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route: /agent/<id>/...
    if (url.pathname.startsWith("/agent/")) {
      const id = url.pathname.split("/")[2];
      const stub = env.AGENT_CORE.get(env.AGENT_CORE.idFromName(id));
      return stub.fetch(request);
    }

    // Default route: show D1 example
    const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: { "content-type": "text/html
