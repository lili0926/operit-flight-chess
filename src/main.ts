import flightChessScreen from "./ui/flight_chess/index.ui.js";

const ROUTE = "toolpkg:com.lili.flight_chess:ui:board";

export function registerToolPkg(): boolean {
  ToolPkg.registerUiRoute({
    id: "flight_chess",
    route: ROUTE,
    runtime: "compose_dsl",
    screen: flightChessScreen,
    params: {},
    keepAlive: true,
    title: {
      zh: "情侣飞行棋",
      en: "Flight Chess",
    },
  });

  ToolPkg.registerNavigationEntry({
    id: "flight_chess_sidebar",
    route: ROUTE,
    surface: "main_sidebar_plugins",
    title: {
      zh: "情侣飞行棋",
      en: "Flight Chess",
    },
    icon: Icons.SportsEsports,
    order: 150,
  });

  return true;
}
