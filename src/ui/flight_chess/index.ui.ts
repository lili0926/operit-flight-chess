import type {
  ComposeDslContext,
  ComposeNode,
  ComposeWebViewNavigationDecision,
  ComposeWebViewNavigationRequest,
  ComposeWebViewResourceDecision,
  ComposeWebViewResourceRequest,
} from "../../../types/compose-dsl";
import {
  FC_BASE_URL,
  FC_HOST_INTERFACE_NAME,
  FC_RESOURCE_SPECS,
  FC_ROUTES,
  buildNoticeHtml,
  resolveFcPathname,
} from "./page.js";

type JsonRecord = Record<string, unknown>;

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function unwrapBridgePayload(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function buildFileResponse(
  mimeType: string,
  filePath: string
): ComposeWebViewResourceDecision {
  return {
    action: "respond" as const,
    response: {
      mimeType,
      encoding: "UTF-8",
      statusCode: 200,
      reasonPhrase: "OK",
      headers: { "Cache-Control": "no-store" },
      filePath,
    },
  };
}

function buildTextResponse(
  mimeType: string,
  text: string,
  statusCode = 200
): ComposeWebViewResourceDecision {
  return {
    action: "respond" as const,
    response: {
      mimeType,
      encoding: "UTF-8",
      statusCode,
      reasonPhrase: statusCode === 200 ? "OK" : "Error",
      headers: { "Cache-Control": "no-store" },
      text,
    },
  };
}

export default function Screen(ctx: ComposeDslContext): ComposeNode {
  const [resourcesReady, setResourcesReady] = ctx.useState(false);
  const [resourceError, setResourceError] = ctx.useState("");
  const [htmlPath, setHtmlPath] = ctx.useState("");
  const [cssPath, setCssPath] = ctx.useState("");
  const [jsPath, setJsPath] = ctx.useState("");
  const [statusLine, setStatusLine] = ctx.useState("准备棋盘…");
  const [lastTile, setLastTile] = ctx.useState("");
  const [webController, setWebController] = ctx.useState<any>(null);
  const [booted, setBooted] = ctx.useState(false);

  const savedRef = ctx.useRef<string>("");

  function registerJavascriptInterface(controller: any) {
    if (!controller || typeof controller.addJavascriptInterface !== "function") {
      return;
    }
    const host = {
      onTileLanded: (...args: unknown[]) => {
        const payload = asRecord(unwrapBridgePayload(args[0]));
        const text = toText(payload.text) || `停在第 ${payload.position} 格`;
        setLastTile(text);
        setStatusLine(
          `${toText(payload.roller) || "玩家"} · 第 ${payload.position} 格`
        );
        return { ok: true, receivedAt: new Date().toISOString() };
      },
      saveProgress: (...args: unknown[]) => {
        const payload = unwrapBridgePayload(args[0]);
        try {
          savedRef.current = JSON.stringify(payload ?? {});
        } catch {
          savedRef.current = "";
        }
        setStatusLine("进度已保存");
        return { ok: true };
      },
      loadProgress: () => {
        if (!savedRef.current) return { ok: false, data: null };
        try {
          return { ok: true, data: JSON.parse(savedRef.current) };
        } catch {
          return { ok: false, data: null };
        }
      },
    };
    controller.addJavascriptInterface(FC_HOST_INTERFACE_NAME, host);
  }

  async function boot(): Promise<void> {
    if (booted) return;
    setBooted(true);
    try {
      const [html, css, js] = await Promise.all([
        ToolPkg.readResource(
          FC_RESOURCE_SPECS.boardHtml.key,
          FC_RESOURCE_SPECS.boardHtml.outputName
        ),
        ToolPkg.readResource(
          FC_RESOURCE_SPECS.boardCss.key,
          FC_RESOURCE_SPECS.boardCss.outputName
        ),
        ToolPkg.readResource(
          FC_RESOURCE_SPECS.boardJs.key,
          FC_RESOURCE_SPECS.boardJs.outputName
        ),
      ]);
      const h = toText(html);
      const c = toText(css);
      const j = toText(js);
      if (!h || !c || !j) {
        setResourceError("棋盘资源未完整装载");
        return;
      }
      setHtmlPath(h);
      setCssPath(c);
      setJsPath(j);
      setResourcesReady(true);
      setStatusLine("棋盘就绪");
    } catch (e) {
      setResourceError(String(e || "boot failed"));
    }
  }

  ctx.useEffect(() => {
    boot();
  }, []);

  function handleNavigation(
    request: ComposeWebViewNavigationRequest
  ): ComposeWebViewNavigationDecision {
    const url = toText((request as any)?.url);
    if (url.startsWith(FC_BASE_URL)) {
      return { action: "allow" as const };
    }
    return { action: "block" as const };
  }

  function handleResource(
    request: ComposeWebViewResourceRequest
  ): ComposeWebViewResourceDecision {
    const url = toText((request as any)?.url);
    const path = resolveFcPathname(url) || "";
    if (path === "/" || path === "/board" || path.endsWith("board.html")) {
      if (htmlPath) return buildFileResponse("text/html", htmlPath);
      return buildTextResponse(
        "text/html",
        buildNoticeHtml("加载中", "board.html 尚未就绪")
      );
    }
    if (path.endsWith("board.css") || path === "/board.css") {
      if (cssPath) return buildFileResponse("text/css", cssPath);
    }
    if (path.endsWith("board.js") || path === "/board.js") {
      if (jsPath) return buildFileResponse("application/javascript", jsPath);
    }
    return buildTextResponse(
      "text/html",
      buildNoticeHtml("未找到", url),
      404
    );
  }

  function onControllerReady(controller: any) {
    setWebController(controller);
    registerJavascriptInterface(controller);
    try {
      if (controller && typeof controller.loadUrl === "function") {
        controller.loadUrl(FC_ROUTES.board);
      }
    } catch (_) {}
  }

  if (resourceError) {
    return UI.Column(
      { modifier: Modifier.fillMaxSize().padding(24), verticalArrangement: "center" },
      UI.Text({ text: "加载失败", style: "titleMedium", color: "#FF8A80" }),
      UI.Text({ text: resourceError, style: "bodyMedium", color: "#EEE" })
    );
  }

  if (!resourcesReady) {
    return UI.Column(
      { modifier: Modifier.fillMaxSize().padding(24), verticalArrangement: "center" },
      UI.Text({ text: "正在装载棋盘…", style: "titleMedium", color: "#EEE" })
    );
  }

  return UI.Column(
    { modifier: Modifier.fillMaxSize() },
    UI.Row(
      {
        modifier: Modifier.fillMaxWidth().padding(12),
        horizontalArrangement: "spaceBetween",
        verticalAlignment: "center",
      },
      UI.Text({ text: "情侣飞行棋", style: "titleSmall", color: "#F5F5F5" }),
      UI.Text({ text: statusLine, style: "labelSmall", color: "#B0BEC5" })
    ),
    lastTile
      ? UI.Text({
          text: lastTile,
          style: "bodySmall",
          color: "#FFE082",
          modifier: Modifier.padding({ horizontal: 12, bottom: 8 }),
        })
      : UI.Spacer({ height: 0 }),
    UI.AndroidView({
      factory: "webview",
      modifier: Modifier.fillMaxSize().weight(1),
      update: (controller: any) => {
        if (controller && controller !== webController) {
          onControllerReady(controller);
        }
      },
      props: {
        onNavigationRequest: handleNavigation,
        onResourceRequest: handleResource,
        javaScriptEnabled: true,
        domStorageEnabled: true,
      },
    } as any)
  );
}
