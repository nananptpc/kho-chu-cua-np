let masterVocabulary = [];
let filteredVocabulary = [];
let currentView = "grid";
let flashcardIndex = 0;
let isFlipped = false;

const contentArea = document.getElementById("contentArea");
const gridBtn = document.getElementById("gridViewBtn");
const flashcardBtn = document.getElementById("flashcardViewBtn");
const filterHsk = document.getElementById("filterHsk");
const filterType = document.getElementById("filterType");
const filterTheme = document.getElementById("filterTheme");
const resetBtn = document.getElementById("resetFiltersBtn");

function loadCSVAndInit() {
    Papa.parse("vocabulary.csv", {
        download: true,
        header: true,
        encoding: "UTF-8",
        skipEmptyLines: true,
        complete: function(results) {
            if(results.data && results.data.length > 0) {
                masterVocabulary = results.data.map(row => ({
                    word: row.word?.trim() || "",
                    pinyin: row.pinyin?.trim() || "",
                    meaning: row.meaning?.trim() || "",
                    type: row.type?.trim() || "Từ vựng",
                    theme: row.theme?.trim() || "Chung",
                    hsk: row.hsk?.trim() || "HSK 1",
                    image_url: row.image_url?.trim() || ""
                })).filter(item => item.word !== "");
                if(masterVocabulary.length === 0) useSampleData();
            } else {
                useSampleData();
            }
            initFilters();
            applyFiltersAndRender();
        },
        error: function(err) {
            console.warn("Không đọc được CSV, dùng dữ liệu mẫu:", err);
            useSampleData();
            initFilters();
            applyFiltersAndRender();
        }
    });
}

function useSampleData() {
    masterVocabulary = [
        { word: "书", pinyin: "shū", meaning: "sách", type: "danh từ", theme: "Học tập", hsk: "HSK 1", image_url: "" },
        { word: "桌子", pinyin: "zhuōzi", meaning: "bàn", type: "danh từ", theme: "Đồ dùng", hsk: "HSK 1", image_url: "" },
        { word: "咖啡", pinyin: "kāfēi", meaning: "cà phê", type: "danh từ", theme: "Đồ uống", hsk: "HSK 1", image_url: "" },
        { word: "水", pinyin: "shuǐ", meaning: "nước", type: "danh từ", theme: "Đồ uống", hsk: "HSK 1", image_url: "" },
        { word: "商店", pinyin: "shāngdiàn", meaning: "cửa hàng", type: "danh từ", theme: "Địa điểm", hsk: "HSK 2", image_url: "" },
        { word: "水果", pinyin: "shuǐguǒ", meaning: "hoa quả", type: "danh từ", theme: "Thực phẩm", hsk: "HSK 1", image_url: "" },
        { word: "雨", pinyin: "yǔ", meaning: "mưa", type: "danh từ", theme: "Thời tiết", hsk: "HSK 1", image_url: "" },
        { word: "电视", pinyin: "diànshì", meaning: "tivi", type: "danh từ", theme: "Đồ dùng", hsk: "HSK 2", image_url: "" },
        { word: "热", pinyin: "rè", meaning: "nóng", type: "tính từ", theme: "Cảm giác", hsk: "HSK 2", image_url: "" },
        { word: "高兴", pinyin: "gāoxìng", meaning: "vui vẻ", type: "tính từ", theme: "Cảm xúc", hsk: "HSK 2", image_url: "" }
    ];
}

function initFilters() {
    const hskSet = new Set(masterVocabulary.map(v => v.hsk).filter(Boolean));
    const typeSet = new Set(masterVocabulary.map(v => v.type).filter(Boolean));
    const themeSet = new Set(masterVocabulary.map(v => v.theme).filter(Boolean));
    
    populateSelect(filterHsk, ["Tất cả HSK", ...Array.from(hskSet).sort()]);
    populateSelect(filterType, ["Tất cả từ loại", ...Array.from(typeSet).sort()]);
    populateSelect(filterTheme, ["Tất cả chủ đề", ...Array.from(themeSet).sort()]);
}

function populateSelect(selectElement, optionsArray) {
    selectElement.innerHTML = "";
    optionsArray.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        selectElement.appendChild(option);
    });
}

function applyFiltersAndRender() {
    const selectedHsk = filterHsk.value;
    const selectedType = filterType.value;
    const selectedTheme = filterTheme.value;
    
    filteredVocabulary = masterVocabulary.filter(item => {
        if (selectedHsk !== "Tất cả HSK" && item.hsk !== selectedHsk) return false;
        if (selectedType !== "Tất cả từ loại" && item.type !== selectedType) return false;
        if (selectedTheme !== "Tất cả chủ đề" && item.theme !== selectedTheme) return false;
        return true;
    });
    flashcardIndex = 0;
    isFlipped = false;
    renderCurrentView();
}

function renderCurrentView() {
    if (currentView === "grid") {
        renderGridView();
    } else {
        renderFlashcardView();
    }
}

