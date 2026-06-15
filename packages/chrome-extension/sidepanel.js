// FALO Prompt Manager - Satellite Chrome Extension JS
// Handles local storage, variables caching, DOM injection, CRUD, and Live Sync with PWA.

const STORAGE_KEYS = {
  database: "falo_prompt_manager_database_v03",
  variables: "falo_prompt_manager_variables_v03",
  theme: "falo_prompt_manager_theme_v03",
  mode: "falo_prompt_manager_ui_mode_v03",
  fontSize: "falo_prompt_manager_font_size_v03"
};

// Global State
let currentDb = [];
let cachedVariables = {};
let activeTagFilter = null;
let currentSearchQuery = "";
let expandedCardId = null;
let currentMode = "compact"; // Default is compact mode
let currentTheme = "light";  // Default is light theme
let currentFontSize = 3;     // Default font size level is 3 (1-5)
const openCategoryIds = new Set(); // Stores manually toggled category IDs
let discoveredPwas = [];     // List of discovered PWA instances
let activePwaTabId = null;   // Active target PWA tab ID

// Target PWA URL patterns for Live Sync
const PWA_PATTERNS = [
  "*://localhost/*",
  "*://127.0.0.1/*",
  "*://falo-taiwan.github.io/prompt-demo/*",
  "*://falo-chinese.github.io/prompt-demo/*"
];

// DOM Elements
const els = {
  categoryAccordion: document.getElementById("categoryAccordion"),
  searchInput: document.getElementById("searchInput"),
  tagsFilterContainer: document.getElementById("tagsFilterContainer"),
  dbSourceText: document.getElementById("dbSourceText"),
  dbCountText: document.getElementById("dbCountText"),
  syncIndicator: document.getElementById("syncIndicator"),
  syncStatusText: document.getElementById("syncStatusText"),
  syncPullBtn: document.getElementById("syncPullBtn"),
  syncPushBtn: document.getElementById("syncPushBtn"),
  importBtn: document.getElementById("importBtn"),
  exportBtn: document.getElementById("exportBtn"),
  resetBtn: document.getElementById("resetBtn"),
  fileInput: document.getElementById("fileInput"),
  addPromptBtn: document.getElementById("addPromptBtn"),
  
  // Modal Elements
  editModal: document.getElementById("editModal"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  cancelModalBtn: document.getElementById("cancelModalBtn"),
  promptForm: document.getElementById("promptForm"),
  editCardId: document.getElementById("editCardId"),
  formCategory: document.getElementById("formCategory"),
  formTitle: document.getElementById("formTitle"),
  formDescription: document.getElementById("formDescription"),
  formPromptText: document.getElementById("formPromptText"),
  formTags: document.getElementById("formTags"),
  formStatus: document.getElementById("formStatus"),
  formTargetAI: document.getElementById("formTargetAI"),
  formHumanReview: document.getElementById("formHumanReview"),
  modalTitle: document.getElementById("modalTitle"),
  toast: document.getElementById("toast"),
  fontDecBtn: document.getElementById("fontDecBtn"),
  fontIncBtn: document.getElementById("fontIncBtn"),
  fontSizeLvl: document.getElementById("fontSizeLvl"),
  fixedVariablesPanel: document.getElementById("fixedVariablesPanel"),
  pwaTargetSelector: document.getElementById("pwaTargetSelector")
};

// -------------------------------------------------------------
// 1. Initialization & Database Load
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  await loadState();
  initEventListeners();
  checkPwaTabStatus();
  // Poll PWA tab status every 5 seconds
  setInterval(checkPwaTabStatus, 5000);
});

// Load state from chrome.storage.local
async function loadState() {
  try {
    const data = await chrome.storage.local.get([
      STORAGE_KEYS.database, 
      STORAGE_KEYS.variables,
      STORAGE_KEYS.mode,
      STORAGE_KEYS.theme,
      STORAGE_KEYS.fontSize
    ]);
    
    // Load UI Mode (Default: compact)
    currentMode = data[STORAGE_KEYS.mode] || "compact";
    updateModeClass();
    
    // Load Theme (Default: light)
    currentTheme = data[STORAGE_KEYS.theme] || "light";
    updateThemeClass();

    // Load Font Size (Default: 3)
    currentFontSize = data[STORAGE_KEYS.fontSize] || 3;
    updateFontSizeClass();
    
    if (data[STORAGE_KEYS.database] && Array.isArray(data[STORAGE_KEYS.database])) {
      currentDb = data[STORAGE_KEYS.database];
      els.dbSourceText.textContent = "外掛儲存區";
    } else {
      // Load bundled default prompts
      await resetToDefaultDatabase();
      return;
    }
    
    cachedVariables = data[STORAGE_KEYS.variables] || {};
    renderUI();
  } catch (err) {
    showToast("讀取資料失敗: " + err.message, "error");
  }
}

