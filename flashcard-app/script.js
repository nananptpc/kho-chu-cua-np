// Dữ liệu mẫu (bạn có thể thay bằng CSV sau)
const vocabulary = [
  { id: 1, word: "书", pinyin: "shū", pos: "danh từ", meaning: "sách", collocation: "看书 (đọc sách)", example: "我在看书。", topic: "Học tập", level: "HSK1", bishun: "4 nét", radical: "乛" },
  { id: 2, word: "桌子", pinyin: "zhuōzi", pos: "danh từ", meaning: "bàn", collocation: "擦桌子 (lau bàn)", example: "桌子上有书。", topic: "Đồ dùng", level: "HSK1" },
  { id: 3, word: "咖啡", pinyin: "kāfēi", pos: "danh từ", meaning: "cà phê", collocation: "喝咖啡", example: "我喜欢喝咖啡。", topic: "Đồ uống", level: "HSK1" },
  { id: 4, word: "水", pinyin: "shuǐ", pos: "danh từ", meaning: "nước", collocation: "喝水", example: "请给我一杯水。", topic: "Đồ uống", level: "HSK1" },
  { id: 5, word: "商店", pinyin: "shāngdiàn", pos: "danh từ", meaning: "cửa hàng", collocation: "去商店", example: "我去商店买东西。", topic: "Mua sắm", level: "HSK1" },
  { id: 6, word: "水果", pinyin: "shuǐguǒ", pos: "danh từ", meaning: "hoa quả", collocation: "吃水果", example: "多吃水果对身体好。", topic: "Thực phẩm", level: "HSK1" },
  { id: 7, word: "雨", pinyin: "yǔ", pos: "danh từ", meaning: "mưa", collocation: "下雨", example: "今天下雨了。", topic: "Thời tiết", level: "HSK1" },
  { id: 8, word: "电视", pinyin: "diànshì", pos: "danh từ", meaning: "tivi", collocation: "看电视", example: "他喜欢看电视。", topic: "Giải trí", level: "HSK1" },
  { id: 9, word: "开展业务", pinyin: "kāizhǎn yèwù", pos: "động từ", meaning: "tiến hành kinh doanh", collocation: "conduct business", example: "我们公司在亚洲开展业务。", topic: "Kinh doanh", level: "HSK3" }
];

let currentView = "grid";
let currentFilter = { level: "all", pos: "all", topic: "all" };
let flashcardIndex = 0;
let isFlipped = false;

// DOM elements
const contentArea = document.getElementById("contentArea");
const levelFilter = document.getElementById("levelFilter");
const posFilter = document.getElementById("posFilter");
const topicFilter = document.getElementById("topicFilter");
const clearBtn = document.getElementById("clearFilters");
const tabBtns = document.querySelectorAll(".tab-btn");

// Helper: lọc dữ liệu
function filterData() {
  return vocabulary.filter(item => {
    if (currentFilter.level !== "all" && item.level !== currentFilter.level) return false;
    if (currentFilter.pos !== "all" && item.pos !== currentFilter.pos) return false;
    if (currentFilter.topic !== "all" && item.topic !== currentFilter.topic) return false;
    return true;
  });
}

// Render theo view hiện tại
function render() {
  const filtered = filterData();
  if (currentView === "grid") renderGrid(filtered);
  else if (currentView === "flashcard") renderFlashcard(filtered);
  else if (currentView === "exercise") renderExercise(filtered);
}

