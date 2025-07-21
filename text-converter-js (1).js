// Text Converter Application
// A comprehensive tool for converting between various text encodings and ciphers

// DOM Elements
const elements = {
    // Mode and Controls
    conversionMode: document.getElementById('conversionMode'),
    caesarControls: document.getElementById('caesarControls'),
    caesarShift: document.getElementById('caesarShift'),
    caesarDirection: document.getElementById('caesarDirection'),
    
    // Input/Output
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    convertBtn: document.getElementById('convertBtn'),
    btnText: document.querySelector('.btn-text'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    
    // Utility Buttons
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    
    // History
    historyContainer: document.getElementById('historyContainer'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Application State
const state = {
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    history: JSON.parse(localStorage.getItem('conversionHistory') || '[]'),
    isConverting: false
};

// Morse Code Dictionary
const MORSE_CODE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.',
    ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
    '@': '.--.-.'
};

// Reverse Morse Code Dictionary
const REVERSE_MORSE = Object.fromEntries(
    Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

// ===================
// CONVERSION FUNCTIONS
// ===================

/**
 * Convert text to binary representation
 */
function textToBinary(text) {
    return text.split('').map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
}

/**
 * Convert binary to text
 */
function binaryToText(binary) {
    // Clean up binary string (remove extra spaces, non-binary characters)
    const cleanBinary = binary.replace(/[^01\s]/g, '').trim();
    
    if (!cleanBinary) {
        throw new Error('Invalid binary input');
    }
    
    // Split by spaces or every 8 characters if no spaces
    let binaryArray;
    if (cleanBinary.includes(' ')) {
        binaryArray = cleanBinary.split(/\s+/);
    } else {
        binaryArray = cleanBinary.match(/.{1,8}/g) || [];
    }
    
    return binaryArray.map(bin => {
        const decimal = parseInt(bin, 2);
        if (isNaN(decimal)) {
            throw new Error('Invalid binary sequence');
        }
        return String.fromCharCode(decimal);
    }).join('');
}

/**
 * Convert text to Morse code
 */
function textToMorse(text) {
    return text.toUpperCase().split('').map(char => {
        return MORSE_CODE[char] || char;
    }).join(' ');
}

/**
 * Convert Morse code to text
 */
function morseToText(morse) {
    return morse.split(' ').map(code => {
        return REVERSE_MORSE[code] || code;
    }).join('');
}

/**
 * Convert text to Base64
 */
function textToBase64(text) {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
        throw new Error('Failed to encode to Base64');
    }
}

/**
 * Convert Base64 to text
 */
function base64ToText(base64) {
    try {
        return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
        throw new Error('Invalid Base64 input');
    }
}

/**
 * Convert text to hexadecimal
 */
function textToHex(text) {
    return text.split('').map(char => 
        char.charCodeAt(0).toString(16).padStart(2, '0')
    ).join(' ').toUpperCase();
}

/**
 * Convert hexadecimal to text
 */
function hexToText(hex) {
    // Clean hex input
    const cleanHex = hex.replace(/[^0-9A-Fa-f\s]/g, '');
    
    if (!cleanHex) {
        throw new Error('Invalid hexadecimal input');
    }
    
    // Split by spaces or every 2 characters
    let hexArray;
    if (cleanHex.includes(' ')) {
        hexArray = cleanHex.split(/\s+/);
    } else {
        hexArray = cleanHex.match(/.{1,2}/g) || [];
    }
    
    return hexArray.map(hex => {
        const decimal = parseInt(hex, 16);
        if (isNaN(decimal)) {
            throw new Error('Invalid hex sequence');
        }
        return String.fromCharCode(decimal);
    }).join('');
}

/**
 * Caesar cipher implementation
 */
function caesarCipher(text, shift, encrypt = true) {
    const direction = encrypt ? 1 : -1;
    const actualShift = (shift * direction + 26) % 26;
    
    return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            const isUpperCase = char === char.toUpperCase();
            const charCode = char.toLowerCase().charCodeAt(0);
            const shifted = ((charCode - 97 + actualShift) % 26) + 97;
            const result = String.fromCharCode(shifted);
            return isUpperCase ? result.toUpperCase() : result;
        }
        return char;
    }).join('');
}

/**
 * ROT13 cipher (special case of Caesar cipher)
 */
function rot13(text) {
    return caesarCipher(text, 13, true);
}