function updateModeClass() {
  document.body.classList.remove("mode-compact", "mode-full");
  document.body.classList.add(`mode-${currentMode}`);
  
  const buttons = document.querySelectorAll("#uiModeSelector .mode-btn");
  buttons.forEach(btn => {
    if (btn.getAttribute("data-mode") === currentMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function updateThemeClass() {
  document.body.classList.remove("theme-light", "theme-dark", "theme-pink", "theme-warm", "theme-cyber");
  document.body.classList.add(`theme-${currentTheme}`);
  
  const dots = document.querySelectorAll("#themeSwitcher .theme-dot");
  dots.forEach(dot => {
    if (dot.getAttribute("data-theme") === currentTheme) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function updateFontSizeClass() {
  document.documentElement.classList.remove("font-size-lvl-1", "font-size-lvl-2", "font-size-lvl-3", "font-size-lvl-4", "font-size-lvl-5");
  document.documentElement.classList.add(`font-size-lvl-${currentFontSize}`);
  
  if (els.fontSizeLvl) {
    els.fontSizeLvl.textContent = currentFontSize;
  }
  if (els.fontDecBtn) {
    els.fontDecBtn.disabled = (currentFontSize <= 1);
  }
  if (els.fontIncBtn) {
    els.fontIncBtn.disabled = (currentFontSize >= 5);
  }
}

// Save state to chrome.storage.local
async function saveState() {
  await chrome.storage.local.set({
    [STORAGE_KEYS.database]: currentDb,
    [STORAGE_KEYS.variables]: cachedVariables
  });
  updateStats();
}

// Reset to bundled prompts
async function resetToDefaultDatabase() {
  try {
    const response = await fetch("default_prompts.json");
    if (!response.ok) throw new Error("無法讀取預設 Prompt 檔案");
    const defaults = await response.json();
    currentDb = defaults;
    await saveState();
    els.dbSourceText.textContent = "內建教材題庫";
    renderUI();
    showToast("已成功重設為預設教材庫");
  } catch (err) {
    showToast("載入預設資料失敗: " + err.message, "error");
  }
}

// -------------------------------------------------------------
// 2. UI Rendering & Filtering
// -------------------------------------------------------------

function renderUI() {
  renderTagsFilter();
  renderAccordion();
  updateStats();
  updateFixedVariablesPanel();
}

function updateStats() {
  let count = 0;
  currentDb.forEach(cat => {
    if (cat.items) count += cat.items.length;
  });
  els.dbCountText.textContent = count + " 張卡片";
}

// Render Tag Pills filter at top
function renderTagsFilter() {
  const tagsSet = new Set();
  currentDb.forEach(cat => {
    if (cat.items) {
      cat.items.forEach(card => {
        if (card.tags && Array.isArray(card.tags)) {
          card.tags.forEach(tag => tagsSet.add(tag.trim()));
        }
      });
    }
  });

  const uniqueTags = Array.from(tagsSet).sort();
  
  let html = "";
  if (uniqueTags.length > 0) {
    html = uniqueTags.map(tag => {
      const activeClass = activeTagFilter === tag ? "active" : "";
      return `<span class="tag-pill ${activeClass}" data-tag="${tag}">${tag}</span>`;
    }).join("");
  }
  
  els.tagsFilterContainer.innerHTML = html;
  
  // Attach tags click listener
  els.tagsFilterContainer.querySelectorAll(".tag-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const tag = pill.getAttribute("data-tag");
      if (activeTagFilter === tag) {
        activeTagFilter = null; // Toggle off
      } else {
        activeTagFilter = tag;
      }
      renderUI();
    });
  });
}

// Render main Categories and Prompt Cards
function renderAccordion() {
  els.categoryAccordion.innerHTML = "";
  
  const query = currentSearchQuery.toLowerCase().trim();
  
  currentDb.forEach(cat => {
    // Filter cards in this category
    const filteredCards = (cat.items || []).filter(card => {
      // Tag filter
      if (activeTagFilter && (!card.tags || !card.tags.includes(activeTagFilter))) {
        return false;
      }
      // Text search query
      if (query !== "") {
        const inTitle = card.title && card.title.toLowerCase().includes(query);
        const inDesc = card.description && card.description.toLowerCase().includes(query);
        const inPrompt = card.promptText && card.promptText.toLowerCase().includes(query);
        const inTags = card.tags && card.tags.some(t => t.toLowerCase().includes(query));
        return inTitle || inDesc || inPrompt || inTags;
      }
      return true;
    });

    if (filteredCards.length === 0 && query !== "") {
      return; // Skip category if searching and no match
    }

    const catGroup = document.createElement("div");
    catGroup.className = "acc-group";
    
    // Smart default: open the first category on initial load
    if (openCategoryIds.size === 0 && currentDb.length > 0) {
      openCategoryIds.add(currentDb[0].id);
    }
    
    // Keep category open if manually toggled open OR if search/filter is active
    if (query !== "" || activeTagFilter || openCategoryIds.has(cat.id)) {
      catGroup.classList.add("open");
    }

    const catHeader = document.createElement("div");
    catHeader.className = "acc-header";
    catHeader.innerHTML = `
      <div class="acc-header-left">
        <span class="acc-icon">▶</span>
        <span class="acc-title" title="${cat.title}">${cat.title}</span>
      </div>
      <span class="acc-badge">${filteredCards.length}</span>
    `;

    const catBody = document.createElement("div");
    catBody.className = "acc-body";
    
    const cardsList = document.createElement("div");
    cardsList.className = "cards-list";

    filteredCards.forEach(card => {
      const isExpanded = expandedCardId === card.id;
      const cardEl = document.createElement("div");
      cardEl.className = `prompt-card ${isExpanded ? "expanded" : ""}`;
      cardEl.setAttribute("data-card-id", card.id);

      const tagsHtml = (card.tags || []).map(t => `<span class="card-tag">${t}</span>`).join("");
      const statusHtml = card.status ? `<span class="card-status ${card.status}">${card.status}</span>` : "";

      let detailsHtml = "";
      if (isExpanded) {
        if (currentMode === "full") {
          // Expected Output
          const expOutputHtml = card.expectedOutput ? `
            <div class="card-details-box">
              <div class="detail-section-title">預期 AI 輸出</div>
              <div class="expected-output">${card.expectedOutput}</div>
            </div>
          ` : "";

          // Human Review Points
          const reviewPointsHtml = (card.humanReviewPoints && card.humanReviewPoints.length > 0) ? `
            <div class="card-details-box">
              <div class="detail-section-title">🕵️‍♂️ 人工核對重點</div>
              <ul style="padding-left: 14px; font-size: 11px; color: var(--text-secondary);">
                ${card.humanReviewPoints.map(p => `<li>${p}</li>`).join("")}
              </ul>
            </div>
          ` : "";

          detailsHtml = `
            <div class="card-details-box">
              <div class="detail-section-title">指令範本本文</div>
              <div class="prompt-template-preview">${escapeHtml(card.promptText)}</div>
            </div>
            ${expOutputHtml}
            ${reviewPointsHtml}
            <div class="card-actions">
              <button class="btn btn-outline btn-copy" data-card-id="${card.id}">📋 複製</button>
              <button class="btn btn-primary btn-fill" data-card-id="${card.id}">⚡ 填入對話框</button>
            </div>
            <div class="card-edit-row">
              <button class="text-btn btn-edit" data-card-id="${card.id}">編輯卡片</button>
              <button class="text-btn text-btn-danger btn-delete" data-card-id="${card.id}">刪除</button>
            </div>
          `;
        } else {
          // Compact Mode: prompt text preview and actions
          detailsHtml = `
            <div class="card-details-box" style="margin-top: 4px; padding-top: 4px; border-top: none;">
              <div class="prompt-template-preview">${escapeHtml(card.promptText)}</div>
            </div>
            <div class="card-actions">
              <button class="btn btn-outline btn-copy" data-card-id="${card.id}">📋 複製</button>
              <button class="btn btn-primary btn-fill" data-card-id="${card.id}">⚡ 填入對話框</button>
            </div>
          `;
        }
      }

      cardEl.innerHTML = `
        <div class="card-header-row">
          <span class="card-title">${card.title}</span>
          ${statusHtml}
        </div>
        <div class="card-desc">${card.description || "無用途說明。"}</div>
        <div class="card-tags">${tagsHtml}</div>
        ${detailsHtml}
      `;

      // Event listeners inside card
      cardEl.addEventListener("click", (e) => {
        // Prevent collapse/expansion if clicking inputs, buttons, or anywhere inside the expanded details area
        if (e.target.closest("input") || 
            e.target.closest("button") || 
            e.target.closest("select") || 
            e.target.closest(".variables-panel") || 
            e.target.closest(".card-details-box") || 
            e.target.closest(".card-actions") || 
            e.target.closest(".card-edit-row")) {
          return;
        }
        
        if (expandedCardId === card.id) {
          expandedCardId = null;
          renderAccordion();
        } else {
          expandedCardId = card.id;
          renderAccordion();
          // Scroll the newly rendered card into view
          setTimeout(() => {
            const newCardEl = document.querySelector(`.prompt-card[data-card-id="${card.id}"]`);
            if (newCardEl) {
              newCardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }, 100);
        }
      });

      // Expanded sub-actions
      if (isExpanded) {

        // Copy button
        cardEl.querySelector(".btn-copy").addEventListener("click", () => {
          const compiled = compilePrompt(card);
          copyToClipboard(compiled);
        });

        // Fill dialog button
        cardEl.querySelector(".btn-fill").addEventListener("click", () => {
          const compiled = compilePrompt(card);
          fillIntoTab(compiled);
        });

        // Edit & Delete button listeners only in full mode
        if (currentMode === "full") {
          cardEl.querySelector(".btn-edit").addEventListener("click", () => {
            openEditModal(card.id);
          });

          cardEl.querySelector(".btn-delete").addEventListener("click", () => {
            if (confirm(`確定要刪除「${card.title}」提示詞卡片嗎？`)) {
              deleteCard(card.id);
            }
          });
        }
      }

      cardsList.appendChild(cardEl);
    });

    catBody.appendChild(cardsList);
    catGroup.appendChild(catHeader);
    catGroup.appendChild(catBody);
    
    // Toggle accordion group collapse
    catHeader.addEventListener("click", () => {
      if (openCategoryIds.has(cat.id)) {
        openCategoryIds.delete(cat.id);
        catGroup.classList.remove("open");
      } else {
        openCategoryIds.add(cat.id);
        catGroup.classList.add("open");
      }
    });

    els.categoryAccordion.appendChild(catGroup);
  });

  if (els.categoryAccordion.children.length === 0) {
    els.categoryAccordion.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">
        無符合搜尋或篩選條件的提示詞卡片。
      </div>
    `;
  }
}

function updateFixedVariablesPanel() {
  if (!els.fixedVariablesPanel) return;
  
  if (!expandedCardId) {
    els.fixedVariablesPanel.style.display = "none";
    els.fixedVariablesPanel.innerHTML = "";
    return;
  }

  // Find the expanded card
  let activeCard = null;
  for (const cat of currentDb) {
    const found = (cat.items || []).find(item => item.id === expandedCardId);
    if (found) {
      activeCard = found;
      break;
    }
  }

  if (!activeCard) {
    els.fixedVariablesPanel.style.display = "none";
    els.fixedVariablesPanel.innerHTML = "";
    return;
  }

  const vars = parseVariables(activeCard.promptText);
  if (vars.length === 0) {
    els.fixedVariablesPanel.style.display = "none";
    els.fixedVariablesPanel.innerHTML = "";
    return;
  }

  // Generate input fields for each variable
  const varInputs = vars.map(v => {
    const val = cachedVariables[v] || "";
    return `
      <div class="var-input-group">
        <label for="fixed-var-${v}">[${v}]</label>
        <input type="text" class="fixed-var-input" id="fixed-var-${v}" data-var-name="${v}" value="${escapeHtml(val)}" placeholder="輸入 ${v} 的值...">
      </div>
    `;
  }).join("");

  els.fixedVariablesPanel.innerHTML = `
    <div class="detail-section-title" style="margin-bottom: 6px; color: var(--primary); font-size: var(--base-fs-11); display: flex; justify-content: space-between; align-items: center; text-transform: none;">
      <span>🏷️ 變數帶入 (來自: ${escapeHtml(activeCard.title)})</span>
      <span style="font-size: var(--base-fs-9); opacity: 0.7; font-weight: normal; text-transform: none;">(即時套用至複製或填入動作)</span>
    </div>
    <div class="variables-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
      ${varInputs}
    </div>
  `;
  els.fixedVariablesPanel.style.display = "block";

  // Bind input event listeners to save values dynamically
  els.fixedVariablesPanel.querySelectorAll(".fixed-var-input").forEach(input => {
    input.addEventListener("input", (e) => {
      const varName = e.target.getAttribute("data-var-name");
      const val = e.target.value;
      cachedVariables[varName] = val;
      chrome.storage.local.set({ [STORAGE_KEYS.variables]: cachedVariables });
    });
  });
}

// -------------------------------------------------------------
// 3. Variable Parsing & Compilation
// -------------------------------------------------------------

function parseVariables(text) {
  if (!text) return [];
  // Matches both [Variable] and {{Variable}}
  const regex = /\[([A-Za-z0-9_]+)\]|\{\{([A-Za-z0-9_]+)\}\}/g;
  const vars = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const varName = match[1] || match[2];
    if (varName) vars.add(varName);
  }
  return Array.from(vars);
}

function compilePrompt(card) {
  let text = card.promptText;
  const vars = parseVariables(text);
  vars.forEach(v => {
    const val = cachedVariables[v] || `[${v}]`; // Fallback to label if empty
    // Replace all occurrences of [v]
    const escapedVar = v.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\[${escapedVar}\\]|\\{\\{${escapedVar}\\}\\}`, "g");
    text = text.replace(regex, val);
  });
  return text;
}

// -------------------------------------------------------------
// 4. Live Sync with PWA (Pull/Push)
// -------------------------------------------------------------

// Search open tabs to see if a PWA is active
async function scanPwaTabs() {
  const tabs = await chrome.tabs.query({});
  const found = [];
  for (const tab of tabs) {
    if (!tab.url) continue;
    // Check if URL matches any pattern
    const matched = PWA_PATTERNS.some(pat => {
      const regexStr = "^" + pat.split("*").map(s => s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')).join(".*") + "$";
      return new RegExp(regexStr).test(tab.url);
    });
    if (matched) {
      try {
        // Execute a quick script to check for FALO PWA metadata in the MAIN world context
        const [res] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',
          func: () => {
            return typeof window.__FALO_PWA_METADATA__ !== 'undefined' ? window.__FALO_PWA_METADATA__ : null;
          }
        });
        if (res && res.result) {
          found.push({
            tabId: tab.id,
            pwaInstanceId: res.result.pwaInstanceId || "unknown",
            sourceName: res.result.sourceName || "FALO PWA",
            url: tab.url
          });
        }
      } catch (e) {
        // Skip if script cannot be executed (e.g. extension page)
      }
    }
  }
  discoveredPwas = found;
  return found;
}

async function findPwaTab() {
  if (!activePwaTabId) return null;
  try {
    const tab = await chrome.tabs.get(activePwaTabId);
    return tab;
  } catch (e) {
    return null;
  }
}

async function checkPwaTabStatus() {
  await scanPwaTabs();
  
  if (discoveredPwas.length === 0) {
    activePwaTabId = null;
    els.syncIndicator.className = "status-indicator disconnected";
    els.syncStatusText.textContent = "未偵測到 Prompt 主中心";
    els.syncStatusText.style.display = "inline";
    if (els.pwaTargetSelector) {
      els.pwaTargetSelector.style.display = "none";
      els.pwaTargetSelector.innerHTML = "";
    }
    els.syncPullBtn.disabled = true;
    els.syncPushBtn.disabled = true;
    return;
  }

  // If activePwaTabId is not in the list of discovered tabs, select the first one
  const exists = discoveredPwas.some(p => p.tabId === activePwaTabId);
  if (!exists) {
    activePwaTabId = discoveredPwas[0].tabId;
  }

  els.syncIndicator.className = "status-indicator connected";
  els.syncPullBtn.disabled = false;
  els.syncPushBtn.disabled = false;

  if (discoveredPwas.length === 1) {
    // Only one PWA target, show text
    els.syncStatusText.textContent = discoveredPwas[0].sourceName;
    els.syncStatusText.style.display = "inline";
    if (els.pwaTargetSelector) {
      els.pwaTargetSelector.style.display = "none";
    }
  } else {
    // Multiple PWA targets, show dropdown
    els.syncStatusText.style.display = "none";
    if (els.pwaTargetSelector) {
      const selectHtml = discoveredPwas.map(p => {
        let displayHost = "unknown";
        try {
          const urlObj = new URL(p.url);
          displayHost = urlObj.host === "localhost" || urlObj.host === "127.0.0.1" ? `${urlObj.host}:${urlObj.port || '80'}` : urlObj.host;
        } catch (err) {}
        const selected = p.tabId === activePwaTabId ? "selected" : "";
        return `<option value="${p.tabId}" ${selected}>${p.sourceName} (${displayHost})</option>`;
      }).join("");
      els.pwaTargetSelector.innerHTML = selectHtml;
      els.pwaTargetSelector.style.display = "inline-block";
    }
  }

  // Send heartbeat ping to active PWA tab
  if (activePwaTabId) {
    try {
      chrome.scripting.executeScript({
        target: { tabId: activePwaTabId },
        args: [chrome.runtime.id],
        func: (extId) => {
          window.dispatchEvent(new CustomEvent("faloExtensionPing", {
            detail: {
              extensionId: extId,
              clientName: "FALO Satellite Client"
            }
          }));
        }
      });
    } catch (e) {
      // Ignore if tab is closed or reloading
    }
  }
}

// Pull data from open PWA Tab's localStorage
async function pullFromPwa() {
  const tab = await findPwaTab();
  if (!tab) {
    showToast("找不到 Prompt 主中心分頁，請先開啟網頁", "error");
    return;
  }

  showToast("正在拉取 Prompt 資料...");
  
  try {
    // Execute script in PWA tab context to get localStorage data
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          database: localStorage.getItem("falo_prompt_manager_database_v03"),
          variables: localStorage.getItem("falo_prompt_manager_variables_v03")
        };
      }
    }, async (results) => {
      if (!results || !results[0] || !results[0].result) {
        showToast("無法讀取網頁端儲存區", "error");
        return;
      }
      
      const { database, variables } = results[0].result;
      
      if (!database) {
        showToast("Prompt 主中心尚未建立資料庫 (請先在網頁端初始化)", "error");
        return;
      }

      try {
        const parsedDb = JSON.parse(database);
        // Schema check
        if (!Array.isArray(parsedDb)) throw new Error("資料格式應為陣列");
        
        currentDb = parsedDb;
        if (variables) {
          cachedVariables = { ...cachedVariables, ...JSON.parse(variables) };
        }
        
        await saveState();
        els.dbSourceText.textContent = "同步自 Prompt 主中心";
        renderUI();
        showToast("🔄 資料已成功拉取並同步！");
      } catch (err) {
        showToast("拉取資料解析失敗: " + err.message, "error");
      }
    });
  } catch (err) {
    showToast("同步失敗: " + err.message, "error");
  }
}

