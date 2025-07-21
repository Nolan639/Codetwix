// ====================================
// CODETWIX v2.0 - Advanced Text Converter
// ====================================

// DOM Elements
const elements = {
    // Mode and Controls
    conversionMode: document.getElementById('conversionMode'),
    customDropdown: document.getElementById('customDropdown'),
    dropdownTrigger: document.getElementById('dropdownTrigger'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    selectedOption: document.querySelector('.selected-option'),
    
    // Theme and Font Controls
    themeSelector: document.getElementById('themeSelector'),
    fontSelector: document.getElementById('fontSelector'),
    
    // Auto-Detection
    detectedFormat: document.getElementById('detectedFormat'),
    confidenceBar: document.getElementById('confidenceBar'),
    confidenceText: document.getElementById('confidenceText'),
    overrideDetection: document.getElementById('overrideDetection'),
    
    // Cipher Controls
    caesarControls: document.getElementById('caesarControls'),
    caesarShift: document.getElementById('caesarShift'),
    caesarDirection: document.getElementById('caesarDirection'),
    showBruteForce: document.getElementById('showBruteForce'),
    
    vigenereControls: document.getElementById('vigenereControls'),
    vigenereKey: document.getElementById('vigenereKey'),
    vigenereDirection: document.getElementById('vigenereDirection'),
    
    affineControls: document.getElementById('affineControls'),
    affineA: document.getElementById('affineA'),
    affineB: document.getElementById('affineB'),
    affineDirection: document.getElementById('affineDirection'),
    
    playfairControls: document.getElementById('playfairControls'),
    playfairKey: document.getElementById('playfairKey'),
    playfairDirection: document.getElementById('playfairDirection'),
    showMatrix: document.getElementById('showMatrix'),
    
    xorControls: document.getElementById('xorControls'),
    xorKey: document.getElementById('xorKey'),
    xorDirection: document.getElementById('xorDirection'),
    
    // Panels
    bruteForcePanel: document.getElementById('bruteForcePanel'),
    bruteForceResults: document.getElementById('bruteForceResults'),
    closeBruteForce: document.getElementById('closeBruteForce'),
    matrixPanel: document.getElementById('matrixPanel'),
    matrixDisplay: document.getElementById('matrixDisplay'),
    closeMatrix: document.getElementById('closeMatrix'),
    
    // Input/Output
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    inputStats: document.getElementById('inputStats'),
    inputAnalysis: document.getElementById('inputAnalysis'),
    letterPercent: document.getElementById('letterPercent'),
    numberPercent: document.getElementById('numberPercent'),
    symbolPercent: document.getElementById('symbolPercent'),
    asciiBreakdown: document.getElementById('asciiBreakdown'),
    
    // Tools
    copyBtn: document.getElementById('copyBtn'),
    shareBtn: document.getElementById('shareBtn'),
    qrBtn: document.getElementById('qrBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    
    // History
    historyContainer: document.getElementById('historyContainer'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    
    // Modals
    qrModal: document.getElementById('qrModal'),
    qrCanvas: document.getElementById('qrCanvas'),
    downloadQr: document.getElementById('downloadQr'),
    closeQrModal: document.getElementById('closeQrModal'),
    shareModal: document.getElementById('shareModal'),
    shareLink: document.getElementById('shareLink'),
    copyShareLink: document.getElementById('copyShareLink'),
    closeShareModal: document.getElementById('closeShareModal'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Application State
const state = {
    currentTheme: localStorage.getItem('codetwix-theme') || 'dark',
    currentFont: localStorage.getItem('codetwix-font') || 'monospace',
    history: JSON.parse(localStorage.getItem('codetwix-history') || '[]'),
    favorites: new Set(JSON.parse(localStorage.getItem('codetwix-favorites') || '[]')),
    autoDetectionEnabled: true,
    debounceTimer: null
};

// Conversion Functions Library
const converters = {
    // Basic Conversions
    textToBinary: (text) => text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
    binaryToText: (binary) => {
        const cleanBinary = binary.replace(/[^01\s]/g, '').trim();
        if (!cleanBinary) throw new Error('Invalid binary input');
        const binaryArray = cleanBinary.includes(' ') ? cleanBinary.split(/\s+/) : cleanBinary.match(/.{1,8}/g) || [];
        return binaryArray.map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
    },
    
    textToMorse: (text) => {
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
        return text.toUpperCase().split('').map(char => MORSE_CODE[char] || char).join(' ');
    },
    
    morseToText: (morse) => {
        const REVERSE_MORSE = {
            '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F',
            '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L',
            '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R',
            '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
            '-.--': 'Y', '--..': 'Z', '/': ' '
        };
        return morse.split(' ').map(code => REVERSE_MORSE[code] || code).join('');
    },
    
    textToHex: (text) => text.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase(),
    hexToText: (hex) => {
        const cleanHex = hex.replace(/[^0-9A-Fa-f\s]/g, '');
        if (!cleanHex) throw new Error('Invalid hex input');
        const hexArray = cleanHex.includes(' ') ? cleanHex.split(/\s+/) : cleanHex.match(/.{1,2}/g) || [];
        return hexArray.map(h => String.fromCharCode(parseInt(h, 16))).join('');
    },
    
    // Encoding & Decoding
    textToBase64: (text) => btoa(unescape(encodeURIComponent(text))),
    base64ToText: (base64) => decodeURIComponent(escape(atob(base64))),
    
    textToBase32: (text) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        for (let i = 0; i < text.length; i++) {
            bits += text.charCodeAt(i).toString(2).padStart(8, '0');
        }
        let result = '';
        for (let i = 0; i < bits.length; i += 5) {
            const chunk = bits.substr(i, 5).padEnd(5, '0');
            result += alphabet[parseInt(chunk, 2)];
        }
        return result;
    },
    
    base32ToText: (base32) => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        for (let i = 0; i < base32.length; i++) {
            const index = alphabet.indexOf(base32[i].toUpperCase());
            if (index !== -1) {
                bits += index.toString(2).padStart(5, '0');
            }
        }
        let result = '';
        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.substr(i, 8);
            if (byte.length === 8) {
                result += String.fromCharCode(parseInt(byte, 2));
            }
        }
        return result;
    },
    
    textToBase58: (text) => {
        const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        const bytes = new TextEncoder().encode(text);
        let num = BigInt(0);
        for (let byte of bytes) {
            num = num * BigInt(256) + BigInt(byte);
        }
        let result = '';
        while (num > 0) {
            result = alphabet[Number(num % BigInt(58))] + result;
            num = num / BigInt(58);
        }
        return result || '1';
    },
    
    base58ToText: (base58) => {
        const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let num = BigInt(0);
        for (let char of base58) {
            const index = alphabet.indexOf(char);
            if (index === -1) throw new Error('Invalid Base58 character');
            num = num * BigInt(58) + BigInt(index);
        }
        const bytes = [];
        while (num > 0) {
            bytes.unshift(Number(num % BigInt(256)));
            num = num / BigInt(256);
        }
        return new TextDecoder().decode(new Uint8Array(bytes));
    },
    
    urlEncode: (text) => encodeURIComponent(text),
    urlDecode: (text) => decodeURIComponent(text),
    
    // Advanced Ciphers
    caesarCipher: (text, shift, encrypt = true) => {
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
    },
    
    rot13: (text) => converters.caesarCipher(text, 13, true),
    
    vigenereCipher: (text, key, encrypt = true) => {
        if (!key) throw new Error('Keyword required for Vigenère cipher');
        const keyUpper = key.toUpperCase();
        let keyIndex = 0;
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const isUpperCase = char === char.toUpperCase();
                const charCode = char.toUpperCase().charCodeAt(0) - 65;
                const keyChar = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
                const shifted = encrypt ? (charCode + keyChar) % 26 : (charCode - keyChar + 26) % 26;
                keyIndex++;
                const result = String.fromCharCode(shifted + 65);
                return isUpperCase ? result : result.toLowerCase();
            }
            return char;
        }).join('');
    },
    
    affineCipher: (text, a, b, encrypt = true) => {
        const modInverse = (a, m) => {
            for (let i = 1; i < m; i++) {
                if ((a * i) % m === 1) return i;
            }
            throw new Error('Invalid key A (no modular inverse)');
        };
        
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const isUpperCase = char === char.toUpperCase();
                const x = char.toUpperCase().charCodeAt(0) - 65;
                let y;
                if (encrypt) {
                    y = (a * x + b) % 26;
                } else {
                    const aInv = modInverse(a, 26);
                    y = (aInv * (x - b + 26)) % 26;
                }
                const result = String.fromCharCode(y + 65);
                return isUpperCase ? result : result.toLowerCase();
            }
            return char;
        }).join('');
    },
    
    playfairCipher: (text, key, encrypt = true) => {
        if (!key) throw new Error('Keyword required for Playfair cipher');
        
        // Create 5x5 matrix
        const createMatrix = (key) => {
            const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // J is combined with I
            const used = new Set();
            const matrix = [];
            
            // Add key letters first
            for (let char of key.toUpperCase()) {
                if (char === 'J') char = 'I';
                if (alphabet.includes(char) && !used.has(char)) {
                    matrix.push(char);
                    used.add(char);
                }
            }
            
            // Add remaining letters
            for (let char of alphabet) {
                if (!used.has(char)) {
                    matrix.push(char);
                }
            }
            
            // Convert to 5x5 grid
            const grid = [];
            for (let i = 0; i < 5; i++) {
                grid.push(matrix.slice(i * 5, (i + 1) * 5));
            }
            return grid;
        };
        
        const matrix = createMatrix(key);
        
        // Find position of character in matrix
        const findPos = (char) => {
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    if (matrix[i][j] === char) return [i, j];
                }
            }
            return null;
        };
        
        // Prepare text
        let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        let pairs = [];
        
        for (let i = 0; i < cleanText.length; i += 2) {
            let first = cleanText[i];
            let second = cleanText[i + 1] || 'X';
            if (first === second) {
                second = 'X';
                i--; // Process the repeated character again
            }
            pairs.push([first, second]);
        }
        
        // Encrypt/decrypt pairs
        let result = '';
        for (let [a, b] of pairs) {
            const [row1, col1] = findPos(a);
            const [row2, col2] = findPos(b);
            
            if (row1 === row2) {
                // Same row
                if (encrypt) {
                    result += matrix[row1][(col1 + 1) % 5] + matrix[row2][(col2 + 1) % 5];
                } else {
                    result += matrix[row1][(col1 + 4) % 5] + matrix[row2][(col2 + 4) % 5];
                }
            } else if (col1 === col2) {
                // Same column
                if (encrypt) {
                    result += matrix[(row1 + 1) % 5][col1] + matrix[(row2 + 1) % 5][col2];
                } else {
                    result += matrix[(row1 + 4) % 5][col1] + matrix[(row2 + 4) % 5][col2];
                }
            } else {
                // Rectangle
                result += matrix[row1][col2] + matrix[row2][col1];
            }
        }
        
        return result;
    },
    
    xorEncryption: (text, key) => {
        if (!key) throw new Error('Key required for XOR encryption');
        return text.split('').map((char, i) => {
            const textCode = char.charCodeAt(0);
            const keyCode = key.charCodeAt(i % key.length);
            return String.fromCharCode(textCode ^ keyCode);
        }).join('');
    }
};

