(() => {
  "use strict";

  const MAX_RANGE_SIZE = 100000; // 安全上限，避免使用者輸入超大範圍造成卡頓

  // ---------- DOM ----------
  const screens = {
    setup: document.getElementById("screen-setup"),
    round1: document.getElementById("screen-round1"),
    final: document.getElementById("screen-final"),
  };

  const rangeMinInput = document.getElementById("range-min");
  const rangeMaxInput = document.getElementById("range-max");
  const setupError = document.getElementById("setup-error");
  const btnStart = document.getElementById("btn-start");

  const videoRound1 = document.getElementById("video-round1");
  const overlayRound1 = document.getElementById("overlay-round1");
  const round1NumbersEl = document.getElementById("round1-numbers");
  const btnToFinal = document.getElementById("btn-to-final");

  const videoFinal = document.getElementById("video-final");
  const overlayFinal = document.getElementById("overlay-final");
  const winnerNumberEl = document.getElementById("winner-number");
  const btnReset = document.getElementById("btn-reset");

  const skipButtons = document.querySelectorAll(".skip-btn");

  // ---------- 狀態 ----------
  let round1Numbers = [];
  let finalWinner = null;

  // ---------- 工具函式 ----------

  /** 從 [min, max] 區間（含頭尾）不重複抽出 count 個整數 */
  function drawUniqueNumbers(min, max, count) {
    const pool = [];
    for (let i = min; i <= max; i++) pool.push(i);
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }

  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    screens[name].classList.add("active");
  }

  function resetVideo(video) {
    try {
      video.pause();
      video.currentTime = 0;
    } catch (e) {
      /* 忽略尚未載入時的錯誤 */
    }
  }

  function playVideo(video) {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        // 若瀏覽器阻擋自動播放（極少見，因為此處是使用者點擊觸發），
        // 顯示提示讓使用者可再次點擊畫面播放
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }

  // ---------- 第一階段：輸入範圍 → 開始抽獎 ----------

  function validateRange() {
    const min = parseInt(rangeMinInput.value, 10);
    const max = parseInt(rangeMaxInput.value, 10);

    if (Number.isNaN(min) || Number.isNaN(max)) {
      return { ok: false, msg: "請輸入有效的號碼範圍" };
    }
    if (min > max) {
      return { ok: false, msg: "最小號碼不可大於最大號碼" };
    }
    const size = max - min + 1;
    if (size < 5) {
      return { ok: false, msg: "號碼範圍至少需要 5 個號碼才能抽出五強" };
    }
    if (size > MAX_RANGE_SIZE) {
      return { ok: false, msg: `號碼範圍過大，請輸入 ${MAX_RANGE_SIZE} 個號碼以內的範圍` };
    }
    return { ok: true, min, max };
  }

  btnStart.addEventListener("click", () => {
    const result = validateRange();
    if (!result.ok) {
      setupError.textContent = result.msg;
      return;
    }
    setupError.textContent = "";

    round1Numbers = drawUniqueNumbers(result.min, result.max, 5);
    finalWinner = null;

    // 重置畫面狀態
    overlayRound1.classList.remove("show");
    round1NumbersEl.innerHTML = "";
    resetVideo(videoRound1);

    showScreen("round1");
    playVideo(videoRound1);

    // 第一階段影片播放的這段時間，順便在背景預先緩衝最終決戰影片，
    // 避免兩支影片一開始就搶頻寬，造成播放卡頓
    preloadFinalVideo();
  });

  let finalVideoPreloadStarted = false;
  function preloadFinalVideo() {
    if (finalVideoPreloadStarted) return;
    finalVideoPreloadStarted = true;
    videoFinal.setAttribute("preload", "auto");
    videoFinal.load();
  }

  // ---------- 第一階段影片播完 → 顯示五強號碼 ----------

  videoRound1.addEventListener("ended", () => {
    revealRound1Numbers();
  });

  function revealRound1Numbers() {
    round1NumbersEl.innerHTML = "";
    round1Numbers.forEach((num, idx) => {
      const card = document.createElement("div");
      card.className = "number-card";
      card.textContent = String(num).padStart(2, "0");
      round1NumbersEl.appendChild(card);
      // 依序跳出動畫
      setTimeout(() => card.classList.add("in"), 150 + idx * 180);
    });
    overlayRound1.classList.add("show");
  }

  // ---------- 進入最終決戰 ----------

  btnToFinal.addEventListener("click", () => {
    finalWinner = round1Numbers[Math.floor(Math.random() * round1Numbers.length)];

    overlayFinal.classList.remove("show");
    winnerNumberEl.classList.remove("in");
    winnerNumberEl.textContent = "--";
    resetVideo(videoFinal);

    showScreen("final");
    playVideo(videoFinal);
  });

  // ---------- 最終決戰影片播完 → 顯示最終得主 ----------

  videoFinal.addEventListener("ended", () => {
    revealFinalWinner();
  });

  function revealFinalWinner() {
    winnerNumberEl.textContent = String(finalWinner).padStart(2, "0");
    overlayFinal.classList.add("show");
    requestAnimationFrame(() => {
      winnerNumberEl.classList.add("in");
    });
  }

  // ---------- 重新開始 ----------

  btnReset.addEventListener("click", () => {
    round1Numbers = [];
    finalWinner = null;
    overlayRound1.classList.remove("show");
    overlayFinal.classList.remove("show");
    round1NumbersEl.innerHTML = "";
    winnerNumberEl.classList.remove("in");
    winnerNumberEl.textContent = "--";
    resetVideo(videoRound1);
    resetVideo(videoFinal);
    setupError.textContent = "";
    showScreen("setup");
  });

  // ---------- 跳過影片（活動現場備用，避免影片載入異常卡住流程） ----------

  skipButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.skip;
      if (target === "round1") {
        videoRound1.pause();
        revealRound1Numbers();
      } else if (target === "final") {
        videoFinal.pause();
        revealFinalWinner();
      }
    });
  });

  // ---------- Enter 鍵送出首頁表單 ----------
  [rangeMinInput, rangeMaxInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") btnStart.click();
    });
  });
})();