// Push data to PWA Tab's localStorage and refresh it
async function pushToPwa() {
  const tab = await findPwaTab();
  if (!tab) {
    showToast("找不到 Prompt 主中心分頁，請先開啟網頁", "error");
    return;
  }

  showToast("正在推送變更至 Prompt 主中心...");

  try {
    const dbStr = JSON.stringify(currentDb);
    const varStr = JSON.stringify(cachedVariables);
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [dbStr, varStr],
      func: (db, vars) => {
        localStorage.setItem("falo_prompt_manager_database_v03", db);
        localStorage.setItem("falo_prompt_manager_variables_v03", vars);
        // Dispatch custom event to notify page if it's listening
        window.dispatchEvent(new CustomEvent("faloDbSync", { detail: { updated: true } }));
        // Reload tab to reflect changes immediately
        location.reload();
        return true;
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        showToast("📤 成功推送變更！網頁已重新整理。");
      } else {
        showToast("推送失敗，無法寫入網頁", "error");
      }
    });
  } catch (err) {
    showToast("推送同步出錯: " + err.message, "error");
  }
}

// -------------------------------------------------------------
// 5. File Import & Export
// -------------------------------------------------------------
function exportCsv() {
  try {
    const csvContent = stringifyCSV(currentDb);
    // Use BOM \uFEFF to support Excel viewing Chinese correctly
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const stamp = `${year}${month}${date}_${hours}${minutes}`;
    const filename = `falo_prompt_export_extension_${stamp}.csv`;
    
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("已成功匯出 CSV 備份");
  } catch (err) {
    showToast("匯出 CSV 失敗: " + err.message, "error");
  }
}

