# Operit 情侣飞行棋（ToolPkg 骨架）

基于 [Operit](https://github.com/AAswordman/Operit) 官方示例 `examples/dino_runner`（WebView 小游戏）结构，把情侣飞行棋做成可装进 Operit 的 **ToolPkg**。

## 当前状态

- ✅ 包结构、manifest、侧栏入口、WebView 资源位
- ✅ 内置**可玩简化棋盘**（一版 30 格恋爱向示例 + 掷骰/存档 bridge）
- ⏳ 完整九张图纸、与 beilyes 进度互通：可继续把 [player](https://github.com/lili0926/player) 页换进 `resources/webview/`

## 在 Operit 里怎么用

1. 安装/更新 **SandboxPackage_DEV**（见 Operit 插件教程）
2. 把本仓库放到开发目录，或打包成 `.toolpkg` 后导入  
   常见开发路径：`/sdcard/Download/Operit/dev_package/`
3. 编译（在能访问 Operit `examples/types` 的环境）：

```bash
# 若在 Operit 源码树旁开发，可把本项目放进 examples/ 旁并改 tsconfig typeRoots
npm exec tsc -p tsconfig.json
```

4. 在 Operit 侧栏插件中打开 **情侣飞行棋**

> 若暂时无法编译 TypeScript：可先用已提交的 `dist/` 尝试加载；仍失败则以 Operit 文档的 ToolPkg 调试章为准。

## 目录

```
manifest.json
src/main.ts
src/ui/flight_chess/index.ui.ts   # WebView 壳 + JS bridge
src/ui/flight_chess/page.ts       # 资源与虚拟路径
resources/webview/board.html|css|js
dist/                             # 编译输出
```

## Bridge（网页 → 宿主）

页面通过 `FlightChessHost` 调用：

| 方法 | 作用 |
|------|------|
| `onTileLanded(payload)` | 停格后通知宿主（可再写入聊天） |
| `saveProgress(snapshot)` | 存档 |
| `loadProgress()` | 读档 |

## 与独立 player 的关系

- GitHub 上的 [player](https://github.com/lili0926/player) 继续给全网当网页版
- 本仓库专注 **Operit 内** 体验；规则数据可逐步与 player 对齐

## License

MIT（骨架）；玩法内容请遵守你自己的分享范围。