// ===================
// UI HELPER FUNCTIONS
// ===================

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

/**
 * Update placeholder text based on current mode
 */
function updatePlaceholder() {
    const mode = elements.conversionMode.value;
    const placeholders = {
        textToBinary: 'Enter text to convert to binary...',
        binaryToText: 'Enter binary code (e.g., 01001000 01100101 01101100 01101100 01101111)',
        textToMorse: 'Enter text to convert to Morse code...',
        morseToText: 'Enter Morse code (e.g., .... . .-.. .-.. ---)',
        textToBase64: 'Enter text to encode in Base64...',
        base64ToText: 'Enter Base64 encoded text to decode...',
        textToHex: 'Enter text to convert to hexadecimal...',
        hexToText: 'Enter hexadecimal values (e.g., 48 65 6C 6C 6F)',
        caesarCipher: 'Enter text to encrypt/decrypt with Caesar cipher...',
        rot13: 'Enter text to apply ROT13 cipher...'
    };
    
    elements.inputText.placeholder = placeholders[mode] || 'Enter your text here...';
}

/**
 * Toggle Caesar cipher controls visibility
 */
function toggleCaesarControls() {
    const mode = elements.conversionMode.value;
    elements.caesarControls.style.display = mode === 'caesarCipher' ? 'flex' : 'none';
}

/**
 * Toggle loading state
 */
function setLoadingState(isLoading) {
    state.isConverting = isLoading;
    elements.btnText.style.display = isLoading ? 'none' : 'inline';
    elements.loadingSpinner.style.display = isLoading ? 'block' : 'none';
    elements.convertBtn.disabled = isLoading;
}

/**
 * Add conversion to history
 */
function addToHistory(mode, input, output) {
    const historyItem = {
        mode: mode,
        input: input.substring(0, 100), // Truncate for storage
        output: output.substring(0, 100),
        timestamp: new Date().toLocaleString()
    };
    
    // Add to beginning of array
    state.history.unshift(historyItem);
    
    // Keep only last 10 items
    if (state.history.length > 10) {
        state.history = state.history.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('conversionHistory', JSON.stringify(state.history));
    
    // Update UI
    renderHistory();
}

/**
 * Render history items
 */
function renderHistory() {
    if (state.history.length === 0) {
        elements.historyContainer.innerHTML = '<p class="no-history">No recent conversions</p>';
        return;
    }
    
    const historyHTML = state.history.map(item => `
        <div class="history-item" data-input="${escapeHtml(item.input)}" data-output="${escapeHtml(item.output)}">
            <div class="history-mode">${getModeDisplayName(item.mode)}</div>
            <div class="history-preview">${escapeHtml(item.input)}</div>
            <div class="history-timestamp">${item.timestamp}</div>
        </div>
    `).join('');
    
    elements.historyContainer.innerHTML = historyHTML;
    
    // Add click listeners to history items
    elements.historyContainer.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            elements.inputText.value = item.dataset.input;
            elements.outputText.value = item.dataset.output;
        });
    });
}

/**
 * Get display name for conversion mode
 */
function getModeDisplayName(mode) {
    const names = {
        textToBinary: 'Text → Binary',
        binaryToText: 'Binary → Text',
        textToMorse: 'Text → Morse',
        morseToText: 'Morse → Text',
        textToBase64: 'Text → Base64',
        base64ToText: 'Base64 → Text',
        textToHex: 'Text → Hex',
        hexToText: 'Hex → Text',
        caesarCipher: 'Caesar Cipher',
        rot13: 'ROT13'
    };
    return names[mode] || mode;
}

/**
 * Escape HTML for safe display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Clear all history
 */