// Grid view
function renderGrid(items) {
  if (items.length === 0) {
    contentArea.innerHTML = `<div class="empty-state">✨ Không có từ vựng phù hợp. Hãy thay đổi bộ lọc.</div>`;
    return;
  }
  let html = `<div class="grid-view">`;
  items.forEach(item => {
    html += `
      <div class="card-item">
        <div class="hanzi">${item.word}</div>
        <div class="pinyin">${item.pinyin}</div>
        <div class="pos">${item.pos}</div>
        <div class="collocations">📌 ${item.collocation}</div>
        <div class="example">📝 ${item.example}</div>
        <div class="meta">
          <span>🎯 ${item.level}</span>
          <span>🏷️ ${item.topic}</span>
          <button class="sound-mini" data-word="${item.word}">🔊</button>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  contentArea.innerHTML = html;
  // Gắn sự kiện phát âm
  document.querySelectorAll('.sound-mini').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakChinese(btn.getAttribute('data-word'));
    });
  });
}

// Flashcard view
let currentFlashcardList = [];
function renderFlashcard(items) {
  if (items.length === 0) {
    contentArea.innerHTML = `<div class="empty-state">✨ Không có từ nào để học.</div>`;
    return;
  }
  currentFlashcardList = items;
  flashcardIndex = 0;
  isFlipped = false;
  showFlashcard();
}

function showFlashcard() {
  if (!currentFlashcardList.length) return;
  const item = currentFlashcardList[flashcardIndex];
  const flipClass = isFlipped ? "flipped" : "";
  const html = `
    <div class="flashcard-view">
      <div class="flip-card ${flipClass}" id="flipCard">
        <div class="flip-card-inner">
          <div class="front">
            <div class="hanzi" style="font-size:3rem">${item.word}</div>
            <div class="pinyin">${item.pinyin}</div>
            <div class="pos">${item.pos}</div>
            <div style="margin-top:1rem">👆 Nhấn để lật</div>
          </div>
          <div class="back">
            <div><strong>📌 Collocations:</strong> ${item.collocation}</div>
            <div style="margin-top:0.8rem"><strong>📝 Ví dụ:</strong> ${item.example}</div>
            <div style="margin-top:0.5rem"><strong>🔍 Nghĩa:</strong> ${item.meaning}</div>
            <div style="margin-top:0.5rem"><strong>✍️ Chiết tự:</strong> ${item.radical || "chưa có"}</div>
            <div style="margin-top:0.3rem"><strong>🖌️ Bút thuận:</strong> ${item.bishun || "chưa cập nhật"}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-controls">
      <button class="sound-btn" id="speakBtn">🔊 Phát âm</button>
      <button class="sound-btn" id="prevBtn">◀ Trước</button>
      <button class="sound-btn" id="nextBtn">Sau ▶</button>
    </div>
  `;
  contentArea.innerHTML = html;

  document.getElementById("flipCard")?.addEventListener("click", () => {
    isFlipped = !isFlipped;
    showFlashcard();
  });
  document.getElementById("speakBtn")?.addEventListener("click", () => speakChinese(item.word));
  document.getElementById("prevBtn")?.addEventListener("click", () => {
    if (flashcardIndex > 0) flashcardIndex--;
    else flashcardIndex = currentFlashcardList.length - 1;
    isFlipped = false;
    showFlashcard();
  });
  document.getElementById("nextBtn")?.addEventListener("click", () => {
    flashcardIndex = (flashcardIndex + 1) % currentFlashcardList.length;
    isFlipped = false;
    showFlashcard();
  });
}

// Exercise placeholder
function renderExercise(items) {
  contentArea.innerHTML = `<div style="text-align:center; padding:3rem;">📖 Bài tập sẽ được phát triển: Quiz sau 7 từ, kéo thả, điền từ... (Sắp ra mắt)</div>`;
}

// Speak Chinese using Web Speech API
function speakChinese(text) {
  if (!window.speechSynthesis) {
    alert("Trình duyệt của bạn không hỗ trợ đọc giọng nói.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.8;
  window.speechSynthesis.cancel(); // tránh chồng âm
  window.speechSynthesis.speak(utterance);
}

// Event listeners cho filter
levelFilter.addEventListener("change", (e) => { currentFilter.level = e.target.value; render(); });
posFilter.addEventListener("change", (e) => { currentFilter.pos = e.target.value; render(); });
topicFilter.addEventListener("change", (e) => { currentFilter.topic = e.target.value; render(); });
clearBtn.addEventListener("click", () => {
  levelFilter.value = "all";
  posFilter.value = "all";
  topicFilter.value = "all";
  currentFilter = { level: "all", pos: "all", topic: "all" };
  render();
});
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentView = btn.getAttribute("data-view");
    render();
  });
});

// Khởi tạo lần đầu
render();