// Auto-Detection Functions
const autoDetector = {
    detectFormat: (text) => {
        if (!text.trim()) return { format: 'None', confidence: 0 };
        
        const detections = [
            { format: 'Binary', confidence: autoDetector.isBinary(text) },
            { format: 'Base64', confidence: autoDetector.isBase64(text) },
            { format: 'Hexadecimal', confidence: autoDetector.isHex(text) },
            { format: 'Morse Code', confidence: autoDetector.isMorse(text) },
            { format: 'URL Encoded', confidence: autoDetector.isUrlEncoded(text) },
            { format: 'ROT13', confidence: autoDetector.isRot13(text) }
        ];
        
        const best = detections.reduce((a, b) => a.confidence > b.confidence ? a : b);
        return best.confidence > 0.5 ? best : { format: 'Plain Text', confidence: 0.8 };
    },
    
    isBinary: (text) => {
        const cleaned = text.replace(/\s/g, '');
        if (!/^[01]+$/.test(cleaned)) return 0;
        return cleaned.length % 8 === 0 ? 0.9 : 0.7;
    },
    
    isBase64: (text) => {
        try {
            const cleaned = text.replace(/\s/g, '');
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) return 0;
            atob(cleaned);
            return 0.9;
        } catch {
            return 0;
        }
    },
    
    isHex: (text) => {
        const cleaned = text.replace(/\s/g, '');
        if (!/^[0-9A-Fa-f]+$/.test(cleaned)) return 0;
        return cleaned.length % 2 === 0 ? 0.9 : 0.7;
    },
    
    isMorse: (text) => {
        const morsePattern = /^[.\-\s\/]+$/;
        return morsePattern.test(text) ? 0.8 : 0;
    },
    
    isUrlEncoded: (text) => {
        const urlPattern = /%[0-9A-Fa-f]{2}/;
        return urlPattern.test(text) ? 0.8 : 0;
    },
    
    isRot13: (text) => {
        // Simple heuristic: check if decoding ROT13 produces more common English words
        const decoded = converters.rot13(text);
        const commonWords = ['the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his', 'they'];
        const matches = commonWords.filter(word => decoded.toLowerCase().includes(word)).length;
        return matches > 0 ? Math.min(matches * 0.2, 0.8) : 0;
    }
};

