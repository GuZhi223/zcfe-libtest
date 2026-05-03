// ==UserScript==
// @name         答题测试助手
// @namespace    https://example.com/userscripts
// @version      1.0
// @description  适配三种学生自选页面风格（#tmNr/#tm、.right_part、.kuang-nr）的单选/多选题：支持内置/本地/远程题库自动答题，从"正确答案"自动学习写入本地题库，连续多题自动识别，含模糊匹配、多选逐点点击修复；悬浮窗左下角显示并可收起；剪贴板导出兼容 ScriptCat/Tampermonkey。
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  /** ================= 在此内置题库（占位符） ================= */
  const BUILTIN_BANK = {
  "目前我校图书馆馆藏纸质文献约多少册": {
    "type": "single",
    "answer": "C"
  },
  "我校图书馆由以下几部门组成": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "我馆馆藏面积是多少": {
    "type": "single",
    "answer": "C"
  },
  "郑州财经学院图书馆始建于哪年": {
    "type": "single",
    "answer": "B"
  },
  "某读者想看哲学类图书需要去几层": {
    "type": "single",
    "answer": "D"
  },
  "图书馆的正常开放时间是": {
    "type": "single",
    "answer": "A"
  },
  "某读者想看文学类图书需要到哪个书库": {
    "type": "single",
    "answer": "B"
  },
  "图书馆哪些书刊不能外借只能阅览": {
    "type": "multi",
    "answer": [
      "A",
      "C"
    ]
  },
  "读者阅览书刊时故意在上面涂画、撕毁行为是否要受到惩罚": {
    "type": "single",
    "answer": "B"
  },
  "在馆内上网能否随意观看不健康东西、发表反动言论吗": {
    "type": "single",
    "answer": "B"
  },
  "使用存包柜存放物品时可以过夜吗": {
    "type": "single",
    "answer": "B"
  },
  "图书馆图书污损、丢失需要赔偿吗": {
    "type": "single",
    "answer": "A"
  },
  "图书馆内可以大声喧哗、高声接打电话吗": {
    "type": "single",
    "answer": "B"
  },
  "为了保护图书不受污损图书馆内可以吃食物喝饮料吗": {
    "type": "single",
    "answer": "B"
  },
  "学生休学、退学、毕业等原因需要离校时是否要到图书馆清还所借图书": {
    "type": "single",
    "answer": "A"
  },
  "进入图书馆前可以把已经办理过借阅手续的图书带入馆内吗": {
    "type": "single",
    "answer": "A"
  },
  "在我校图书馆读者可以乘坐电梯吗": {
    "type": "single",
    "answer": "A"
  },
  "我校图书馆是否提供勤工俭学岗位": {
    "type": "single",
    "answer": "A"
  },
  "我校图书馆二楼和一楼是互通的吗": {
    "type": "single",
    "answer": "A"
  },
  "图书馆内、包括洗手间可以吸烟吗": {
    "type": "single",
    "answer": "B"
  },
  "当遇到火灾时要迅速向什么方向逃生": {
    "type": "single",
    "answer": "C"
  },
  "在图书馆捡到东西遗失东西应该到哪里处理": {
    "type": "multi",
    "answer": [
      "A",
      "B"
    ]
  },
  "图书馆借书的流程是": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "借阅归还图书时一定要确认成功信息无误后再离开对吗": {
    "type": "single",
    "answer": "A"
  },
  "我校在校读者每人同时可借多少册书": {
    "type": "single",
    "answer": "C"
  },
  "在检索平台上检索到图书以后点击书名会出现书目的详细信息请问在哪里可以看到这本书位于的书库和架位": {
    "type": "single",
    "answer": "A"
  },
  "我校在校读者每册书可借多少天": {
    "type": "single",
    "answer": "C"
  },
  "每册外借图书能在到期前续借吗": {
    "type": "single",
    "answer": "A"
  },
  "在校内检索图书、使用电子图书、电子期刊需要输入学号、密码登录图书馆主页吗": {
    "type": "single",
    "answer": "B"
  },
  "读者在假期能否借书寒暑假后再开学时借书会超期吗": {
    "type": "single",
    "answer": "A"
  },
  "在图书馆主页哪个位置可以检索图书": {
    "type": "single",
    "answer": "A"
  },
  "在图书馆图书检索平台输入读者学号、密码登录成功后怎样查看自己的借阅信息": {
    "type": "single",
    "answer": "B"
  },
  "在校外能否访问我馆的数据库": {
    "type": "single",
    "answer": "B"
  },
  "在校外可以访问图书馆的数字资源吗": {
    "type": "single",
    "answer": "B"
  },
  "有些图书附有光盘随书光盘可以下载吗": {
    "type": "single",
    "answer": "B"
  },
  "图书馆购买了哪些电子图书数据库": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "图书馆的数字资源包括哪些": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "以下数据库哪些是各专业通用学术型数据库": {
    "type": "multi",
    "answer": [
      "A",
      "B"
    ]
  },
  "我校图书馆的主页是tsg.zzife.edu.cn对吗": {
    "type": "single",
    "answer": "B"
  },
  "我校图书馆有朗读区吗": {
    "type": "single",
    "answer": "A"
  },
  "图书馆的微信公众号是zzcjxytsg你会关注吗": {
    "type": "single",
    "answer": "A"
  },
  "图书馆二楼大厅服务台提供以下哪些服务": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "我校图书馆发布的通知消息在哪里可以了解到": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "图书馆二楼提供哪些服务": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "向图书馆推荐新书的渠道有哪些": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C"
    ]
  },
  "目前我校图书馆E化区开放模式": {
    "type": "single",
    "answer": "B"
  },
  "图书馆提供的电源插座只供下列哪种电器使用": {
    "type": "multi",
    "answer": [
      "A",
      "B"
    ]
  },
  "图书馆内的所有座位可以占座吗": {
    "type": "single",
    "answer": "B"
  },
  "图书馆是学习公共场所下列哪些行为在图书馆内是不允许的": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "图书馆阅览室、书库、自修区等处桌椅能否随意挪动": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C",
      "D"
    ]
  },
  "进出图书馆对读者着装要求": {
    "type": "multi",
    "answer": [
      "A",
      "B",
      "C"
    ]
  },
  "我的一卡通丢失能否用别人的一卡通借书": {
    "type": "single",
    "answer": "A"
  },
  "我校图书馆存包柜是无偿使用的么": {
    "type": "single",
    "answer": "A"
  },
  "某学生读者9月1日借了一本书则最迟何时归还不算超期": {
    "type": "single",
    "answer": "C"
  },
  "逾期不还每本书每天罚款多少钱": {
    "type": "single",
    "answer": "B"
  }
};

  /** ================= 偏好设置 ================= */
  const PREFS = {
    autoAnswer: GM_getValue("autoAnswer", true),
    fuzzyThreshold: Number(GM_getValue("fuzzyThreshold", 0.5)),
    bankURL: GM_getValue("qaBankURL", ""),
    panelCollapsed: GM_getValue("panelCollapsed", false), // 悬浮窗是否收起
  };

  /** ================= 工具函数 ================= */

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // 通用剪贴板：navigator.clipboard -> GM_setClipboard -> GM.setClipboard -> textarea 兜底
  function copyTextToClipboard(text) {
    text = String(text ?? "");

    const fallbackAll = () => {
      if (typeof GM_setClipboard === "function") {
        try { GM_setClipboard(text); return; } catch (e) { console.error("GM_setClipboard failed:", e); }
      }
      if (typeof GM !== "undefined" && typeof GM.setClipboard === "function") {
        try { GM.setClipboard(text); return; } catch (e) { console.error("GM.setClipboard failed:", e); }
      }
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch (e) {
        console.error("textarea copy fallback failed:", e);
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.warn("navigator.clipboard.writeText failed, fallback:", err);
        fallbackAll();
      });
    } else {
      fallbackAll();
    }
  }

  function normalizeStem(raw) {
    if (!raw) return "";
    let s = String(raw)
      .replace(/[\s\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000\u200B]+/g, "")
      .replace(/【.*?】/g, "")
      .replace(/^[\d一二三四五六七八九十百千]+[.)、．]/, "")
      .replace(/[（(][ 　]*[)）]/g, "")
      .replace(/[“”"『』]/g, "")
      .replace(/[：:。！？!?，,；;…]/g, "")
      .trim();
    s = s.replace(/^[\d\.]+/, "");
    return s;
  }

  function fireEvents(el) {
    ["pointerdown","mousedown","click","input","change"].forEach(type => {
      try { el.dispatchEvent(new Event(type, { bubbles: true })); } catch {}
    });
  }

  function getBankLocal() {
    try { return JSON.parse(GM_getValue("qaBank", "{}")); } catch { return {}; }
  }
  function setBankLocal(obj) {
    GM_setValue("qaBank", JSON.stringify(obj || {}));
  }

  async function fetchRemoteBank() {
    const url = PREFS.bankURL;
    if (!url) return null;
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET", url, timeout: 15000,
        onload: (res) => { try { resolve(JSON.parse(res.responseText)); } catch { resolve(null); } },
        onerror: () => resolve(null),
        ontimeout: () => resolve(null),
      });
    });
  }

  function mergeBanks(...banks) {
    const out = {};
    for (const b of banks) {
      if (b && typeof b === "object") {
        for (const k of Object.keys(b)) out[k] = b[k];
      }
    }
    return out;
  }

  // 统一获取“题目根节点”：第三阶段 .kuang-nr / .right_part / #tmNr / #tm
  function getQuestionRoot() {
    const kuang = document.querySelector(".kuang-nr#tmNr");
    if (kuang) return kuang;
    const rp = document.querySelector(".right_part");
    if (rp) return rp;
    const tmNr = document.getElementById("tmNr");
    if (tmNr) return tmNr;
    const tm = document.getElementById("tm");
    if (tm) return tm;
    return null;
  }

  /** ================= UI 面板（左下 + 可收起） ================= */
  const panel = (() => {
    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed",
      left: "16px",
      right: "auto",
      bottom: "16px",
      zIndex: 999999,
      width: "340px",
      maxHeight: "62vh",
      overflow: "auto",
      background: "rgba(24,24,27,.95)",
      color: "#fff",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,.35)",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      fontSize: "13px",
      lineHeight: 1.5,
      padding: "8px 10px 6px",
      backdropFilter: "blur(6px)",
      boxSizing: "border-box",
    });

    box.innerHTML = `
      <div id="panelHeader" style="display:flex;align-items:center;justify-content:space-between;gap:6px;cursor:default;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;">
          <strong style="font-size:13px;white-space:nowrap;">答题测试助手</strong>
          <span style="font-size:11px;opacity:.7;white-space:nowrap;">ScriptCat</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <label id="autoToggleLabel" style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;white-space:nowrap;">
            <input id="autoToggle" type="checkbox" style="accent-color:#22c55e;transform:scale(.9);"> 自动
          </label>
          <button id="panelCollapseBtn"
            style="border:none;background:#111827;border-radius:999px;width:20px;height:20px;
                   display:flex;align-items:center;justify-content:center;
                   cursor:pointer;font-size:11px;line-height:1;color:#e5e7eb;">
            –
          </button>
        </div>
      </div>
      <div id="panelBody">
        <div style="margin-top:6px;display:flex;gap:8px;align-items:center;opacity:.85">
          <div>模糊阈值</div>
          <code id="fzVal" style="background:#111827;border:1px solid #27272a;border-radius:6px;padding:1px 6px;">${PREFS.fuzzyThreshold}</code>
        </div>
        <div id="stats" style="margin-top:8px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
          <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:6px 7px;">
            <div style="opacity:.7;font-size:11px;">命中</div><div id="hitCount" style="font-weight:700;font-size:14px;">0</div>
          </div>
          <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:6px 7px;">
            <div style="opacity:.7;font-size:11px;">未命中</div><div id="missCount" style="font-weight:700;font-size:14px;">0</div>
          </div>
          <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:6px 7px;">
            <div style="opacity:.7;font-size:11px;">疑似不一致</div><div id="diffCount" style="font-weight:700;font-size:14px;">0</div>
          </div>
        </div>
        <details style="margin-top:8px;">
          <summary style="cursor:pointer;opacity:.9;font-size:12px;">详情 / 命中方式 / 学习记录</summary>
          <div id="detailList" style="margin-top:6px;display:flex;flex-direction:column;gap:6px;"></div>
        </details>
      </div>
    `;

    document.documentElement.appendChild(box);
    const hitCount = box.querySelector("#hitCount");
    const missCount = box.querySelector("#missCount");
    const diffCount = box.querySelector("#diffCount");
    const detailList = box.querySelector("#detailList");
    const autoToggle = box.querySelector("#autoToggle");
    const autoToggleLabel = box.querySelector("#autoToggleLabel");
    const fzVal = box.querySelector("#fzVal");
    const panelBody = box.querySelector("#panelBody");
    const collapseBtn = box.querySelector("#panelCollapseBtn");
    const header = box.querySelector("#panelHeader");

    autoToggle.checked = !!PREFS.autoAnswer;
    autoToggle.addEventListener("change", () => {
      PREFS.autoAnswer = autoToggle.checked;
      GM_setValue("autoAnswer", PREFS.autoAnswer);
    });

    // 收起/展开逻辑
    function applyCollapsedState() {
      if (PREFS.panelCollapsed) {
        panelBody.style.display = "none";
        collapseBtn.textContent = "+";
        box.style.width = "150px";
        if (autoToggleLabel) autoToggleLabel.style.display = "none";
        header.style.cursor = "pointer"; // 收起时点击整条也能展开
      } else {
        panelBody.style.display = "block";
        collapseBtn.textContent = "–";
        box.style.width = "340px";
        if (autoToggleLabel) autoToggleLabel.style.display = "flex";
        header.style.cursor = "default";
      }
    }

    function toggleCollapsed() {
      PREFS.panelCollapsed = !PREFS.panelCollapsed;
      GM_setValue("panelCollapsed", PREFS.panelCollapsed);
      applyCollapsedState();
    }

    collapseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleCollapsed();
    });

    // 收起的时候，点整条 header 也能展开（避免按钮被挤得难点）
    header.addEventListener("click", () => {
      if (PREFS.panelCollapsed) {
        toggleCollapsed();
      }
    });

    applyCollapsedState();

    return {
      addDetail(type, stem, msg) {
        const tagColor =
          type === "miss" ? "#fb7185" :
          type === "diff" ? "#f59e0b" :
          type === "learn" ? "#38bdf8" :
          "#22c55e";
        const item = document.createElement("div");
        item.style.cssText = "border:1px solid #27272a;border-radius:8px;padding:8px;background:#111827;";
        item.innerHTML = `
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:9999px;background:${tagColor}"></span>
            <div style="font-weight:600;flex:1;word-break:break-all;font-size:12px;">${stem}</div>
          </div>
          <div style="opacity:.9;margin-top:6px;word-break:break-all;font-size:12px;">${msg}</div>
        `;
        detailList.appendChild(item);
      },
      setStats({ hit, miss, diff }) {
        hitCount.textContent = String(hit);
        missCount.textContent = String(miss);
        diffCount.textContent = String(diff);
      },
      refreshFuzzy() { fzVal.textContent = String(PREFS.fuzzyThreshold); },
      isAuto() { return !!PREFS.autoAnswer; },
    };
  })();

  /** ================= 菜单 ================= */

  GM_registerMenuCommand("导入题库（JSON）", async () => {
    const text = prompt("请粘贴题库 JSON：", "");
    if (!text) return;
    try {
      const data = JSON.parse(text);
      setBankLocal(data);
      alert("题库已导入，共 " + Object.keys(data).length + " 条。");
    } catch (e) { alert("JSON 解析失败：" + e.message); }
  });

  GM_registerMenuCommand("导出题库（本地存储）", () => {
    const data = getBankLocal();
    const text = JSON.stringify(data, null, 2);
    copyTextToClipboard(text);
    alert("已尝试复制到剪贴板（共 " + Object.keys(data).length + " 条）。");
  });

  GM_registerMenuCommand("设置题库 URL（远程）", () => {
    const cur = PREFS.bankURL;
    const url = prompt("填写题库 JSON 的直链 URL（留空取消）：", cur || "");
    if (url != null) {
      PREFS.bankURL = url.trim();
      GM_setValue("qaBankURL", PREFS.bankURL);
      alert("已保存题库 URL。刷新页面以尝试拉取。");
    }
  });

  GM_registerMenuCommand("启/停自动答题", () => {
    PREFS.autoAnswer = !PREFS.autoAnswer;
    GM_setValue("autoAnswer", PREFS.autoAnswer);
    alert("自动答题已" + (PREFS.autoAnswer ? "启用" : "停用"));
    location.reload();
  });

  GM_registerMenuCommand("设置模糊阈值 (0.3~0.8)", () => {
    const v = prompt("请输入模糊匹配阈值（建议 0.4~0.7）：", String(PREFS.fuzzyThreshold));
    if (v == null) return;
    const num = Number(v);
    if (isNaN(num) || num <= 0 || num >= 1) { alert("无效的阈值"); return; }
    PREFS.fuzzyThreshold = num;
    GM_setValue("fuzzyThreshold", num);
    panel.refreshFuzzy();
    alert("已设置阈值为 " + num);
  });

  GM_registerMenuCommand("调试：复制当前题规范化题干", () => {
    const q = parseCurrentQuestion();
    if (!q.normStem) { alert("未找到当前题。"); return; }
    copyTextToClipboard(q.normStem);
    alert("已尝试复制规范化题干：\n" + q.normStem);
  });

  GM_registerMenuCommand("用内置题库覆盖当前题库", () => {
    setBankLocal(BUILTIN_BANK);
    alert("已用内置题库覆盖本地存储。条目数：" + Object.keys(BUILTIN_BANK).length);
  });

  GM_registerMenuCommand("导出内置题库模板", () => {
    const text = JSON.stringify(BUILTIN_BANK, null, 2);
    copyTextToClipboard(text);
    alert("已尝试复制内置题库模板到剪贴板。");
  });

  /** ================= 匹配器（含模糊） ================= */

  function tokenizeForFuzzy(s) {
    return Array.from(new Set(
      s.split(/(的|是|与|和|及|于|对|在|为|把|下列|关于|哪些|那些|以下|正确|说法|内容|必须|基本|方略|治藏|新时代|馆藏|面积|宗教|社会|图书馆|部门|读者|图书|书库|楼层)/)
       .filter(x => x && x.length > 1)
    ));
  }

  function findRecordForStem(normStem, bank, threshold = 0.5) {
    if (bank[normStem]) return { key: normStem, record: bank[normStem], reason: "exact" };

    const keys = Object.keys(bank);
    if (!keys.length) return null;

    let hit = keys.find(k => k && (k.includes(normStem) || normStem.includes(k)));
    if (hit) return { key: hit, record: bank[hit], reason: "inclusive" };

    const stemTokens = tokenizeForFuzzy(normStem);
    let best = null, bestScore = 0;
    for (const k of keys) {
      const kt = tokenizeForFuzzy(k);
      const inter = kt.filter(t => stemTokens.includes(t)).length;
      const uni = new Set([...kt, ...stemTokens]).size || 1;
      const jacc = inter / uni;
      if (jacc > bestScore) { bestScore = jacc; best = k; }
    }
    if (best && bestScore >= threshold) {
      return { key: best, record: bank[best], reason: "fuzzy:"+bestScore.toFixed(2) };
    }
    return null;
  }

  /** ================= DOM 选择/解析 ================= */

  function getQuestionType() {
    const txid = (document.getElementById("txid") || {}).value || "";
    const root = getQuestionRoot();
    const spanTxt =
      root?.querySelector(".ti span")?.textContent ||
      root?.querySelector(".wt span")?.textContent ||
      document.getElementById("tmType")?.textContent ||
      "";
    const t = txid || spanTxt || "";
    if (/多选/.test(t)) return "multi";
    if (/单选/.test(t)) return "single";
    return "unknown";
  }

  function parseCurrentQuestion() {
    const root = getQuestionRoot();
    if (!root) return { rawStem: "", normStem: "", options: {}, type: "unknown", root: null };

    let rawStem = "";
    const stemNode =
      root.querySelector(".ti") ||
      root.querySelector(".wt") ||
      root.querySelector("#tm .ti") ||
      root.querySelector("#tm .wt") ||
      root.querySelector("#tm p") ||
      root.querySelector("p");

    if (stemNode) {
      rawStem = stemNode.textContent
        .replace(/^\s*([单双多]选题)\s*[：:]\s*/,"")
        .trim();
    }

    const normStem = normalizeStem(rawStem);

    const optionLabels = Array.from(root.querySelectorAll("label")).filter(lab =>
      lab.querySelector(".code") && lab.querySelector("input[name='options']")
    );
    const options = {};
    optionLabels.forEach((lab) => {
      const codeSpan = lab.querySelector(".code");
      const letter = codeSpan ? codeSpan.textContent.trim().toUpperCase() : "";
      if (!letter) return;
      const spans = Array.from(lab.querySelectorAll("span"))
        .filter(s => !s.classList.contains("code"))
        .map(s => s.textContent.replace("：","").trim());
      const text = spans.join("").trim();
      options[letter] = text;
    });

    return { rawStem, normStem, options, type: getQuestionType(), root };
  }

  function parseCorrectAnswer() {
    const el = document.getElementById("correctAns");
    if (!el) return { letters: [], from: "" };
    const txt = el.textContent || "";
    const letters = (txt.match(/[A-Z]/gi) || []).map(c => c.toUpperCase());
    return { letters, from: txt.trim() };
  }

  function pickSingle(root, answerLetter) {
    const letter = String(answerLetter || "").toUpperCase();
    const labels = Array.from(root.querySelectorAll("label")).filter(l =>
      l.querySelector(".code") && l.querySelector("input[type='radio'][name='options']")
    );

    for (const lab of labels) {
      const codeSpan = lab.querySelector(".code");
      const txt = codeSpan ? codeSpan.textContent.trim().toUpperCase() : "";
      if (txt === letter) {
        const inp = lab.querySelector('input[type="radio"][name="options"]');
        if (!inp) continue;
        lab.scrollIntoView({ block: "center", behavior: "instant" });
        try { inp.click(); } catch { lab.click(); }
        fireEvents(lab);
        lab.style.outline = "2px solid #22c55e";
        return true;
      }
    }
    return false;
  }

  async function pickMulti(root, answerLetters) {
    const need = new Set((answerLetters || []).map(x => (x || "").toUpperCase()));
    const inputs = Array.from(root.querySelectorAll('input[type="checkbox"][name="options"]'));
    if (!inputs.length) return false;
    let changed = false;

    const getLetterForInput = (inp) => {
      const lab = inp.closest("label");
      const codeSpan = lab?.querySelector(".code");
      const txt = codeSpan ? codeSpan.textContent.trim().toUpperCase() : "";
      return txt;
    };

    const toCheck   = inputs.filter(i => need.has(getLetterForInput(i)) && !i.checked);
    const toUncheck = inputs.filter(i => !need.has(getLetterForInput(i)) &&  i.checked);

    const clickInput = async (inp, highlight) => {
      const lab = inp.closest("label") || inp;
      try { inp.click(); } catch { lab.click(); }
      if (highlight) lab.style.outline = "2px solid #22c55e";
      await sleep(50);
    };

    for (const i of toCheck)   { await clickInput(i, true);  changed = true; }
    for (const i of toUncheck) { await clickInput(i, false); changed = true; }

    return changed;
  }

  /** ================= 自动学习正确答案 ================= */

  let lastLearnStid = null;

  function getCurrentStid() {
    const stidInput = document.getElementById("stid");
    return stidInput ? stidInput.value || null : null;
  }

  function learnCurrentQuestionFromPage() {
    const stid = getCurrentStid();
    if (stid && stid === lastLearnStid) return;

    const { rawStem, normStem, type: qType } = parseCurrentQuestion();
    if (!normStem) return;

    const { letters, from } = parseCorrectAnswer();
    if (!letters.length) return;

    let type = qType;
    if (!type || type === "unknown") {
      type = letters.length > 1 ? "multi" : "single";
    }
    const record = (type === "multi" || letters.length > 1)
      ? { type: "multi",  answer: Array.from(new Set(letters)).sort() }
      : { type: "single", answer: letters[0] };

    const local = getBankLocal();
    local[normStem] = record;
    setBankLocal(local);
    lastLearnStid = stid || normStem;

    panel.addDetail(
      "learn",
      rawStem || normStem,
      `已从页面正确答案学习（${from || "无显示文本"}）：` +
      (Array.isArray(record.answer) ? record.answer.join("、") : record.answer) +
      `。键为：${normStem}`
    );
  }

  function setupLearningHooks() {
    learnCurrentQuestionFromPage();

    const btnSubmit = document.getElementById("btnSubmit");
    if (btnSubmit) {
      btnSubmit.addEventListener("click", () => {
        setTimeout(() => learnCurrentQuestionFromPage(), 200);
      });
    }

    const btnNext = document.getElementById("qd");
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        learnCurrentQuestionFromPage();
      });
    }
  }

  /** ================= 连续多题自动答题 ================= */

  let ACTIVE_BANK = {};
  const stats = { hit: 0, miss: 0, diff: 0 };
  let lastQuestionKey = null;

  async function processCurrentQuestionOnce() {
    const q = parseCurrentQuestion();
    if (!q.root || !q.normStem) return;

    const stid = getCurrentStid();
    const qKey = stid || q.normStem;
    if (!qKey) return;

    if (qKey === lastQuestionKey) return;
    lastQuestionKey = qKey;

    const found = findRecordForStem(q.normStem, ACTIVE_BANK, PREFS.fuzzyThreshold);
    if (!found) {
      stats.miss++;
      panel.addDetail("miss", q.rawStem || q.normStem, "未在题库中找到当前题。");
      panel.setStats(stats);
      return;
    }

    const { record, key, reason } = found;
    if (!record || !record.type) {
      stats.diff++;
      panel.addDetail("diff", q.rawStem || q.normStem, `题库键「${key}」记录缺少 type 字段。`);
      panel.setStats(stats);
      return;
    }

    if (record.type === "single") {
      const ans = String(record.answer || "").toUpperCase();
      if (!/^[A-Z]$/.test(ans) || !(ans in q.options)) {
        stats.diff++;
        panel.addDetail("diff", q.rawStem || q.normStem, `题库键「${key}」答案「${ans}」无效或页面不存在该选项。`);
        panel.setStats(stats);
        return;
      }
      const ok = panel.isAuto() ? pickSingle(q.root, ans) : false;
      stats.hit++;
      if (!ok && panel.isAuto()) {
        panel.addDetail("hit", q.rawStem || q.normStem, `命中（${reason}，键：「${key}」），答案「${ans}」，但未能自动点击或被页面拦截。`);
      } else {
        panel.addDetail("hit", q.rawStem || q.normStem, `命中（${reason}，键：「${key}」），答案「${ans}」。`);
      }
      panel.setStats(stats);
      return;
    }

    if (record.type === "multi") {
      let ansArr = Array.isArray(record.answer) ? record.answer.map(s => String(s).toUpperCase()) : [];
      ansArr = Array.from(new Set(ansArr)).sort();
      if (!ansArr.length) {
        stats.diff++;
        panel.addDetail("diff", q.rawStem || q.normStem, `题库键「${key}」答案数组为空或无效。`);
        panel.setStats(stats);
        return;
      }
      const missing = ansArr.filter(x => !(x in q.options));
      if (missing.length) {
        stats.diff++;
        panel.addDetail("diff", q.rawStem || q.normStem, `题库键「${key}」中以下选项在页面不存在：${missing.join("、")}。`);
        panel.setStats(stats);
        return;
      }
      let ok = false;
      if (panel.isAuto()) ok = await pickMulti(q.root, ansArr);
      stats.hit++;
      if (panel.isAuto() && !ok) {
        panel.addDetail("hit", q.rawStem || q.normStem, `命中（${reason}，键：「${key}」），应选：${ansArr.join("、")}，但未能切换勾选。`);
      } else {
        panel.addDetail("hit", q.rawStem || q.normStem, `命中（${reason}，键：「${key}」），应选：${ansArr.join("、")}。`);
      }
      panel.setStats(stats);
      return;
    }

    stats.diff++;
    panel.addDetail("diff", q.rawStem || q.normStem, `题库键「${key}」类型为未知：${record.type}`);
    panel.setStats(stats);
  }

  /** ================= 主入口 ================= */

  (async function main() {
    await sleep(300);

    const local = getBankLocal();
    const remote = await fetchRemoteBank();
    const mergedRemote = (remote && typeof remote === "object") ? remote : null;
    ACTIVE_BANK = mergeBanks(BUILTIN_BANK, local, mergedRemote);

    panel.setStats(stats);
    setupLearningHooks();

    processCurrentQuestionOnce();

    setInterval(() => {
      processCurrentQuestionOnce();
    }, 300);
  })();
})();