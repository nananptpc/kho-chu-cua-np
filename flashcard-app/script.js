// ==================== MẬT KHẨU TRUY CẬP ====================
// ⚠️ HÃY ĐỔI 123456 THÀNH 6 SỐ CỦA BẠN ⚠️
const CORRECT_CODE = "123456";

// Tạo lớp phủ mật khẩu
const overlayDiv = document.createElement('div');
overlayDiv.id = 'access-overlay';
overlayDiv.innerHTML = `
    <div class="access-box">
        <h3>🔐 NHẬP MÃ TRUY CẬP</h3>
        <p>Nhập 6 số để vào học</p>
        <input type="password" id="access-code" maxlength="6" pattern="\\d*" inputmode="numeric" placeholder="******">
        <br>
        <button id="verify-btn">Xác nhận</button>
        <div id="access-error" class="error-msg"></div>
    </div>
`;
document.body.prepend(overlayDiv);

function checkAccess() {
    const verifyBtn = document.getElementById('verify-btn');
    const accessInput = document.getElementById('access-code');
    const errorDiv = document.getElementById('access-error');
    
    if (verifyBtn) {
        verifyBtn.onclick = function() {
            if (accessInput.value === CORRECT_CODE) {
                document.getElementById('access-overlay').style.display = 'none';
                document.getElementById('mainApp').style.display = 'block';
            } else {
                errorDiv.innerHTML = '❌ Mã sai! Vui lòng thử lại.';
                accessInput.value = '';
            }
        };
    }
    if (accessInput) {
        accessInput.onkeypress = function(e) {
            if (e.key === 'Enter') verifyBtn.click();
        };
    }
}

// ==================== DỮ LIỆU TỪ VỰNG ====================
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

// Dữ liệu mẫu (đầy đủ HSK 1-9, nhiều từ loại)
function loadSampleData() {
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
        { word: "高兴", pinyin: "gāoxìng", meaning: "vui vẻ", type: "tính từ", theme: "Cảm xúc", hsk: "HSK 2", image_url: "" },
        { word: "爱", pinyin: "ài", meaning: "yêu", type: "động từ", theme: "Cảm xúc", hsk: "HSK 1", image_url: "" },
        { word: "学习", pinyin: "xuéxí", meaning: "học tập", type: "động từ", theme: "Học tập", hsk: "HSK 1", image_url: "" },
        { word: "很", pinyin: "hěn", meaning: "rất", type: "phó từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" },
        { word: "个", pinyin: "gè", meaning: "cái (lượng từ)", type: "lượng từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" },
        { word: "一", pinyin: "yī", meaning: "một", type: "số từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" },
        { word: "和", pinyin: "hé", meaning: "và", type: "liên từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" },
        { word: "的", pinyin: "de", meaning: "(trợ từ)", type: "trợ từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" },
        { word: "在", pinyin: "zài", meaning: "ở tại", type: "giới từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" },
        { word: "啊", pinyin: "ā", meaning: "(thán từ)", type: "thán từ", theme: "Ngữ pháp", hsk: "HSK 1", image_url: "" }
    ];
    
    // Thêm các cấp độ HSK 3-9
    for (let i = 3; i <= 9; i++) {
        for (let j = 1; j <= 2; j++) {
            masterVocabulary.push({
                word: `Từ_HSK${i}_${j}`,
                pinyin: `pinyin_${i}_${j}`,
                meaning: `Nghĩa cấp độ ${i}`,
                type: ["danh từ", "động từ"][j % 2],
                theme: "Đa dạng",
                hsk: `HSK ${i}`,
                image_url: ""
            });
        }
    }
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
    if (!selectElement) return;
    selectElement.innerHTML = "";
    optionsArray.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        selectElement.appendChild(option);
    });
}

function applyFiltersAndRender() {
    if (!filterHsk || !filterType || !filterTheme) return;
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
    if (!contentArea) return;
    if (!filteredVocabulary.length) {
        contentArea.innerHTML = `<div class="loading-message">🌸 Chưa có từ nào phù hợp với bộ lọc 🌸</div>`;
        return;
    }
    let html = `<div class="vocab-grid">`;
    filteredVocabulary.forEach(v => {
        html += `
            <div class="word-card" onclick="speakWord('${v.word}')">
                <div class="card-img">📖</div>
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
    if (!contentArea) return;
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
    if (flashDiv) {
        flashDiv.addEventListener("click", () => {
            isFlipped = !isFlipped;
            renderFlashcardView();
        });
    }
    const prevBtn = document.getElementById("prevFlashBtn");
    const nextBtn = document.getElementById("nextFlashBtn");
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (filteredVocabulary.length) {
                flashcardIndex = (flashcardIndex - 1 + filteredVocabulary.length) % filteredVocabulary.length;
                isFlipped = false;
                renderFlashcardView();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (filteredVocabulary.length) {
                flashcardIndex = (flashcardIndex + 1) % filteredVocabulary.length;
                isFlipped = false;
                renderFlashcardView();
            }
        });
    }
}

window.speakWord = function(wordText) {
    if (!wordText) return;
    const utterance = new SpeechSynthesisUtterance(wordText);
    utterance.lang = "zh-CN";
    utterance.rate = 0.8;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
};

// Gắn sự kiện khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    if (gridBtn) {
        gridBtn.addEventListener("click", () => {
            currentView = "grid";
            gridBtn.classList.add("active");
            flashcardBtn.classList.remove("active");
            renderCurrentView();
        });
    }
    if (flashcardBtn) {
        flashcardBtn.addEventListener("click", () => {
            currentView = "flashcard";
            flashcardBtn.classList.add("active");
            gridBtn.classList.remove("active");
            renderCurrentView();
        });
    }
    if (filterHsk) filterHsk.addEventListener("change", applyFiltersAndRender);
    if (filterType) filterType.addEventListener("change", applyFiltersAndRender);
    if (filterTheme) filterTheme.addEventListener("change", applyFiltersAndRender);
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (filterHsk) filterHsk.value = "Tất cả HSK";
            if (filterType) filterType.value = "Tất cả từ loại";
            if (filterTheme) filterTheme.value = "Tất cả chủ đề";
            applyFiltersAndRender();
        });
    }
    
    // Khởi tạo dữ liệu
    loadSampleData();
    initFilters();
    applyFiltersAndRender();
    checkAccess();
});

// Ẩn app ban đầu
if (document.getElementById('mainApp')) {
    document.getElementById('mainApp').style.display = 'none';
}