// Text Analysis Functions
const textAnalyzer = {
    getStats: (text) => {
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const bits = chars * 8;
        
        let letters = 0, numbers = 0, symbols = 0;
        for (let char of text) {
            if (/[a-zA-Z]/.test(char)) letters++;
            else if (/[0-9]/.test(char)) numbers++;
            else symbols++;
        }
        
        const total = letters + numbers + symbols || 1;
        return {
            chars,
            words,
            bits,
            letterPercent: Math.round((letters / total) * 100),
            numberPercent: Math.round((numbers / total) * 100),
            symbolPercent: Math.round((symbols / total) * 100)
        };
    },
    
    getAsciiBreakdown: (text) => {
        const breakdown = {};
        for (let char of text) {
            const ascii = char.charCodeAt(0);
            const hex = ascii.toString(16).toUpperCase().padStart(2, '0');
            const binary = ascii.toString(2).padStart(8, '0');
            breakdown[char] = { ascii, hex, binary };
        }
        return breakdown;
    }
};

// Theme Management
const themeManager = {
    setTheme: (theme) => {
        document.body.setAttribute('data-theme', theme);
        state.currentTheme = theme;
        localStorage.setItem('codetwix-theme', theme);
        elements.themeSelector.value = theme;
    },
    
    setFont: (font) => {
        document.body.setAttribute('data-font', font);
        state.currentFont = font;
        localStorage.setItem('codetwix-font', font);
        elements.fontSelector.value = font;
    }
};