function renderGridView() {
    if (!filteredVocabulary.length) {
        contentArea.innerHTML = `<div class="loading-message">🌸 Chưa có từ nào phù hợp với bộ lọc 🌸</div>`;
        return;
    }
    let html = `<div class="vocab-grid">`;
    filteredVocabulary.forEach(v => {
        const imageHtml = v.image_url ? `<img src="${v.image_url}" style="max-width:60px; max-height:60px; object-fit:contain;">` : (v.word?.charAt(0) || "📖");
        html += `
            <div class="word-card" onclick="speakWord('${v.word}')">
                <div class="card-img">${imageHtml}</div>
                <div class="card-info">
                    <div class="hanzi">${v.word}</div>
                    <div class="pinyin">${v.pinyin}</div>
                    <div class="word-type">${v.type}</div>
                    <div class="meaning">✨ ${v.meaning}</div>
                    <div class="theme-badge">${v.theme} · ${v.hsk}</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    contentArea.innerHTML = html;
}

function renderFlashcardView() {
    if (!filteredVocabulary.length) {
        contentArea.innerHTML = `<div class="loading-message">🌸 Không có thẻ nào, hãy thay đổi bộ lọc 🌸</div>`;
        return;
    }
    if (flashcardIndex >= filteredVocabulary.length) flashcardIndex = 0;
    const word = filteredVocabulary[flashcardIndex];
    const total = filteredVocabulary.length;
    let cardInner = '';
    if (!isFlipped) {
        cardInner = `
            <div class="flashcard-front">
                <div class="front-emoji" style="font-size:3rem;">${word.image_url ? `<img src="${word.image_url}" style="width:80px;">` : '🌸'}</div>
                <div class="front-han">${word.word}</div>
                <div class="front-pinyin">${word.pinyin}</div>
                <div class="word-type" style="margin-top:12px;">${word.type}  ·  ${word.hsk}</div>
                <div class="flip-hint" style="margin-top:1rem; font-size:0.7rem;">👉 Nhấn vào thẻ để xem nghĩa</div>
            </div>
        `;
    } else {
        cardInner = `
            <div class="flashcard-back">
                <div class="back-meaning">${word.meaning}</div>
                <div class="back-desc" style="margin-top:12px;">📚 Chủ đề: ${word.theme}</div>
                <div style="margin-top:1rem; font-size:0.75rem;">🔊 Bấm vào thẻ để nghe phát âm</div>
            </div>
        `;
    }
    const flashHtml = `
        <div class="flashcard-mode">
            <div class="progress-text" style="text-align:center; margin-bottom:12px;">${flashcardIndex+1} / ${total}  •  ${word.theme}</div>
            <div class="flashcard" id="flashcardCore">
                ${cardInner}
            </div>
            <div class="flashcard-nav">
                <button id="prevFlashBtn">◀ Trước</button>
                <button id="nextFlashBtn">Sau ▶</button>
            </div>
            <div style="text-align:center; margin-top:10px;"><small>💖 Học chủ động - Nhớ lâu hơn</small></div>
        </div>
    `;
    contentArea.innerHTML = flashHtml;
    const flashDiv = document.getElementById("flashcardCore");
    if(flashDiv) {
        flashDiv.addEventListener("click", () => {
            isFlipped = !isFlipped;
            renderFlashcardView();
        });
    }
    document.getElementById("prevFlashBtn")?.addEventListener("click", () => {
        if(filteredVocabulary.length === 0) return;
        flashcardIndex = (flashcardIndex - 1 + filteredVocabulary.length) % filteredVocabulary.length;
        isFlipped = false;
        renderFlashcardView();
    });
    document.getElementById("nextFlashBtn")?.addEventListener("click", () => {
        if(filteredVocabulary.length === 0) return;
        flashcardIndex = (flashcardIndex + 1) % filteredVocabulary.length;
        isFlipped = false;
        renderFlashcardView();
    });
}

window.speakWord = function(wordText) {
    if(!wordText) return;
    const utterance = new SpeechSynthesisUtterance(wordText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
};

gridBtn.addEventListener("click", () => {
    currentView = "grid";
    gridBtn.classList.add("active");
    flashcardBtn.classList.remove("active");
    renderCurrentView();
});
flashcardBtn.addEventListener("click", () => {
    currentView = "flashcard";
    flashcardBtn.classList.add("active");
    gridBtn.classList.remove("active");
    renderCurrentView();
});
filterHsk.addEventListener("change", applyFiltersAndRender);
filterType.addEventListener("change", applyFiltersAndRender);
filterTheme.addEventListener("change", applyFiltersAndRender);
resetBtn.addEventListener("click", () => {
    filterHsk.value = "Tất cả HSK";
    filterType.value = "Tất cả từ loại";
    filterTheme.value = "Tất cả chủ đề";
    applyFiltersAndRender();
});

loadCSVAndInit();
