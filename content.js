const GITHUB_JSON_URL = "";

let GIFT_CODES = [];

const SELECTORS = {
  input: 'input.exc-input',
  submitBtn: 'a.btn-exchange'
};

const DELAY_MS = 2500;

function setInputValue(inputEl, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  valueSetter.call(inputEl, value);

  inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  inputEl.dispatchEvent(new Event('change', { bubbles: true }));
  inputEl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
  inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
}

// Fetch gift codes from GitHub
async function fetchCodesFromGitHub() {
  const countEl = document.getElementById('auto-code-count');
  const logEl = document.getElementById('auto-code-log');

  if (logEl) logEl.innerText = "Fetching codes from GitHub...";

  try {
    const response = await fetch(GITHUB_JSON_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    GIFT_CODES = await response.json();

    if (countEl) countEl.innerText = `Loaded Codes: ${GIFT_CODES.length}`;
    if (logEl) logEl.innerText = "Codes loaded successfully.";
  } catch (err) {
    if (logEl) logEl.innerText = `Fetch Error: ${err.message}`;
  }
}

async function runAutoRedeem() {
  const logEl = document.getElementById('auto-code-log');
  const startBtn = document.getElementById('auto-code-start-btn');

  if (!GIFT_CODES || GIFT_CODES.length === 0) {
    await fetchCodesFromGitHub();
    if (GIFT_CODES.length === 0) {
      logEl.innerText = "Error: Code list is empty.";
      return;
    }
  }

  startBtn.disabled = true;
  startBtn.innerText = "Processing...";

  for (let i = 0; i < GIFT_CODES.length; i++) {
    const code = GIFT_CODES[i];
    logEl.innerText = `[${i + 1}/${GIFT_CODES.length}] Inputting: ${code}`;

    const inputEl = document.querySelector(SELECTORS.input);
    const submitBtn = document.querySelector(SELECTORS.submitBtn);

    if (!inputEl) {
      logEl.innerText = "Error: Input field not found.";
      startBtn.disabled = false;
      startBtn.innerText = "Start Auto Redeem";
      return;
    }

    inputEl.focus();
    setInputValue(inputEl, code);
    await new Promise(r => setTimeout(r, 400));

    if (submitBtn) {
      submitBtn.click();
      logEl.innerText = `[${i + 1}/${GIFT_CODES.length}] Submitted: ${code}`;
    } else {
      logEl.innerText = `[${i + 1}/${GIFT_CODES.length}] Filled: ${code}`;
    }

    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  logEl.innerText = "Finished processing all codes!";
  startBtn.disabled = false;
  startBtn.innerText = "Start Auto Redeem";
}

function injectUI() {
  if (document.getElementById('auto-code-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'auto-code-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: #111827;
    color: #f3f4f6;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
    font-family: sans-serif;
    font-size: 13px;
    width: 260px;
    border: 1px solid #374151;
  `;

  overlay.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: bold; color: #10b981;">Delta Force Auto Code Redeemer</span>
      <div style="display: flex; gap: 8px; align-items: center;">
        <!-- Facebook Link -->
        <a href="https://www.facebook.com/nyaruko166" target="_blank" title="Facebook" style="color: #9ca3af; display: flex; align-items: center; transition: color 0.2s;" onmouseover="this.style.color='#1877F2'" onmouseout="this.style.color='#9ca3af'">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <!-- GitHub Link -->
        <a href="https://github.com/Nyaruko166/Delta-Force-Auto-Code-Redeemer" target="_blank" title="GitHub" style="color: #9ca3af; display: flex; align-items: center; transition: color 0.2s;" onmouseover="this.style.color='#ffffff'" onmouseout="this.style.color='#9ca3af'">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
      </div>
    </div>
    <div id="auto-code-count" style="margin-bottom: 10px; color: #9ca3af;">Loaded Codes: 0</div>
    <button id="auto-code-start-btn" style="
      width: 100%;
      background: #059669;
      color: white;
      border: none;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Start Auto Redeem</button>
    <div id="auto-code-log" style="margin-top: 10px; font-size: 11px; color: #d1d5db; min-height: 18px;">Initializing...</div>
  `;

  document.body.appendChild(overlay);
  document.getElementById('auto-code-start-btn').addEventListener('click', runAutoRedeem);

  fetchCodesFromGitHub();
}

if (document.readyState === 'complete') {
  injectUI();
} else {
  window.addEventListener('load', injectUI);
}
