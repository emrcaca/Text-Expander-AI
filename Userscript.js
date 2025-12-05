// ==UserScript==
// @name         EmR Text Expander
// @namespace    https://github.com/emrcaca/Text-Expander-AI
// @version      1.5
// @description  Kısayol genişletici + AI desteği (OpenAI API ile)
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      api.openai.com
// ==/UserScript==

(function() {
    "use strict";

    // API Anahtarı Yönetimi
    function getApiKey() {
        let key = GM_getValue('api_key');
        if (!key) {
            key = prompt("Lütfen OpenAI API anahtarınızı girin:");
            if (key) {
                GM_setValue('api_key', key);
            }
        }
        return key;
    }

    const API_KEY = getApiKey();
    if (!API_KEY) {
        console.error("[Text Expander] API anahtarı sağlanmadı. Script devre dışı bırakıldı.");
        return;
    }

    // Sabitler ve Yapılandırmalar
    const EXPANSIONS = {
        "brb": "be right back",
        "omw": "on my way",
        "idk": "I don't know",
        "ty": "thank you",
        "np": "no problem",
        "btw": "by the way",
        "asap": "as soon as possible",
        "gg": "good game"
    };

    const AI_COMMANDS = {
        '-fix': 'Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text without explanations:',
        '-gen': 'Expand and develop the following idea into a more detailed and comprehensive version. Keep the same tone and style:',
        '-imp': 'Improve and enhance the following text by making it clearer, more concise, and more impactful. Maintain the original meaning:',
        '-en': 'Translate the following text to English. Return only the translation without explanations:',
        '-tr': 'Translate the following text to Turkish. Return only the translation without explanations:'
    };

    const AI_CONFIG = {
        API_URL: "https://api.openai.com/v1/chat/completions",
        MODEL: "gpt-3.5-turbo",
        TIMEOUT_MS: 35000,
        MAX_TOKENS: 4096,
        TEMPERATURE: 0.7,
        SYSTEM_PROMPT: "You are a helpful AI assistant. Follow the user's instructions exactly. Your response should be direct and only contain what the user requested - no explanations unless specifically asked. If the user asks you to modify, translate, or transform text, return only the transformed result. Be concise and precise in your responses. Always respond in the same language as the user's request unless asked to translate."
    };

    // Durum Değişkenleri
    let isProcessing = false;
    let currentRequest = null;
    let spinner = null;
    let stylesAdded = false;
    let lastProcessedText = '';
    let lastProcessedElement = null;
    let debounceTimer = null;

    // Tüm kısayolları tek bir dizide toplayıp uzunluğa göre sırala
    const ALL_SHORTCUTS = [
        ...Object.keys(AI_COMMANDS).map(k => ({ key: k, isAI: true })),
        { key: '-ai', isAI: true },
        ...Object.keys(EXPANSIONS).map(k => ({ key: k, isAI: false }))
    ].sort((a, b) => b.key.length - a.key.length);

    // Yardımcı Fonksiyonlar
    const getText = el => el.isContentEditable ? el.textContent : el.value;

    const setTextInputElement = (el, text) => {
        const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")?.set;
        if (setter) {
            setter.call(el, text);
        } else {
            el.value = text;
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el._valueTracker?.setValue(text);
        el.setSelectionRange?.(text.length, text.length);
    };

    const setContentEditable = (el, text) => {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);

        try {
            el.dispatchEvent(new InputEvent("beforeinput", {
                inputType: "deleteContent",
                bubbles: true,
                cancelable: true
            }));
            el.dispatchEvent(new InputEvent("input", {
                inputType: "deleteContent",
                bubbles: true
            }));
            el.dispatchEvent(new InputEvent("beforeinput", {
                inputType: "insertText",
                data: text,
                bubbles: true,
                cancelable: true
            }));
            el.dispatchEvent(new InputEvent("input", {
                inputType: "insertText",
                data: text,
                bubbles: true
            }));
        } catch {
            el.textContent = text;
        }

        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    };

    const findMatchingShortcut = (text) => {
        if (text === lastProcessedText) return null;
        for (const s of ALL_SHORTCUTS) {
            if (text.endsWith(s.key)) {
                return { key: s.key, length: s.key.length, isAI: s.isAI };
            }
        }
        return null;
    };

    // Spinner ve Stil Yönetimi
    const showSpinner = (el) => {
        if (spinner) {
            return Object.assign(spinner.style, {
                top: `${el.getBoundingClientRect().top + el.offsetHeight / 2}px`,
                left: `${el.getBoundingClientRect().left + el.offsetWidth / 2}px`
            });
        }

        spinner = Object.assign(document.body.appendChild(document.createElement('div')), {
            className: 'te-spinner',
            innerHTML: '<div class="te-spinner-circle"></div>'
        });

        const r = el.getBoundingClientRect();
        spinner.style.cssText = `position:fixed;top:${r.top + r.height / 2}px;left:${r.left + r.width / 2}px;transform:translate(-50%,-50%);z-index:10000;pointer-events:none`;
    };

    const hideSpinner = () => {
        if (spinner) {
            spinner.remove();
            spinner = null;
        }
    };

    const addStyles = () => {
        if (stylesAdded) return;

        const style = document.createElement('style');
        style.id = 'te-styles';
        style.textContent = `
            .te-spinner-circle {
                width: 20px;
                height: 20px;
                border: 3px solid rgba(59, 130, 246, 0.2);
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: te-spin 0.8s linear infinite;
            }

            @keyframes te-spin {
                to { transform: rotate(360deg); }
            }

            .te-processing {
                opacity: 0.7 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
        stylesAdded = true;
    };

    // API İletişimi
    const callAI = prompt => new Promise((resolve, reject) => {
        // Önceki isteği iptal et
        if (currentRequest) {
            currentRequest.abort();
        }

        const payload = {
            model: AI_CONFIG.MODEL,
            messages: [
                { role: "system", content: AI_CONFIG.SYSTEM_PROMPT },
                { role: "user", content: String(prompt) }
            ],
            temperature: AI_CONFIG.TEMPERATURE,
            max_tokens: AI_CONFIG.MAX_TOKENS
        };

        currentRequest = GM_xmlhttpRequest({
            method: "POST",
            url: AI_CONFIG.API_URL,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            data: JSON.stringify(payload),
            timeout: AI_CONFIG.TIMEOUT_MS,
            onload: (res) => {
                currentRequest = null;
                if (res.status >= 400) {
                    return reject(new Error(`API Error: ${res.status}`));
                }

                try {
                    const r = JSON.parse(res.responseText).choices?.[0]?.message?.content?.trim();
                    r ? resolve(r) : reject(new Error("Empty AI response"));
                } catch {
                    reject(new Error("Failed to parse AI response"));
                }
            },
            onerror: () => {
                currentRequest = null;
                reject(new Error("Network Error"));
            },
            ontimeout: () => {
                currentRequest = null;
                reject(new Error("Request Timeout"));
            }
        });
    });

    // AI İşleme Fonksiyonları
    const handleAIExpansion = async (el, text, match) => {
        const prompt = text.slice(0, -match.length).trim();
        if (!prompt) return;

        const finalPrompt = AI_COMMANDS[match.key]
            ? `${AI_COMMANDS[match.key]}\n\n${prompt}`
            : prompt;

        el.classList.add('te-processing');
        showSpinner(el);

        try {
            const result = await callAI(finalPrompt);
            if (document.activeElement === el) {
                (el.isContentEditable ? setContentEditable : setTextInputElement)(el, result);
            }
        } catch (e) {
            console.error('[Text Expander] AI Error:', e.message);
            if (document.activeElement === el) {
                (el.isContentEditable ? setContentEditable : setTextInputElement)(el, text);
            }
        } finally {
            hideSpinner();
            el.classList.remove('te-processing');
        }
    };

    // Ana Genişletme Fonksiyonu
    const expand = () => {
        const el = document.activeElement;
        if (!el || (!el.isContentEditable && el.value === undefined)) return;

        if (el === lastProcessedElement && getText(el) === lastProcessedText) return;

        const text = getText(el);
        if (!text) return;

        const match = findMatchingShortcut(text);
        if (!match) return;

        if (match.isAI) {
            if (isProcessing) return;

            isProcessing = true;
            addStyles();

            handleAIExpansion(el, text, match).finally(() => {
                isProcessing = false;
                lastProcessedElement = el;
            });

            return;
        }

        const newText = text.slice(0, -match.length) + EXPANSIONS[match.key];
        (el.isContentEditable ? setContentEditable : setTextInputElement)(el, newText);
        lastProcessedText = newText;
        lastProcessedElement = el;
    };

    // Debounce ile expand fonksiyonunu çağır
    const debouncedExpand = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(expand, 100); // Süreyi istediğiniz gibi ayarlayın hızlı olması için 0 yapabilirsiniz.
    };

    // Olay Dinleyicisi
    document.addEventListener("keyup", debouncedExpand, { passive: true });
})();
