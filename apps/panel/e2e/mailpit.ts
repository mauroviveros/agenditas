import type { APIRequestContext } from "@playwright/test";

const MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? "http://127.0.0.1:54324";
const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 500;

interface MailpitSearch {
  messages: { ID: string }[];
}

interface MailpitMessage {
  HTML: string;
}

// El mail de Auth cae en Mailpit local: se busca por destinatario y se saca el href.
export async function readMagicLink(
  request: APIRequestContext,
  email: string,
): Promise<string> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const search = await request.get(`${MAILPIT_URL}/api/v1/search`, {
      params: { query: `to:${email}` },
    });
    const { messages } = (await search.json()) as MailpitSearch;
    const first = messages[0];
    if (first) {
      const message = await request.get(
        `${MAILPIT_URL}/api/v1/message/${first.ID}`,
      );
      const { HTML } = (await message.json()) as MailpitMessage;
      const href = /href="([^"]+)"/.exec(HTML)?.[1];
      if (href) return href.replaceAll("&amp;", "&");
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`No llegó el mail a ${email} en Mailpit`);
}