// History Management
const historyManager = {
    add: (mode, input, output) => {
        const item = {
            id: Date.now(),
            mode,
            input: input.substring(0, 200),
            output: output.substring(0, 200),
            timestamp: new Date().toLocaleString(),
            favorite: false
        };
        
        state.history.unshift(item);
        if (state.history.length > 10) {
            state.history = state.history.slice(0, 10);
        }
        
        localStorage.setItem('codetwix-history', JSON.stringify(state.history));
        historyManager.render();
    },
    
    render: () => {
        if (state.history.length === 0) {
            elements.historyContainer.innerHTML = '<p class="no-history">No recent conversions</p>';
            return;
        }
        
        const historyHTML = state.history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-header">
                    <div class="history-mode">${getModeDisplayName(item.mode)}</div>
                    <div class="history-actions">
                        <button class="history-btn star-btn ${state.favorites.has(item.id) ? 'starred' : ''}" 
                                onclick="historyManager.toggleFavorite(${item.id})" title="Star">⭐</button>
                        <button class="history-btn copy-btn" 
                                onclick="historyManager.copyItem(${item.id})" title="Copy">📋</button>
                    </div>
                </div>
                <div class="history-preview" onclick="historyManager.loadItem(${item.id})">${escapeHtml(item.input)}</div>
                <div class="history-timestamp">${item.timestamp}</div>
            </div>
        `).join('');
        
        elements.historyContainer.innerHTML = historyHTML;
    },
    
    loadItem: (id) => {
        const item = state.history.find(h => h.id === id);
        if (item) {
            elements.inputText.value = item.input;
            elements.outputText.value = item.output;
            // Set the correct mode
            const modeOption = elements.dropdownMenu.querySelector(`[data-value="${item.mode}"]`);
            if (modeOption) {
                selectOption(modeOption);
            }
        }
    },
    
    copyItem: (id) => {
        const item = state.history.find(h => h.id === id);
        if (item) {
            copyToClipboard(item.output);
        }
    },
    
    toggleFavorite: (id) => {
        if (state.favorites.has(id)) {
            state.favorites.delete(id);
        } else {
            state.favorites.add(id);
        }
        localStorage.setItem('codetwix-favorites', JSON.stringify([...state.favorites]));
        historyManager.render();
    },
    
    clear: () => {
        const historyItems = elements.historyContainer.querySelectorAll('.history-item');
        historyItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'fadeOutRight 0.4s ease-out forwards';
            }, index * 100);
        });
        
        setTimeout(() => {
            state.history = [];
            state.favorites.clear();
            localStorage.removeItem('codetwix-history');
            localStorage.removeItem('codetwix-favorites');
            historyManager.render();
            showToast('History cleared! 🧹', 'success');
        }, (historyItems.length * 100) + 400);
    }
};

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getModeDisplayName(mode) {
    const names = {
        textToBinary: 'Text → Binary',
        binaryToText: 'Binary → Text',
        textToMorse: 'Text → Morse',
        morseToText: 'Morse → Text',
        textToBase64: 'Text → Base64',
        base64ToText: 'Base64 → Text',
        textToBase32: 'Text → Base32',
        base32ToText: 'Base32 → Text',
        textToBase58: 'Text → Base58',
        base58ToText: 'Base58 → Text',
        textToHex: 'Text → Hex',
        hexToText: 'Hex → Text',
        urlEncode: 'URL Encode',
        urlDecode: 'URL Decode',
        caesarCipher: 'Caesar Cipher',
        rot13: 'ROT13',
        vigenereCipher: 'Vigenère Cipher',
        affineCipher: 'Affine Cipher',
        playfairCipher: 'Playfair Cipher',
        xorEncryption: 'XOR Encryption'
    };
    return names[mode] || mode;
}

function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type} show`;
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

// Conversion Logic
function performConversion() {
    const input = elements.inputText.value;
    const mode = elements.conversionMode.value;
    
    if (!input.trim()) {
        elements.outputText.value = '';
        updateStats('');
        return;
    }
    
    try {
        let output = '';
        
        // Get additional parameters for specific ciphers
        switch (mode) {
            case 'caesarCipher':
                const shift = parseInt(elements.caesarShift.value) || 0;
                const isEncrypt = elements.caesarDirection.dataset.direction === 'encrypt';
                output = converters.caesarCipher(input, shift, isEncrypt);
                break;
            case 'vigenereCipher':
                const vigenereKey = elements.vigenereKey.value;
                const vigenereEncrypt = elements.vigenereDirection.dataset.direction === 'encrypt';
                output = converters.vigenereCipher(input, vigenereKey, vigenereEncrypt);
                break;
            case 'affineCipher':
                const a = parseInt(elements.affineA.value) || 5;
                const b = parseInt(elements.affineB.value) || 8;
                const affineEncrypt = elements.affineDirection.dataset.direction === 'encrypt';
                output = converters.affineCipher(input, a, b, affineEncrypt);
                break;
            case 'playfairCipher':
                const playfairKey = elements.playfairKey.value;
                const playfairEncrypt = elements.playfairDirection.dataset.direction === 'encrypt';
                output = converters.playfairCipher(input, playfairKey, playfairEncrypt);
                break;
            case 'xorEncryption':
                const xorKey = elements.xorKey.value;
                output = converters.xorEncryption(input, xorKey);
                break;
            default:
                if (converters[mode]) {
                    output = converters[mode](input);
                } else {
                    throw new Error('Unknown conversion mode');
                }
        }
        
        elements.outputText.value = output;
        historyManager.add(mode, input, output);
        updateStats(input);
        updateAsciiBreakdown(mode, input);
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        elements.outputText.value = '';
    }
}

// UI Update Functions
function updateStats(text) {
    const stats = textAnalyzer.getStats(text);
    
    const statsElements = elements.inputStats.querySelectorAll('.stat');
    if (statsElements.length >= 3) {
        statsElements[0].textContent = `${stats.chars} chars`;
        statsElements[1].textContent = `${stats.words} words`;
        statsElements[2].textContent = `${stats.bits} bits`;
    }
    
    elements.letterPercent.textContent = `${stats.letterPercent}%`;
    elements.numberPercent.textContent = `${stats.numberPercent}%`;
    elements.symbolPercent.textContent = `${stats.symbolPercent}%`;
}

function updateAsciiBreakdown(mode, text) {
    if (mode === 'textToBinary' || mode === 'textToHex') {
        const breakdown = textAnalyzer.getAsciiBreakdown(text);
        const breakdownHTML = Object.entries(breakdown).map(([char, data]) => 
            `<div>${char}: ASCII ${data.ascii}, Hex ${data.hex}, Binary ${data.binary}</div>`
        ).join('');
        elements.asciiBreakdown.innerHTML = breakdownHTML;
        elements.asciiBreakdown.style.display = 'block';
    } else {
        elements.asciiBreakdown.style.display = 'none';
    }
}

function updateAutoDetection() {
    if (!state.autoDetectionEnabled) return;
    
    const input = elements.inputText.value;
    const detection = autoDetector.detectFormat(input);
    
    elements.detectedFormat.textContent = detection.format;
    elements.confidenceBar.style.setProperty('--confidence', `${detection.confidence * 100}%`);
    elements.confidenceText.textContent = `${Math.round(detection.confidence * 100)}%`;
    
    if (detection.confidence > 0.7 && detection.format !== 'Plain Text') {
        elements.overrideDetection.style.display = 'inline-block';
        elements.overrideDetection.onclick = () => autoSwitchMode(detection.format);
    } else {
        elements.overrideDetection.style.display = 'none';
    }
}

function autoSwitchMode(detectedFormat) {
    const modeMap = {
        'Binary': 'binaryToText',
        'Base64': 'base64ToText',
        'Hexadecimal': 'hexToText',
        'Morse Code': 'morseToText',
        'URL Encoded': 'urlDecode',
        'ROT13': 'rot13'
    };
    
    const mode = modeMap[detectedFormat];
    if (mode) {
        const option = elements.dropdownMenu.querySelector(`[data-value="${mode}"]`);
        if (option) {
            selectOption(option);
            performConversion();
        }
    }
}

// Dropdown Management
function initializeCustomDropdown() {
    if (!elements.dropdownTrigger || !elements.dropdownMenu) return;
    
    let isOpen = false;
    
    elements.dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
    });
    
    elements.dropdownMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('dropdown-option')) {
            selectOption(e.target);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!elements.customDropdown.contains(e.target) && isOpen) {
            closeDropdown();
        }
    });
    
    function toggleDropdown() {
        isOpen ? closeDropdown() : openDropdown();
    }
    
    function openDropdown() {
        isOpen = true;
        elements.dropdownTrigger.classList.add('active');
        elements.dropdownMenu.classList.add('show');
    }
    
    function closeDropdown() {
        isOpen = false;
        elements.dropdownTrigger.classList.remove('active');
        elements.dropdownMenu.classList.remove('show');
    }
    
    window.selectOption = function(option) {
        const value = option.dataset.value;
        const text = option.textContent;
        
        elements.selectedOption.textContent = text;
        elements.conversionMode.value = value;
        
        elements.dropdownMenu.querySelectorAll('.dropdown-option').forEach(opt => 
            opt.classList.remove('selected'));
        option.classList.add('selected');
        
        closeDropdown();
        toggleCipherControls();
        performConversion();
    };
    
    // Initialize first option
    const firstOption = elements.dropdownMenu.querySelector('.dropdown-option');
    if (firstOption) {
        firstOption.classList.add('selected');
    }
}

