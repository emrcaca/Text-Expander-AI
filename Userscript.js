// ==UserScript==
// @name         Text-Expander-AI
// @namespace    https://github.com/emrcaca
// @version      1.0
// @description  Text expander with AI commands
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.openai.com
// @connect      api.anthropic.com
// @connect      api.cohere.ai
// @connect      your.custom.api
// @connect      discord.com
// @run-at       document-idle
// ==/UserScript==

/**
 *          ___ _ __ ___  _ __ ___ __ _  ___ __ _
 *         / _ \ '_ ` _ \| '__/ __/ _` |/ __/ _` |
 *        |  __/ | | | | | | | (_| (_| | (_| (_| |
 *         \___|_| |_| |_|_|  \___\__,_|\___\__,_|
 *
 *                    Text-Expander-AI
 *
 *    GitHub: https://github.com/emrcaca/AI-Text-Improver
 *    Copyright (c) 2025 emrcaca | MIT License
 *
 */

(function() {
    'use strict';

    const AI_CONFIG = {
        AI_PROVIDER: "custom",
        CUSTOM_API_URL: "https://your.custom.api/v1/chat/completions",
        CUSTOM_API_KEY: "your-custom-api-key-here",
        OPENAI_API_KEY: "your-openai-key-here",
        ANTHROPIC_API_KEY: "your-anthropic-key-here",
        COHERE_API_KEY: "your-cohere-key-here",
        DISCORD_WEBHOOK_URL: "your_discord_webhook_url",
        MODEL: "openai/gpt-oss-120b",
        TEMPERATURE: 0.3,
        MAX_TOKENS: 2000,
        TIMEOUT: 30000
    };

    const AI_COMMANDS = {
        '-fix': 'Correct all grammar, spelling, and punctuation errors in the following text:',
        '-imp': 'Improve the following text to be clearer, more concise, and more impactful while preserving its original meaning:',
        '-gen': 'Expand the following into a detailed, natural response, maintaining the same tone:',
        '-en':  'Translate the following into fluent, natural English:',
        '-tr':  'Çeviriyi akıcı ve doğal Türkçe olarak yap:',
        '-sum': 'Summarize the following concisely:',
        '-frm': 'Rewrite the following in a formal and professional style:',
        '-cas': 'Rewrite the following in a casual, friendly tone:',
        '-ai': null
    };

    const WEBHOOK_COMMANDS = {
        '-wh': null
    };

    class UniversalTextSetter {
        static getText(element) {
            if (!element) return '';

            if (element.isContentEditable) {
                return element.innerText || element.textContent || '';
            }

            return element.value || '';
        }

        static setText(element, text) {
            if (!element) return;
            const textStr = String(text);
            if (element.isContentEditable) {
                this.setContentEditable(element, textStr);
            } else {
                this.setInputValue(element, textStr);
            }
        }

        static setInputValue(element, text) {
            const tagName = element.tagName;
            const prototype = tagName === 'TEXTAREA'
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

            const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
            if (nativeSetter) {
                nativeSetter.call(element, text);
            } else {
                element.value = text;
            }

            element._valueTracker?.setValue(text);
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            try {
                element.setSelectionRange?.(text.length, text.length);
            } catch {}
        }

        static setContentEditable(element, text) {
            element.focus();
            const selection = window.getSelection();
            const range = document.createRange();

            try {
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);

                const beforeInputEvent = new InputEvent('beforeinput', {
                    inputType: 'insertText',
                    data: text,
                    bubbles: true,
                    cancelable: true
                });

                if (!element.dispatchEvent(beforeInputEvent)) return;

                element.textContent = text;

                element.dispatchEvent(new InputEvent('input', {
                    inputType: 'insertText',
                    data: text,
                    bubbles: true
                }));

                range.selectNodeContents(element);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            } catch (e) {}

            try {
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                if (document.execCommand('selectAll', false, null)) {
                    document.execCommand('insertText', false, text);
                    return;
                }
            } catch (e) {}

            element.textContent = text;
            try {
                range.selectNodeContents(element);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch {}
        }

        static isEditable(element) {
            if (!element) return false;
            return element.tagName === 'INPUT' ||
                   element.tagName === 'TEXTAREA' ||
                   element.isContentEditable ||
                   element.getAttribute('contenteditable') === 'true';
        }

        static getActiveEditableElement() {
            const activeElement = document.activeElement;
            return this.isEditable(activeElement) ? activeElement : null;
        }
    }

    const TRIGGERS = [
        { trigger: 'hi', replace: 'Hello!' },
        { trigger: 'ok', replace: 'okey' },
        { trigger: 'brb', replace: 'Be right back' },
        { trigger: 'omw', replace: 'On my way' },
        { trigger: 'thx', replace: 'Thanks!' },
        { trigger: 'ty', replace: 'Thank you!' },
        { trigger: 'np', replace: 'No problem!' },
        { trigger: 'idk', replace: "I don't know" },
        { trigger: 'btw', replace: 'By the way' },
        { trigger: 'imo', replace: 'In my opinion' },
        { trigger: 'afaik', replace: 'As far as I know' },
        { trigger: ':mail', replace: 'ornek@email.com' },
        { trigger: ':mymail', replace: 'benim@email.com' },
        { trigger: '"1', replace: 'Owo h' },
        { trigger: '"2', replace: 'Owo b' },
        { trigger: '"3', replace: 'Owo' },
        { trigger: '"4', replace: 'Owo pray' },
        { trigger: ':tarih', replace: () => new Date().toLocaleDateString('tr-TR') },
        { trigger: ':date', replace: () => new Date().toLocaleDateString('en-US') },
        { trigger: ':saat', replace: () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) },
        { trigger: ':time', replace: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { trigger: ':gun', replace: () => {
                const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                return days[new Date().getDay()];
            }
        },
        { trigger: ':heart', replace: '❤️' },
        { trigger: ':check', replace: '✓' },
        { trigger: ':cross', replace: '✗' },
    ];

    const SETTINGS = {
        wordBoundary: true,
        debug: false,
        debounceDelay: 0,
        aiCommandDelay: 500,
    };

    let processingReplace = false;
    let debounceTimer = null;
    let isAIProcessing = false;
    let currentAIRequest = null;
    let loadingIndicator = null;
    let undoDetected = false;

    function createLoadingIndicator(element) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid #333333;
        border-radius: 0px;
        padding: 6px 10px;
        font-size: 11px;
        color: #CCCCCC;
        font-weight: normal;
        z-index: 999999;
        pointer-events: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        font-family: "MS Sans Serif", "Microsoft Sans Serif", sans-serif;
        display: flex;
        align-items: center;
        gap: 8px;
    `;

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 12px;
            height: 12px;
            border: 2px solid #cccccc;
            border-top: 2px solid #333333;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        const text = document.createElement('span');
        text.textContent = 'Processing...';

        indicator.appendChild(spinner);
        indicator.appendChild(text);

        const rect = element.getBoundingClientRect();
        indicator.style.top = `${rect.top + window.scrollY + (rect.height / 2)}px`;
        indicator.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
        indicator.style.transform = 'translate(-50%, -50%)';

        document.body.appendChild(indicator);
        return indicator;
    }

    function removeLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.remove();
            loadingIndicator = null;
        }
    }

    function blockInput(element) {
        const blocker = (e) => {
            if (isAIProcessing) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        element._aiBlocker = blocker;
        element.addEventListener('keydown', blocker, true);
        element.addEventListener('keypress', blocker, true);
        element.addEventListener('input', blocker, true);
        element.addEventListener('paste', blocker, true);
    }

    function unblockInput(element) {
        if (element._aiBlocker) {
            element.removeEventListener('keydown', element._aiBlocker, true);
            element.removeEventListener('keypress', element._aiBlocker, true);
            element.removeEventListener('input', element._aiBlocker, true);
            element.removeEventListener('paste', element._aiBlocker, true);
            delete element._aiBlocker;
        }
    }

    class AIClient {
        static buildRequest(prompt) {
            const providers = {
                openai: {
                    url: "https://api.openai.com/v1/chat/completions",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        messages: [
                            { role: "system", content: "Return only the result. No extra text, explanations, or quotes." },
                            { role: "user", content: prompt }
                        ],
                        temperature: AI_CONFIG.TEMPERATURE,
                        max_tokens: AI_CONFIG.MAX_TOKENS
                    }
                },
                anthropic: {
                    url: "https://api.anthropic.com/v1/messages",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": AI_CONFIG.ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01"
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        max_tokens: AI_CONFIG.MAX_TOKENS,
                        messages: [{ role: "user", content: prompt }]
                    }
                },
                cohere: {
                    url: "https://api.cohere.ai/v1/chat",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AI_CONFIG.COHERE_API_KEY}`
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        message: prompt,
                        temperature: AI_CONFIG.TEMPERATURE,
                        max_tokens: AI_CONFIG.MAX_TOKENS
                    }
                },
                custom: {
                    url: AI_CONFIG.CUSTOM_API_URL,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AI_CONFIG.CUSTOM_API_KEY}`
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        messages: [
                            { role: "system", content: "Return only the result. No extra text, explanations, or quotes." },
                            { role: "user", content: prompt }
                        ],
                        temperature: AI_CONFIG.TEMPERATURE,
                        max_tokens: AI_CONFIG.MAX_TOKENS
                    }
                }
            };

            return providers[AI_CONFIG.AI_PROVIDER] || providers.custom;
        }

        static extractResponse(data, provider) {
            const extractors = {
                anthropic: () => data.content?.[0]?.text?.trim(),
                cohere: () => data.text?.trim(),
                default: () => data.choices?.[0]?.message?.content?.trim()
            };

            return (extractors[provider] || extractors.default)();
        }

        static makeRequest(prompt) {
            return new Promise((resolve, reject) => {
                const request = this.buildRequest(prompt);

                currentAIRequest = GM_xmlhttpRequest({
                    method: "POST",
                    url: request.url,
                    headers: request.headers,
                    data: JSON.stringify(request.data),
                    timeout: AI_CONFIG.TIMEOUT,
                    onload: (response) => {
                        if (response.status >= 400) {
                            reject(new Error(`API error: ${response.status}`));
                            return;
                        }

                        try {
                            const data = JSON.parse(response.responseText);
                            const content = this.extractResponse(data, AI_CONFIG.AI_PROVIDER);

                            if (!content) {
                                reject(new Error("Empty AI response"));
                                return;
                            }

                            resolve(content);
                        } catch (err) {
                            reject(new Error("Failed to parse response"));
                        }
                    },
                    onerror: () => reject(new Error("Network error")),
                    ontimeout: () => reject(new Error("Request timeout"))
                });
            });
        }

        static cancelRequest() {
            if (currentAIRequest) {
                currentAIRequest.abort();
                currentAIRequest = null;
            }
        }
    }

    async function processAICommand(element, text, aiCommand) {
        if (isAIProcessing) return;

        let command = Object.keys(AI_COMMANDS).find(cmd => text.endsWith(cmd));

        if (!command) {
            command = Object.keys(WEBHOOK_COMMANDS).find(cmd => text.endsWith(cmd));
        }

        if (!command) return;

        const promptText = text.slice(0, -command.length).trim();
        if (!promptText) return;

        isAIProcessing = true;

        const originalCursorStyle = element.style.caretColor || '';
        element.style.caretColor = 'transparent';

        blockInput(element);

        loadingIndicator = createLoadingIndicator(element);

        if (command === '-wh') {
            try {
                await sendToDiscordWebhook(promptText);
                UniversalTextSetter.setText(element, promptText);
            } catch (err) {
                console.error("[Discord Webhook] Error:", err.message);
                UniversalTextSetter.setText(element, promptText);
            } finally {
                removeLoadingIndicator();
                unblockInput(element);

                element.style.caretColor = originalCursorStyle;

                isAIProcessing = false;
                currentAIRequest = null;
            }
            return;
        }

        const finalPrompt = command === '-ai'
            ? promptText
            : `${AI_COMMANDS[command]}\n\n${promptText}`;

        try {
            const result = await AIClient.makeRequest(finalPrompt);
            UniversalTextSetter.setText(element, result);
        } catch (err) {
            console.error("[AI] Error:", err.message);
            UniversalTextSetter.setText(element, promptText);
        } finally {
            removeLoadingIndicator();
            unblockInput(element);

            element.style.caretColor = originalCursorStyle;

            isAIProcessing = false;
            currentAIRequest = null;
        }
    }

    function checkAndReplace() {
        if (undoDetected) {
            return;
        }

        if (processingReplace || isAIProcessing) return;

        const activeEl = UniversalTextSetter.getActiveEditableElement();
        if (!activeEl) return;

        const currentText = UniversalTextSetter.getText(activeEl);

        const aiCommand = Object.keys(AI_COMMANDS).find(cmd => currentText.endsWith(cmd));
        if (aiCommand) {
            setTimeout(() => {
                processAICommand(activeEl, currentText, aiCommand);
            }, SETTINGS.aiCommandDelay);
            return;
        }

        const webhookCommand = Object.keys(WEBHOOK_COMMANDS).find(cmd => currentText.endsWith(cmd));
        if (webhookCommand) {
            setTimeout(() => {
                processAICommand(activeEl, currentText, webhookCommand);
            }, SETTINGS.aiCommandDelay);
            return;
        }

        const sortedTriggers = [...TRIGGERS].sort((a, b) => b.trigger.length - a.trigger.length);

        for (const item of sortedTriggers) {
            const trigger = item.trigger;

            if (SETTINGS.wordBoundary) {
                const regex = new RegExp(`(^|\\s)${escapeRegex(trigger)}$`);
                if (regex.test(currentText)) {
                    performReplace(activeEl, currentText, trigger, item.replace);
                    return;
                }
            } else {
                if (currentText.endsWith(trigger)) {
                    performReplace(activeEl, currentText, trigger, item.replace);
                    return;
                }
            }
        }
    }

    function performReplace(element, currentText, trigger, replacement) {
        processingReplace = true;

        const replaceText = typeof replacement === 'function' ? replacement() : replacement;

        const newText = currentText.slice(0, -trigger.length) + replaceText;

        UniversalTextSetter.setText(element, newText);

        setTimeout(() => {
            processingReplace = false;
        }, 100);
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    document.addEventListener('input', (e) => {
        if (e.inputType !== 'historyUndo') {
            undoDetected = false;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            checkAndReplace();
        }, SETTINGS.debounceDelay);
    }, true);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            undoDetected = true;
            return;
        }

        if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
            return;
        }

        if (e.key === 'Escape' && isAIProcessing) {
            AIClient.cancelRequest();
            isAIProcessing = false;
            removeLoadingIndicator();
            const activeEl = UniversalTextSetter.getActiveEditableElement();
            if (activeEl) unblockInput(activeEl);
            return;
        }

        if (undoDetected && e.key !== 'z') {
            undoDetected = false;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            checkAndReplace();
        }, SETTINGS.debounceDelay);
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'h') {
            e.preventDefault();
            showAIHelp();
        }
    });

    function showAIHelp() {
        const helpText = `