function clearHistory() {
    state.history = [];
    localStorage.removeItem('conversionHistory');
    renderHistory();
    showToast('History cleared', 'success');
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', state.isDarkMode.toString());
    
    // Update dark mode icon
    const icon = elements.darkModeToggle.querySelector('span');
    icon.textContent = state.isDarkMode ? '☀️' : '🌙';
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard() {
    const text = elements.outputText.value;
    if (!text) {
        showToast('Nothing to copy', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        elements.outputText.select();
        document.execCommand('copy');
        showToast('Copied to clipboard!', 'success');
    }
}

/**
 * Download output as text file
 */
function downloadAsFile() {
    const text = elements.outputText.value;
    if (!text) {
        showToast('Nothing to download', 'error');
        return;
    }
    
    const mode = getModeDisplayName(elements.conversionMode.value);
    const filename = `converted-${mode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showToast('File downloaded!', 'success');
}

// ===================
// MAIN CONVERSION LOGIC
// ===================

/**
 * Perform the selected conversion
 */
async function performConversion() {
    const input = elements.inputText.value.trim();
    const mode = elements.conversionMode.value;
    
    if (!input) {
        showToast('Please enter some text to convert', 'error');
        return;
    }
    
    setLoadingState(true);
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        let output = '';
        
        switch (mode) {
            case 'textToBinary':
                output = textToBinary(input);
                break;
            case 'binaryToText':
                output = binaryToText(input);
                break;
            case 'textToMorse':
                output = textToMorse(input);
                break;
            case 'morseToText':
                output = morseToText(input);
                break;
            case 'textToBase64':
                output = textToBase64(input);
                break;
            case 'base64ToText':
                output = base64ToText(input);
                break;
            case 'textToHex':
                output = textToHex(input);
                break;
            case 'hexToText':
                output = hexToText(input);
                break;
            case 'caesarCipher':
                const shift = parseInt(elements.caesarShift.value) || 0;
                const isEncrypt = elements.caesarDirection.dataset.direction === 'encrypt';
                output = caesarCipher(input, shift, isEncrypt);
                break;
            case 'rot13':
                output = rot13(input);
                break;
            default:
                throw new Error('Unknown conversion mode');
        }
        
        elements.outputText.value = output;
        addToHistory(mode, input, output);
        showToast('Conversion completed!', 'success');
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        elements.outputText.value = '';
    } finally {
        setLoadingState(false);
    }
}

// ===================
// EVENT LISTENERS
// ===================

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Mode selection change
    elements.conversionMode.addEventListener('change', () => {
        updatePlaceholder();
        toggleCaesarControls();
        elements.inputText.value = '';
        elements.outputText.value = '';
    });
    
    // Caesar cipher direction toggle
    elements.caesarDirection.addEventListener('click', () => {
        const current = elements.caesarDirection.dataset.direction;
        const newDirection = current === 'encrypt' ? 'decrypt' : 'encrypt';
        elements.caesarDirection.dataset.direction = newDirection;
        
        const span = elements.caesarDirection.querySelector('span');
        span.textContent = newDirection === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt';
    });
    
    // Convert button
    elements.convertBtn.addEventListener('click', performConversion);
    
    // Enter key in input textarea
    elements.inputText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            performConversion();
        }
    });
    
    // Auto-convert on input change (with debounce)
    let debounceTimer;
    elements.inputText.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (elements.inputText.value.trim() && !state.isConverting) {
                performConversion();
            }
        }, 1000);
    });
    
    // Copy button
    elements.copyBtn.addEventListener('click', copyToClipboard);
    
    // Download button
    elements.downloadBtn.addEventListener('click', downloadAsFile);
    
    // Clear history button
    elements.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the conversion history?')) {
            clearHistory();
        }
    });
    
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Caesar shift input change
    elements.caesarShift.addEventListener('input', () => {
        if (elements.inputText.value.trim()) {
            performConversion();
        }
    });
}

// ===================
// INITIALIZATION
// ===================

/**
 * Initialize the application
 */
function initializeApp() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
    const darkModeIcon = elements.darkModeToggle.querySelector('span');
    darkModeIcon.textContent = state.isDarkMode ? '☀️' : '🌙';
    
    // Initialize UI
    updatePlaceholder();
    toggleCaesarControls();
    renderHistory();
    
    // Setup event listeners
    initializeEventListeners();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to Text Converter! 🔧', 'success');
    }, 500);
}

// ===================
// APPLICATION START
// ===================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page visibility change (pause auto-convert when page is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Clear any pending debounce timers when page becomes hidden
        clearTimeout(debounceTimer);
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus on input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        elements.inputText.focus();
    }
    
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        performConversion();
    }
    
    // Ctrl/Cmd + D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
    }
});

// Export functions for potential external use or testing
window.TextConverter = {
    textToBinary,
    binaryToText,
    textToMorse,
    morseToText,
    textToBase64,
    base64ToText,
    textToHex,
    hexToText,
    caesarCipher,
    rot13
};