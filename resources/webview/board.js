(function () {
  const TILES = [
    "起点：牵手 10 秒",
    "对视 5 秒",
    "说一句今天最想夸对方的话",
    "拥抱 10 秒",
    "喝水一杯（交杯可自行约定）",
    "轻拍对方背 5 下",
    "分享一个小秘密",
    "挑战：学对方口头禅",
    "额头贴额头 5 秒",
    "十指相扣 15 秒",
    "互相倒一杯水",
    "说「我喜欢你」",
    "肩靠肩坐 20 秒",
    "猜拳赢的人提一个小要求",
    "挑战：一起深呼吸 3 次",
    "摸摸头",
    "回忆第一次聊天",
    "约定一个明天的小事",
    "击掌",
    "安静待在一起 15 秒",
    "说一个对方的优点",
    "碰碰拳头",
    "挑战：同步笑三声",
    "靠在对方肩膀",
    "认真道谢",
    "约定暗号",
    "牵手走两步（或比划）",
    "最后拥抱",
    "终点：今天也辛苦了"
  ];

  const state = {
    user: 0,
    ai: 0,
    turn: "user", // user | ai
  };

  const boardEl = document.getElementById("board");
  const logEl = document.getElementById("log");
  const turnEl = document.getElementById("turn");
  const posEl = document.getElementById("pos");

  function host() {
    return typeof FlightChessHost !== "undefined" ? FlightChessHost : null;
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    TILES.forEach((text, i) => {
      const div = document.createElement("div");
      div.className = "cell";
      if (i === 0) div.classList.add("start");
      if (i === TILES.length - 1) div.classList.add("end");
      if (state.user === i) div.classList.add("on-user");
      if (state.ai === i) div.classList.add("on-ai");
      div.innerHTML = `<span class="n">${i}</span>${text}`;
      boardEl.appendChild(div);
    });
    turnEl.textContent = "轮到：" + (state.turn === "user" ? "你" : "机");
    posEl.textContent = `你 ${state.user} · 机 ${state.ai}`;
  }

  function log(msg) {
    logEl.textContent = msg;
  }

  function land(who, pos) {
    const text = TILES[pos] || "";
    const roller = who === "user" ? "user" : "ai";
    log((who === "user" ? "你" : "机") + " 停在 " + pos + "：「" + text + "」");
    const h = host();
    if (h && typeof h.onTileLanded === "function") {
      try {
        h.onTileLanded({
          version: "love-lite",
          position: pos,
          roller: roller,
          text: text,
          save: snapshot(),
        });
      } catch (e) {}
    }
  }

  function snapshot() {
    return { user: state.user, ai: state.ai, turn: state.turn, v: 1 };
  }

  function rollFor(who) {
    const dice = 1 + Math.floor(Math.random() * 6);
    const key = who === "user" ? "user" : "ai";
    let next = state[key] + dice;
    if (next >= TILES.length) next = TILES.length - 1;
    state[key] = next;
    log((who === "user" ? "你" : "机") + " 掷出 " + dice + "，走到 " + next);
    renderBoard();
    land(who, next);
    state.turn = who === "user" ? "ai" : "user";
    turnEl.textContent = "轮到：" + (state.turn === "user" ? "你" : "机");
  }

  document.getElementById("btn-roll").onclick = function () {
    if (state.turn !== "user") {
      log("现在是机的回合，点「机掷」或让 AI 来");
      return;
    }
    rollFor("user");
  };
  document.getElementById("btn-ai").onclick = function () {
    if (state.turn !== "ai") {
      log("现在是你的回合");
      return;
    }
    rollFor("ai");
  };
  document.getElementById("btn-save").onclick = function () {
    const h = host();
    if (h && typeof h.saveProgress === "function") {
      try {
        h.saveProgress(snapshot());
        log("已请求宿主存档");
      } catch (e) {
        log("存档失败");
      }
    } else {
      try {
        localStorage.setItem("fc_lite", JSON.stringify(snapshot()));
        log("已存到 localStorage（无宿主时）");
      } catch (e) {
        log("存档失败");
      }
    }
  };
  document.getElementById("btn-load").onclick = function () {
    const h = host();
    let data = null;
    if (h && typeof h.loadProgress === "function") {
      try {
        const r = h.loadProgress();
        data = r && r.data ? r.data : r;
      } catch (e) {}
    }
    if (!data) {
      try {
        data = JSON.parse(localStorage.getItem("fc_lite") || "null");
      } catch (e) {}
    }
    if (!data) {
      log("没有存档");
      return;
    }
    state.user = data.user || 0;
    state.ai = data.ai || 0;
    state.turn = data.turn || "user";
    renderBoard();
    log("已读档");
  };

  renderBoard();
})();