function toggleCipherControls() {
    const mode = elements.conversionMode.value;
    
    // Hide all controls first
    [elements.caesarControls, elements.vigenereControls, elements.affineControls, 
     elements.playfairControls, elements.xorControls].forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    // Show relevant controls
    const controlMap = {
        caesarCipher: elements.caesarControls,
        vigenereCipher: elements.vigenereControls,
        affineCipher: elements.affineControls,
        playfairCipher: elements.playfairControls,
        xorEncryption: elements.xorControls
    };
    
    if (controlMap[mode]) {
        controlMap[mode].style.display = 'flex';
    }
}

// Advanced Features
function generateBruteForce() {
    const input = elements.inputText.value;
    if (!input) return;
    
    let resultsHTML = '';
    for (let shift = 1; shift <= 25; shift++) {
        const result = converters.caesarCipher(input, shift, false);
        resultsHTML += `
            <div class="brute-force-item" onclick="selectBruteForceResult('${escapeHtml(result)}')">
                <span>Shift ${shift}:</span>
                <span>${escapeHtml(result.substring(0, 50))}${result.length > 50 ? '...' : ''}</span>
            </div>
        `;
    }
    elements.bruteForceResults.innerHTML = resultsHTML;
    elements.bruteForcePanel.style.display = 'block';
}