function mapHeader(key) {
  const k = String(key || "").trim();
  if (/分類ID|Category\s*ID/i.test(k)) return "categoryId";
  if (/分類名稱|Category\s*(Title|Name)/i.test(k)) return "categoryTitle";
  if (/分類說明|Category\s*Description/i.test(k)) return "categoryDescription";
  if (/卡片ID|Card\s*ID|Prompt\s*ID/i.test(k)) return "cardId";
  if (/卡片名稱|Card\s*(Title|Name)|Prompt\s*(Title|Name)/i.test(k)) return "cardTitle";
  if (/卡片說明|Card\s*Description|Prompt\s*Description/i.test(k)) return "cardDescription";
  if (/提示詞範本|提示詞|Prompt\s*Template|Prompt\s*Text/i.test(k)) return "promptText";
  if (/標籤|Tags/i.test(k)) return "tags";
  if (/狀態|Status/i.test(k)) return "status";
  if (/預期輸出|Expected\s*Output/i.test(k)) return "expectedOutput";
  if (/人工檢查點|檢查點|Review\s*Points|Human\s*Review\s*Points/i.test(k)) return "humanReviewPoints";
  if (/目標AI|Target\s*AI/i.test(k)) return "targetAI";
  if (/角色|Role/i.test(k)) return "role";
  if (/課程|Course/i.test(k)) return "course";
  if (/版本|Version/i.test(k)) return "version";
  if (/來源|Source/i.test(k)) return "source";
  return null;
}

