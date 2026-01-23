
// JetStorage Content Script
let activeInput = null;
let savedValues = [];
let dropdownEl = null;
let indicatorEl = null;

const SECRETS_KEYWORDS = ['password', 'cvv', 'card', 'key', 'secret', 'token', 'ssn', 'cvc'];

/**
 * Verifica si un input es sensible
 */
function isSecret(el) {
    if (el.type === 'password') return true;
    const attrs = (el.name + el.id + el.placeholder + el.className).toLowerCase();
    return SECRETS_KEYWORDS.some(k => attrs.includes(k));
}

/**
 * Inyecta el indicador de "Grabando"
 */
function createIndicator() {
    indicatorEl = document.createElement('div');
    indicatorEl.id = 'jetstorage-indicator';
    indicatorEl.innerHTML = `
        <div class="js-dot"></div>
        <div class="js-label">JetStorage</div>
    `;
    indicatorEl.onclick = () => {
        chrome.runtime.sendMessage({ action: "open_dashboard" });
    };
    document.body.appendChild(indicatorEl);
}

/**
 * Inyecta el Dropdown
 */
function createDropdown() {
    dropdownEl = document.createElement('div');
    dropdownEl.id = 'jetstorage-dropdown';
    document.body.appendChild(dropdownEl);
}

/**
 * Actualiza posición del dropdown e indicador
 */
function updateUIPosition(input) {
    const rect = input.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (indicatorEl) {
        indicatorEl.style.top = `${rect.top + scrollTop - 25}px`;
        indicatorEl.style.left = `${rect.right + scrollLeft - 80}px`;
    }

    if (dropdownEl) {
        dropdownEl.style.top = `${rect.bottom + scrollTop + 5}px`;
        dropdownEl.style.left = `${rect.left + scrollLeft}px`;
        dropdownEl.style.width = `${rect.width}px`;
    }
}

/**
 * Carga valores desde storage
 */
async function loadValues() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['capturedValues'], (res) => {
            savedValues = res.capturedValues || [];
            resolve(savedValues);
        });
    });
}

/**
 * Guarda un valor único
 */
async function handleValueSave(value) {
    if (!value || value.trim().length < 2) return;
    
    await loadValues();
    const exists = savedValues.some(v => v.value.toLowerCase() === value.toLowerCase());
    
    if (!exists) {
        const newValue = {
            id: Date.now().toString(),
            value: value.trim(),
            timestamp: Date.now(),
            sourceUrl: window.location.href
        };
        savedValues.unshift(newValue);
        chrome.storage.local.set({ capturedValues: savedValues });
        
        // Efecto visual en el indicador
        if (indicatorEl) {
            indicatorEl.classList.add('js-saved');
            setTimeout(() => indicatorEl.classList.remove('js-saved'), 1500);
        }
    }
}

/**
 * Renderiza el dropdown de autocompletado
 */
function renderDropdown(filterText = '') {
    if (!dropdownEl) return;
    
    const matches = savedValues
        .filter(v => v.value.toLowerCase().includes(filterText.toLowerCase()))
        .slice(0, 5);

    if (matches.length === 0) {
        dropdownEl.style.display = 'none';
        return;
    }

    dropdownEl.innerHTML = matches.map(m => `
        <div class="js-item" data-value="${m.value}">
            <span class="js-val">${m.value}</span>
            <span class="js-hint">JetStorage</span>
        </div>
    `).join('');

    dropdownEl.style.display = 'block';

    const items = dropdownEl.querySelectorAll('.js-item');
    items.forEach(item => {
        item.onmousedown = (e) => {
            e.preventDefault();
            if (activeInput) {
                activeInput.value = item.dataset.value;
                activeInput.dispatchEvent(new Event('input', { bubbles: true }));
                dropdownEl.style.display = 'none';
            }
        };
    });
}

// Listeners
document.addEventListener('focusin', async (e) => {
    const el = e.target;
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && !isSecret(el)) {
        activeInput = el;
        if (!indicatorEl) createIndicator();
        if (!dropdownEl) createDropdown();
        
        indicatorEl.style.display = 'flex';
        updateUIPosition(el);
        await loadValues();
        renderDropdown(el.value);
    }
});

document.addEventListener('focusout', (e) => {
    setTimeout(() => {
        if (indicatorEl) indicatorEl.style.display = 'none';
        if (dropdownEl) dropdownEl.style.display = 'none';
    }, 200);
});

document.addEventListener('input', (e) => {
    const el = e.target;
    if (activeInput === el) {
        updateUIPosition(el);
        renderDropdown(el.value);
        
        // Debounce simple para guardar
        clearTimeout(el._jsTimer);
        el._jsTimer = setTimeout(() => handleValueSave(el.value), 1000);
    }
});

window.addEventListener('scroll', () => {
    if (activeInput) updateUIPosition(activeInput);
}, true);
