export const FC_HOST_INTERFACE_NAME = "FlightChessHost";
export const FC_BASE_URL = "https://flightchess.local";
const FC_BASE_PREFIX = `${FC_BASE_URL}/`;

export const FC_ROUTES = {
  board: `${FC_BASE_URL}/board`,
} as const;

export const FC_RESOURCE_SPECS = {
  boardHtml: { key: "fc_board_html", outputName: "board.html" },
  boardCss: { key: "fc_board_css", outputName: "board.css" },
  boardJs: { key: "fc_board_js", outputName: "board.js" },
} as const;

export function resolveFcPathname(url: string): string | null {
  const trimmed = String(url || "").trim();
  if (!trimmed) return null;
  if (trimmed === FC_BASE_URL || trimmed === `${FC_BASE_URL}/`) return "/";
  if (!trimmed.startsWith(FC_BASE_PREFIX)) return null;
  try {
    const u = new URL(trimmed);
    return u.pathname || "/";
  } catch {
    return null;
  }
}

export function buildNoticeHtml(title: string, body: string): string {
  const t = String(title || "").replace(/</g, "&lt;");
  const b = String(body || "").replace(/</g, "&lt;");
  return `<!doctype html><html><body style="font-family:sans-serif;padding:24px;background:#1a1a2e;color:#eee">
  <h2>${t}</h2><p>${b}</p></body></html>`;
}