function triggerImport() {
  els.fileInput.click();
}

function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!confirm("匯入 CSV 將會「完全覆蓋」您現有的所有分類與提示詞卡片，此操作無法復原。確定要繼續嗎？")) {
    e.target.value = ""; // Clear file input
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const text = event.target.result;
      const csvData = parseCSV(text);
      
      if (csvData.length < 2) {
        throw new Error("CSV 檔案內容不足或無資料列");
      }
      
      const headers = csvData[0];
      const headerMap = {};
      headers.forEach((h, index) => {
        const mappedKey = mapHeader(h);
        if (mappedKey) {
          headerMap[mappedKey] = index;
        }
      });
      
      // Basic validation: must have categoryId, cardTitle, promptText
      if (headerMap.categoryId === undefined || headerMap.cardTitle === undefined || headerMap.promptText === undefined) {
        throw new Error("CSV 欄位標頭格式不符，找不到必要的「分類ID」、「卡片名稱」或「提示詞範本」欄位");
      }
      
      const categoriesMap = new Map();
      
      // Start loop from line index 1 (skip headers)
      for (let i = 1; i < csvData.length; i++) {
        const row = csvData[i];
        
        // Skip empty rows
        if (row.length === 0 || (row.length === 1 && row[0] === "")) continue;
        
        const catId = row[headerMap.categoryId] ? row[headerMap.categoryId].trim() : "default-cat";
        const catTitle = row[headerMap.categoryTitle] ? row[headerMap.categoryTitle].trim() : catId;
        const catDesc = row[headerMap.categoryDescription] ? row[headerMap.categoryDescription].trim() : "";
        
        if (!categoriesMap.has(catId)) {
          categoriesMap.set(catId, {
            id: catId,
            title: catTitle,
            description: catDesc,
            items: []
          });
        }
        
        const category = categoriesMap.get(catId);
        
        const cardTitle = row[headerMap.cardTitle] ? row[headerMap.cardTitle].trim() : "";
        const promptText = row[headerMap.promptText] || "";
        
        // Skip rows without title or prompt
        if (!cardTitle && !promptText) continue;
        
        const cardId = row[headerMap.cardId] ? row[headerMap.cardId].trim() : "card-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
        
        const tagsRaw = row[headerMap.tags];
        let tags = [];
        if (tagsRaw) {
          tags = String(tagsRaw).split(/[,，\n]/).map(t => t.trim()).filter(Boolean);
        }
        
        const humanReviewPointsRaw = row[headerMap.humanReviewPoints];
        let humanReviewPoints = [];
        if (humanReviewPointsRaw) {
          humanReviewPoints = String(humanReviewPointsRaw).split(/[\n;；，,]/).map(p => p.trim()).filter(Boolean);
        }
        
        const card = {
          id: cardId,
          title: cardTitle || "未命名卡片",
          description: row[headerMap.cardDescription] || "",
          promptText: promptText,
          tags: tags,
          status: row[headerMap.status] || "stable",
          variables: parseVariables(promptText),
          targetAI: row[headerMap.targetAI] || "",
          humanReviewPoints: humanReviewPoints,
          expectedOutput: row[headerMap.expectedOutput] || "",
          role: row[headerMap.role] || "",
          course: row[headerMap.course] || "",
          version: row[headerMap.version] || "",
          source: row[headerMap.source] || ""
        };
        
        category.items.push(card);
      }
      
      if (categoriesMap.size === 0) {
        throw new Error("未從 CSV 解析出任何有效的提示詞資料");
      }
      
      currentDb = Array.from(categoriesMap.values());
      await saveState();
      els.dbSourceText.textContent = "匯入自 CSV 檔案";
      renderUI();
      showToast("📥 CSV 資料匯入成功！");
    } catch (err) {
      showToast("匯入解析失敗: " + err.message, "error");
    }
  };
  reader.readAsText(file);
}

