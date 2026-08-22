"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerToolPkg = void 0;
// NOTE: Operit 会按 ToolPkg 规范加载；完整 UI 模块请用 tsc 编译 src/ 后使用 dist。
// 此处占位保证包结构完整；开发时请在 Operit 类型环境下编译 index.ui.ts。
try {
  var flightChessScreen = require("./ui/flight_chess/index.ui.js").default;
} catch (e) {
  var flightChessScreen = null;
}
var ROUTE = "toolpkg:com.lili.flight_chess:ui:board";
function registerToolPkg() {
  if (typeof ToolPkg === "undefined") return false;
  if (flightChessScreen) {
    ToolPkg.registerUiRoute({
      id: "flight_chess",
      route: ROUTE,
      runtime: "compose_dsl",
      screen: flightChessScreen,
      params: {},
      keepAlive: true,
      title: { zh: "情侣飞行棋", en: "Flight Chess" },
    });
    ToolPkg.registerNavigationEntry({
      id: "flight_chess_sidebar",
      route: ROUTE,
      surface: "main_sidebar_plugins",
      title: { zh: "情侣飞行棋", en: "Flight Chess" },
      icon: typeof Icons !== "undefined" ? Icons.SportsEsports : undefined,
      order: 150,
    });
  }
  return true;
}
exports.registerToolPkg = registerToolPkg;