function selectBruteForceResult(result) {
    elements.outputText.value = result;
    elements.bruteForcePanel.style.display = 'none';
}

function generatePlayfairMatrix() {
    const key = elements.playfairKey.value;
    if (!key) {
        showToast('Please enter a keyword first', 'error');
        return;
    }
    
    // Generate matrix logic (simplified)
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    const used = new Set();
    const matrix = [];
    
    for (let char of key.toUpperCase()) {
        if (char === 'J') char = 'I';
        if (alphabet.includes(char) && !used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }
    
    for (let char of alphabet) {
        if (!used.has(char)) {
            matrix.push(char);
        }
    }
    
    let matrixHTML = '<div class="playfair-matrix">';
    for (let i = 0; i < 25; i++) {
        matrixHTML += `<div class="matrix-cell">${matrix[i]}</div>`;
    }
    matrixHTML += '</div>';
    
    elements.matrixDisplay.innerHTML = matrixHTML;
    elements.matrixPanel.style.display = 'block';
}

// Download and Share Functions
async function copyToClipboard(text = null) {
    const textToCopy = text || elements.outputText.value;
    if (!textToCopy) {
        showToast('Nothing to copy', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Copied to clipboard! 📋', 'success');
    } catch (err) {
        showToast('Copy failed', 'error');
    }
}

function downloadFile(format) {
    const text = elements.outputText.value;
    if (!text) {
        showToast('Nothing to download', 'error');
        return;
    }
    
    const mode = getModeDisplayName(elements.conversionMode.value);
    let content, mimeType, extension;
    
    switch (format) {
        case 'txt':
            content = text;
            mimeType = 'text/plain';
            extension = 'txt';
            break;
        case 'csv':
            content = `"Input","Output","Mode","Timestamp"\n"${elements.inputText.value}","${text}","${mode}","${new Date().toLocaleString()}"`;
            mimeType = 'text/csv';
            extension = 'csv';
            break;
        case 'json':
            content = JSON.stringify({
                input: elements.inputText.value,
                output: text,
                mode: mode,
                timestamp: new Date().toISOString()
            }, null, 2);
            mimeType = 'application/json';
            extension = 'json';
            break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codetwix-${mode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded as ${extension.toUpperCase()}! 📥`, 'success');
}

function generateShareLink() {
    const data = {
        input: elements.inputText.value,
        mode: elements.conversionMode.value,
        timestamp: Date.now()
    };
    
    const encoded = btoa(JSON.stringify(data));
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    
    elements.shareLink.value = shareUrl;
    elements.shareModal.style.display = 'flex';
}

function generateQRCode() {
    const text = elements.outputText.value;
    if (!text) {
        showToast('Nothing to encode in QR', 'error');
        return;
    }
    
    // Simple QR code generation (you might want to use a library like qrcode.js)
    const canvas = elements.qrCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    // Placeholder QR code pattern
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('QR Code for:', 10, 20);
    ctx.fillText(text.substring(0, 20), 10, 40);
    ctx.fillText('(Use QR library)', 10, 180);
    
    elements.qrModal.style.display = 'flex';
}

// Event Listeners Setup
function initializeEventListeners() {
    // Theme and Font Controls
    elements.themeSelector?.addEventListener('change', (e) => themeManager.setTheme(e.target.value));
    elements.fontSelector?.addEventListener('change', (e) => themeManager.setFont(e.target.value));
    
    // Input handling with real-time conversion
    elements.inputText?.addEventListener('input', () => {
        clearTimeout(state.debounceTimer);
        state.debounceTimer = setTimeout(() => {
            performConversion();
            updateAutoDetection();
        }, 300);
    });
    
    // Cipher control buttons
    document.querySelectorAll('.direction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const current = btn.dataset.direction;
            const newDirection = current === 'encrypt' ? 'decrypt' : 'encrypt';
            btn.dataset.direction = newDirection;
            btn.querySelector('span').textContent = newDirection === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt';
            performConversion();
        });
    });
    
    // Advanced features
    elements.showBruteForce?.addEventListener('click', generateBruteForce);
    elements.showMatrix?.addEventListener('click', generatePlayfairMatrix);
    
    // Panel controls
    elements.closeBruteForce?.addEventListener('click', () => elements.bruteForcePanel.style.display = 'none');
    elements.closeMatrix?.addEventListener('click', () => elements.matrixPanel.style.display = 'none');
    
    // Tool buttons
    elements.copyBtn?.addEventListener('click', () => copyToClipboard());
    elements.shareBtn?.addEventListener('click', generateShareLink);
    elements.qrBtn?.addEventListener('click', generateQRCode);
    
    // Download menu
    document.querySelectorAll('[data-format]').forEach(btn => {
        btn.addEventListener('click', () => downloadFile(btn.dataset.format));
    });
    
    // History
    elements.clearHistoryBtn?.addEventListener('click', historyManager.clear);
    
    // Modal controls
    elements.closeQrModal?.addEventListener('click', () => elements.qrModal.style.display = 'none');
    elements.closeShareModal?.addEventListener('click', () => elements.shareModal.style.display = 'none');
    elements.copyShareLink?.addEventListener('click', () => copyToClipboard(elements.shareLink.value));
    
    // Cipher parameter changes
    [elements.caesarShift, elements.vigenereKey, elements.affineA, elements.affineB, 
     elements.playfairKey, elements.xorKey].forEach(input => {
        input?.addEventListener('input', () => {
            clearTimeout(state.debounceTimer);
            state.debounceTimer = setTimeout(performConversion, 500);
        });
    });
}

// Initialization
function initializeApp() {
    // Set initial theme and font
    themeManager.setTheme(state.currentTheme);
    themeManager.setFont(state.currentFont);
    
    // Initialize components
    initializeCustomDropdown();
    toggleCipherControls();
    historyManager.render();
    initializeEventListeners();
    
    // Handle shared links
    const urlParams = new URLSearchParams(window.location.search);
    const shared = urlParams.get('share');
    if (shared) {
        try {
            const data = JSON.parse(atob(shared));
            elements.inputText.value = data.input;
            elements.conversionMode.value = data.mode;
            const option = elements.dropdownMenu.querySelector(`[data-value="${data.mode}"]`);
            if (option) selectOption(option);
            performConversion();
        } catch (e) {
            console.error('Invalid share link');
        }
    }
    
    // Welcome message
    setTimeout(() => {
        showToast('Welcome to Codetwix v2.0! 🚀', 'success');
    }, 1000);
}

// Global function assignments for HTML onclick handlers
window.historyManager = historyManager;
window.selectBruteForceResult = selectBruteForceResult;

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);