// RFC 4180 compliant CSV Parser
function parseCSV(text) {
  const result = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          cell += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false; // Quote closed
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\r' || char === '\n') {
        row.push(cell);
        cell = '';
        if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
          result.push(row);
        }
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip LF if CRLF
        }
      } else {
        cell += char;
      }
    }
  }
  
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  
  return result;
}

// Re-stringify DB schema to CSV format (matching Master PWA's column headers exactly)
function stringifyCSV(db) {
  const headers = [
    "分類ID",
    "分類名稱",
    "分類說明",
    "卡片ID",
    "卡片名稱",
    "卡片說明",
    "提示詞範本",
    "標籤",
    "狀態",
    "預期輸出",
    "人工檢查點",
    "目標AI",
    "角色",
    "課程",
    "版本",
    "來源"
  ];
  
  const rows = [headers];
  
  db.forEach(cat => {
    const catId = cat.id || "";
    const catTitle = cat.title || "";
    const catDesc = cat.description || "";
    
    if (cat.items && Array.isArray(cat.items)) {
      cat.items.forEach(card => {
        const tagsStr = (card.tags || []).join(", ");
        const reviewPointsStr = (card.humanReviewPoints || []).join("\n");
        
        rows.push([
          catId,
          catTitle,
          catDesc,
          card.id || "",
          card.title || "",
          card.description || "",
          card.promptText || "",
          tagsStr,
          card.status || "stable",
          card.expectedOutput || "",
          reviewPointsStr,
          card.targetAI || "",
          card.role || "",
          card.course || "",
          card.version || "",
          card.source || ""
        ]);
      });
    }
  });
  
  return rows.map(row => 
    row.map(cell => {
      const val = String(cell);
      if (val.includes(',') || val.includes('\n') || val.includes('\r') || val.includes('"')) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',')
  ).join('\r\n');
}

// -------------------------------------------------------------
// 6. Autofill into active tab (DOM Injection)
// -------------------------------------------------------------

async function fillIntoTab(compiledPrompt) {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab) {
    showToast("找不到作用中的網頁分頁", "error");
    return;
  }
  
  const url = activeTab.url || "";
  const isAIPage = ["chatgpt.com", "gemini.google.com", "claude.ai", "notebooklm.google.com"].some(domain => url.includes(domain));
  
  if (!isAIPage) {
    showToast("請切換至 AI 對話網頁（ChatGPT, Gemini, Claude 等）再填入！", "error");
    return;
  }
  
  showToast("正在注入 Prompt...");
  
  try {
    // Send message to Content Script on active tab
    chrome.tabs.sendMessage(activeTab.id, {
      action: "fillPrompt",
      text: compiledPrompt
    }, (response) => {
      // Handles fallback or success response
      if (chrome.runtime.lastError) {
        // Content script might not be loaded yet or unsupported, try script execution fallback
        fallbackInject(activeTab.id, compiledPrompt);
      } else if (response && response.success) {
        showToast("⚡ 已成功填入輸入框！");
      } else {
        showToast("填入失敗: 找不到輸入框", "error");
      }
    });
  } catch (err) {
    showToast("填充指令發送失敗: " + err.message, "error");
  }
}