AI Text Improver Commands:
-fix : Fix grammar and spelling
-imp : Improve text clarity
-gen : Expand text
-en  : Translate to English
-tr  : Translate to Turkish
-sum : Summarize
-frm : Make formal
-cas : Make casual
-ai  : Free AI prompt

Webhook Commands:
-wh  : Send text to Discord webhook

Type any of these commands after your text and press space/enter.
Example: "merhaba nasılsın -tr"

Press ESC to cancel AI processing.
        `;
        alert(helpText);
    }

    function sendToDiscordWebhook(message) {
        return new Promise((resolve, reject) => {
            if (!AI_CONFIG.DISCORD_WEBHOOK_URL || AI_CONFIG.DISCORD_WEBHOOK_URL === "YOUR_DISCORD_WEBHOOK_URL_HERE") {
                reject(new Error("Discord webhook URL is not configured"));
                return;
            }

            const formattedMessage = message;

            GM_xmlhttpRequest({
                method: "POST",
                url: AI_CONFIG.DISCORD_WEBHOOK_URL,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify({
                    content: formattedMessage,
                    username: "Notes",
                    avatar_url: "https://cdn.discordapp.com/avatars/1446237723622117599/fece26f842b5e9432f403673ae20545c.webp?size=80"
                }),
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Webhook error: ${response.status}`));
                    }
                },
                onerror: () => reject(new Error("Network error")),
                ontimeout: () => reject(new Error("Request timeout"))
            });
        });
    }

    console.log("Text Expander with AI loaded!");
    console.log("AI Commands available:", Object.keys(AI_COMMANDS).join(", "));
})();