// Fallback script execution if content.js isn't ready
function fallbackInject(tabId, text) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    args: [text],
    func: (promptText) => {
      // Look for editable areas
      const inputSelectors = [
        '#prompt-textarea',
        'div[contenteditable="true"]',
        'textarea',
        '[placeholder*="ChatGPT"]',
        '[placeholder*="Gemini"]',
        '[placeholder*="對話"]',
        '[placeholder*="ask"]'
      ];
      
      let element = null;
      for (const selector of inputSelectors) {
        element = document.querySelector(selector);
        if (element) break;
      }
      
      if (!element) return false;
      
      if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        element.value = promptText;
      } else if (element.getAttribute('contenteditable') === 'true') {
        // Clear children
        element.innerHTML = '';
        const p = document.createElement('p');
        p.innerText = promptText;
        element.appendChild(p);
      }
      
      // Dispatch events to trigger React/Vue update
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.focus();
      return true;
    }
  }, (results) => {
    if (results && results[0] && results[0].result) {
      showToast("⚡ (備用通道) 已成功填入輸入框！");
    } else {
      showToast("無法定位輸入框，請手動複製貼上", "error");
    }
  });
}

// -------------------------------------------------------------
// 7. Card CRUD (Quick Editor)
// -------------------------------------------------------------

function openEditModal(cardId = null) {
  // Populate category select
  els.formCategory.innerHTML = currentDb.map(cat => `
    <option value="${cat.id}">${cat.title}</option>
  `).join("");

  if (cardId) {
    // Edit mode
    els.modalTitle.textContent = "編輯提示詞卡片";
    els.editCardId.value = cardId;
    
    // Find card and category
    let foundCard = null;
    let foundCatId = null;
    currentDb.forEach(cat => {
      if (cat.items) {
        const c = cat.items.find(item => item.id === cardId);
        if (c) {
          foundCard = c;
          foundCatId = cat.id;
        }
      }
    });

    if (foundCard) {
      els.formCategory.value = foundCatId;
      els.formTitle.value = foundCard.title || "";
      els.formDescription.value = foundCard.description || "";
      els.formPromptText.value = foundCard.promptText || "";
      els.formTags.value = (foundCard.tags || []).join(", ");
      els.formStatus.value = foundCard.status || "stable";
      els.formTargetAI.value = foundCard.targetAI || "";
      els.formHumanReview.value = (foundCard.humanReviewPoints || []).join("\n");
    }
  } else {
    // Add mode
    els.modalTitle.textContent = "新增提示詞卡片";
    els.editCardId.value = "";
    els.promptForm.reset();
    els.formStatus.value = "stable";
  }
  
  els.editModal.classList.add("show");
}

function closeEditModal() {
  els.editModal.classList.remove("show");
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const cardId = els.editCardId.value;
  const catId = els.formCategory.value;
  const title = els.formTitle.value.trim();
  const description = els.formDescription.value.trim();
  const promptText = els.formPromptText.value;
  const tags = els.formTags.value.split(",").map(t => t.trim()).filter(t => t !== "");
  const status = els.formStatus.value;
  const targetAI = els.formTargetAI.value.trim();
  const humanReviewPoints = els.formHumanReview.value.split("\n").map(l => l.trim()).filter(l => l !== "");

  if (!title || !promptText) {
    showToast("標題與 Prompt 本文為必填欄位！", "error");
    return;
  }

  // Remove card from old location if editing (to handle category changes)
  if (cardId) {
    currentDb.forEach(cat => {
      if (cat.items) {
        cat.items = cat.items.filter(item => item.id !== cardId);
      }
    });
  }

  const newCardId = cardId || "card-" + Date.now();
  const cardData = {
    id: newCardId,
    title,
    description,
    promptText,
    tags,
    status,
    variables: parseVariables(promptText),
    targetAI,
    humanReviewPoints
  };

  // Find target category and push
  const targetCategory = currentDb.find(cat => cat.id === catId);
  if (targetCategory) {
    if (!targetCategory.items) targetCategory.items = [];
    targetCategory.items.push(cardData);
  } else {
    showToast("找不到所屬分類", "error");
    return;
  }

  await saveState();
  closeEditModal();
  renderUI();
  showToast(cardId ? "✏️ 卡片已更新！" : "➕ 卡片已成功建立！");
}

async function deleteCard(cardId) {
  let deleted = false;
  currentDb.forEach(cat => {
    if (cat.items) {
      const originalLength = cat.items.length;
      cat.items = cat.items.filter(item => item.id !== cardId);
      if (cat.items.length < originalLength) {
        deleted = true;
      }
    }
  });

  if (deleted) {
    if (expandedCardId === cardId) expandedCardId = null;
    await saveState();
    renderUI();
    showToast("🗑️ 卡片已刪除");
  } else {
    showToast("找不到欲刪除的卡片", "error");
  }
}

// -------------------------------------------------------------
// 8. Event Listeners & Helpers
// -------------------------------------------------------------

function initEventListeners() {
  // Search box
  els.searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    renderUI();
  });
  
  // Mode switcher segmented buttons
  const modeButtons = document.querySelectorAll("#uiModeSelector .mode-btn");
  modeButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const mode = btn.getAttribute("data-mode");
      currentMode = mode;
      updateModeClass();
      await chrome.storage.local.set({ [STORAGE_KEYS.mode]: currentMode });
      renderUI();
    });
  });
  
  // Theme switcher dots
  const themeDots = document.querySelectorAll("#themeSwitcher .theme-dot");
  themeDots.forEach(dot => {
    dot.addEventListener("click", async () => {
      const theme = dot.getAttribute("data-theme");
      currentTheme = theme;
      updateThemeClass();
      await chrome.storage.local.set({ [STORAGE_KEYS.theme]: currentTheme });
      renderUI();
    });
  });

  // Font size adjuster
  els.fontDecBtn.addEventListener("click", async () => {
    if (currentFontSize > 1) {
      currentFontSize--;
      updateFontSizeClass();
      await chrome.storage.local.set({ [STORAGE_KEYS.fontSize]: currentFontSize });
    }
  });

  els.fontIncBtn.addEventListener("click", async () => {
    if (currentFontSize < 5) {
      currentFontSize++;
      updateFontSizeClass();
      await chrome.storage.local.set({ [STORAGE_KEYS.fontSize]: currentFontSize });
    }
  });
  
  // PWA Target selector dropdown change
  if (els.pwaTargetSelector) {
    els.pwaTargetSelector.addEventListener("change", (e) => {
      activePwaTabId = parseInt(e.target.value, 10);
      checkPwaTabStatus(); // Update and ping PWA immediately
    });
  }
  
  // Sync actions
  els.syncPullBtn.addEventListener("click", pullFromPwa);
  els.syncPushBtn.addEventListener("click", pushToPwa);
  
  // File actions
  els.importBtn.addEventListener("click", triggerImport);
  els.exportBtn.addEventListener("click", exportCsv);
  els.resetBtn.addEventListener("click", () => {
    if (confirm("您確定要將資料重置為內建教材庫嗎？這將覆蓋現有外掛內的變更！")) {
      resetToDefaultDatabase();
    }
  });
  els.fileInput.addEventListener("change", handleFileImport);
  
  // Floating button (Add Card)
  els.addPromptBtn.addEventListener("click", () => openEditModal(null));
  
  // Modal close
  els.closeModalBtn.addEventListener("click", closeEditModal);
  els.cancelModalBtn.addEventListener("click", closeEditModal);
  els.promptForm.addEventListener("submit", handleFormSubmit);
  
  // Close modal when clicking background overlay
  els.editModal.addEventListener("click", (e) => {
    if (e.target === els.editModal) closeEditModal();
  });
}

function showToast(message, type = "success") {
  els.toast.textContent = message;
  els.toast.className = `toast ${type === "error" ? "error" : ""} show`;
  setTimeout(() => {
    els.toast.classList.remove("show");
  }, 3000);
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 已複製到剪貼簿！");
  }).catch(err => {
    // Fallback using legacy textarea copy method
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // Avoid scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast("📋 已複製到剪貼簿！(備用)");
    } catch (e) {
      showToast("複製失敗，請手動複製", "error");
    }
    document.body.removeChild(textarea);
  });
}
