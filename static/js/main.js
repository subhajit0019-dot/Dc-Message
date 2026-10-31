/* ==========================================
   Discord Webhook Sender - OLED Ultra-Premium Frontend Studio Logic
   ========================================== */

// Helper: Escape HTML to prevent XSS in preview and DOM injection
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const webhookUrlInput = document.getElementById('webhook_url');
    const toggleWebhookBtn = document.getElementById('btn-toggle-webhook');
    const clearWebhookBtn = document.getElementById('btn-clear-webhook');
    const urlStatusText = document.getElementById('url-status');
    const botUsernameInput = document.getElementById('bot_username');
    const botAvatarInput = document.getElementById('bot_avatar');
    
    const titleInput = document.getElementById('title');
    const thumbnailInput = document.getElementById('thumbnail_url');
    const bannerInput = document.getElementById('banner_url');
    const accentColorPicker = document.getElementById('accent_color');
    const accentColorHex = document.getElementById('accent_color_hex');
    const hexBadge = document.getElementById('hex-badge');
    const enableAccentCheck = document.getElementById('enable_accent_color');
    const colorPickerWrapper = document.getElementById('color-picker-wrapper');
    const swatchNoneBtn = document.getElementById('swatch-none');
    const swatches = document.querySelectorAll('.swatch');
    
    const showDividerCheck = document.getElementById('show_divider');
    const expandWidthCheck = document.getElementById('expand_width');
    const widthSpacesRange = document.getElementById('width_spaces');
    const paddingValDisplay = document.getElementById('padding-val');
    
    const mainContentArea = document.getElementById('main_content');
    const charCounter = document.getElementById('char-counter');
    const copyMdBtn = document.getElementById('btn-copy-md');
    const pricePrefixInput = document.getElementById('price_prefix');
    const priceTextInput = document.getElementById('price_text');
    const priceSubtextCheck = document.getElementById('price_subtext');
    
    const buttonsContainer = document.getElementById('buttons-container');
    const addBtn = document.getElementById('btn-add-button');
    
    const sendWebhookBtn = document.getElementById('btn-send-webhook');
    const copyJsonBtn = document.getElementById('btn-copy-json');
    const copyJsonTabBtn = document.getElementById('btn-copy-json-tab');
    const savePresetBtn = document.getElementById('btn-save-preset');
    const resetFormBtn = document.getElementById('btn-reset-form');
    const exportJsonBtn = document.getElementById('btn-export-json');
    const importJsonBtn = document.getElementById('btn-import-json');
    const importJsonFile = document.getElementById('import-json-file');

    // Saved Messages Bar & Vault DOM Elements
    const btnOpenVault = document.getElementById('btn-open-vault');
    const vaultCountBadge = document.getElementById('vault-count-badge');
    const btnSaveCurrent = document.getElementById('btn-save-current');
    
    const savedBarWrapper = document.getElementById('saved-bar-wrapper');
    const activePresetBadge = document.getElementById('active-preset-badge');
    const activePresetName = document.getElementById('active-preset-name');
    const btnBarSaveNew = document.getElementById('btn-bar-save-new');
    const btnBarUpdateCurrent = document.getElementById('btn-bar-update-current');
    const btnBarViewAll = document.getElementById('btn-bar-view-all');
    const quickBarCount = document.getElementById('quick-bar-count');
    const savedBarPills = document.getElementById('saved-bar-pills');

    // Save Preset Modal
    const savePresetModal = document.getElementById('save-preset-modal');
    const savePresetNameInput = document.getElementById('save-preset-name-input');
    const saveOptIncludeWebhook = document.getElementById('save-opt-include-webhook');
    const btnConfirmSavePreset = document.getElementById('btn-confirm-save-preset');
    const btnCancelSavePreset = document.getElementById('btn-cancel-save-preset');
    const btnCloseSaveModal = document.getElementById('btn-close-save-modal');

    // Rename Preset Modal
    const renamePresetModal = document.getElementById('rename-preset-modal');
    const renamePresetInput = document.getElementById('rename-preset-input');
    const btnConfirmRenamePreset = document.getElementById('btn-confirm-rename-preset');
    const btnCancelRenamePreset = document.getElementById('btn-cancel-rename-preset');
    const btnCloseRenameModal = document.getElementById('btn-close-rename-modal');

    // Vault Drawer
    const vaultDrawerOverlay = document.getElementById('vault-drawer-overlay');
    const vaultDrawer = document.getElementById('vault-drawer');
    const vaultDrawerCount = document.getElementById('vault-drawer-count');
    const btnCloseVaultDrawer = document.getElementById('btn-close-vault-drawer');
    const vaultSearchInput = document.getElementById('vault-search-input');
    const btnClearSearch = document.getElementById('btn-clear-search');
    const btnDrawerQuickSave = document.getElementById('btn-drawer-quick-save');
    const vaultCardsContainer = document.getElementById('vault-cards-container');
    const btnVaultExportBackup = document.getElementById('btn-vault-export-backup');
    const btnVaultImportBackup = document.getElementById('btn-vault-import-backup');
    const vaultImportFile = document.getElementById('vault-import-file');
    const btnVaultResetDefaults = document.getElementById('btn-vault-reset-defaults');
    
    // Export Modal DOM Elements
    const exportModal = document.getElementById('export-modal');
    const exportFilenameInput = document.getElementById('export-filename-input');
    const btnConfirmExport = document.getElementById('btn-confirm-export');
    const btnCancelExport = document.getElementById('btn-cancel-export');
    const btnCloseExportModal = document.getElementById('btn-close-export-modal');
    
    // Live Preview DOM Elements
    const prevAvatarImg = document.getElementById('prev-avatar-img');
    const prevBotName = document.getElementById('prev-bot-name');
    const v2Container = document.getElementById('v2-container');
    const v2HeaderSection = document.getElementById('v2-header-section');
    const v2TitleDisplay = document.getElementById('v2-title-display');
    const v2ThumbnailWrapper = document.getElementById('v2-thumbnail-wrapper');
    const v2ThumbnailImg = document.getElementById('v2-thumbnail-img');
    const v2ContentDisplay = document.getElementById('v2-content-display');
    const v2BannerWrapper = document.getElementById('v2-banner-wrapper');
    const v2BannerImg = document.getElementById('v2-banner-img');
    const v2PriceWrapper = document.getElementById('v2-price-wrapper');
    const v2PriceDisplay = document.getElementById('v2-price-display');
    const v2PriceDivider = document.getElementById('v2-price-divider');
    const v2ActionRowWrapper = document.getElementById('v2-action-row-wrapper');
    const v2ButtonsRow = document.getElementById('v2-buttons-row');
    const v2ButtonsDivider = document.getElementById('v2-buttons-divider');
    const jsonCodeDisplay = document.getElementById('json-code-display');
    
    const logStatusBadge = document.getElementById('log-status-badge');
    const logBodyText = document.getElementById('log-body-text');

    // Initial Button State
    let buttonsData = [
        { label: "🛒 Ver Opções", url: "https://example.com" },
        { label: "💬 Suporte", url: "https://discord.gg" }
    ];

    // Quick Templates
    const TEMPLATES = {
        modmenu: {
            title: "Mod Menu V7A",
            thumbnail_url: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
            banner_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
            accent_color: "#00F0FF",
            main_content: "## Memory\n• Silent Aim\n• Aimbot Lite\n\n## Exploits\n• Ghost\n• Speed Hack\n\n## ESP\n• Show Name\n• Show Distance\n• Show Health",
            price_prefix: "Price: ",
            price_text: "De R$ 10,00 a R$ 100,00",
            price_subtext: true,
            show_divider: true,
            buttons: [
                { label: "🛒 Ver Opções", url: "https://example.com" },
                { label: "💬 Suporte", url: "https://discord.gg" }
            ]
        },
        store: {
            title: "🔥 VIP Exclusive Package",
            thumbnail_url: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
            banner_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            accent_color: "#FFD700",
            main_content: "## Exclusive VIP Features\n• Unlimited Access to All Features\n• Priority 24/7 VIP Support Desk\n• Custom Discord Role & Secret Channel\n• Early Beta Updates Access",
            price_prefix: "Plan: ",
            price_text: "$19.99 / Lifetime Access",
            price_subtext: true,
            show_divider: true,
            buttons: [
                { label: "💳 Buy Now", url: "https://example.com/checkout" },
                { label: "⭐ Customer Reviews", url: "https://example.com/reviews" }
            ]
        },
        update: {
            title: "🚀 System Update v3.2 Released",
            thumbnail_url: "https://cdn-icons-png.flaticon.com/512/1162/1162499.png",
            banner_url: "",
            accent_color: "#5865F2",
            main_content: "## What's New?\n• Fixed anti-cheat bypass latency\n• Enhanced UI responsiveness\n• Added 5 new custom features\n\n## Bug Fixes\n• Resolved crash on Windows 11",
            price_prefix: "Status: ",
            price_text: "Free Update for Existing Users",
            price_subtext: true,
            show_divider: true,
            buttons: [
                { label: "📥 Download Update", url: "https://example.com/download" },
                { label: "📜 Patch Notes", url: "https://example.com/changelog" }
            ]
        },
        support: {
            title: "🛠️ Need Help or Support?",
            thumbnail_url: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
            banner_url: "",
            accent_color: "#00FF9D",
            main_content: "## Customer Support Center\nOur team is active 24/7 to resolve your queries.\n\n• Open a support ticket below\n• Check FAQ documentation",
            price_prefix: "Notice: ",
            price_text: "Support is Always Free & Fast",
            price_subtext: true,
            show_divider: true,
            buttons: [
                { label: "🎫 Open Ticket", url: "https://discord.gg" },
                { label: "📖 Knowledgebase", url: "https://example.com/faq" }
            ]
        },
        rules: {
            title: "📜 Server Rules & Guidelines",
            thumbnail_url: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
            banner_url: "",
            accent_color: "#FF3366",
            main_content: "## Community Guidelines\n1. Be respectful to all community members\n2. No spamming or self-promotion\n3. Keep topics in appropriate channels\n4. Follow Discord Terms of Service",
            price_prefix: "Rule Set: ",
            price_text: "Enforced by Moderation Team",
            price_subtext: true,
            show_divider: true,
            buttons: [
                { label: "🌐 Full Rules", url: "https://example.com/rules" }
            ]
        }
    };

    // Load Saved State from LocalStorage
    function loadSavedState() {
        const savedUrl = localStorage.getItem('dc_webhook_url');
        if (savedUrl && webhookUrlInput) {
            webhookUrlInput.value = savedUrl;
            updateUrlStatus();
        }
        
        const savedBotName = localStorage.getItem('dc_bot_name');
        if (savedBotName && botUsernameInput) botUsernameInput.value = savedBotName;
        
        const savedAvatar = localStorage.getItem('dc_bot_avatar');
        if (savedAvatar && botAvatarInput) botAvatarInput.value = savedAvatar;
    }

    // Save State to LocalStorage
    function saveState() {
        if (webhookUrlInput && webhookUrlInput.value) localStorage.setItem('dc_webhook_url', webhookUrlInput.value);
        if (botUsernameInput && botUsernameInput.value) localStorage.setItem('dc_bot_name', botUsernameInput.value);
        if (botAvatarInput && botAvatarInput.value) localStorage.setItem('dc_bot_avatar', botAvatarInput.value);
        showToast('Form state saved locally!', 'success');
    }

    // Reset / Clear Form
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            if (titleInput) titleInput.value = '';
            if (thumbnailInput) thumbnailInput.value = '';
            if (bannerInput) bannerInput.value = '';
            if (mainContentArea) mainContentArea.value = '';
            if (pricePrefixInput) pricePrefixInput.value = 'Price: ';
            if (priceTextInput) priceTextInput.value = '';
            if (enableAccentCheck) enableAccentCheck.checked = true;
            setColorAccent('#00F0FF');
            buttonsData = [];
            renderButtonsConfig();
            updateLivePreview();
            updateCharCounter();
            showToast('Form fields cleared!', 'info');
        });
    }

    // Toggle Webhook Password Type
    let webhookHidden = true;
    if (toggleWebhookBtn && webhookUrlInput) {
        toggleWebhookBtn.addEventListener('click', () => {
            webhookHidden = !webhookHidden;
            webhookUrlInput.type = webhookHidden ? 'password' : 'text';
            toggleWebhookBtn.innerHTML = webhookHidden ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
        });
        webhookUrlInput.type = 'password';
    }

    if (clearWebhookBtn && webhookUrlInput) {
        clearWebhookBtn.addEventListener('click', () => {
            webhookUrlInput.value = '';
            updateUrlStatus();
            webhookUrlInput.focus();
        });
    }

    function updateUrlStatus() {
        if (!urlStatusText || !webhookUrlInput) return;
        const val = webhookUrlInput.value.trim();
        if (val.startsWith('https://discord.com/api/webhooks/') || 
            val.startsWith('https://discordapp.com/api/webhooks/') || 
            val.startsWith('https://canary.discord.com/api/webhooks/')) {
            urlStatusText.className = 'url-status-text connected';
            urlStatusText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Ready';
        } else if (val.length > 0) {
            urlStatusText.className = 'url-status-text';
            urlStatusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Invalid Format';
        } else {
            urlStatusText.className = 'url-status-text';
            urlStatusText.innerHTML = '<i class="fa-solid fa-circle-notch"></i> Disconnected';
        }
    }

    if (webhookUrlInput) {
        webhookUrlInput.addEventListener('input', updateUrlStatus);
    }

    // Render Buttons Manager Inputs
    function renderButtonsConfig() {
        if (!buttonsContainer) return;
        buttonsContainer.innerHTML = '';
        buttonsData.forEach((btn, index) => {
            const item = document.createElement('div');
            item.className = 'button-item';
            item.innerHTML = `
                <span class="btn-index">#${index + 1}</span>
                <input type="text" class="btn-label-input" data-index="${index}" placeholder="Label (e.g. 🛒 Buy)" value="${escapeHtml(btn.label)}">
                <input type="url" class="btn-url-input" data-index="${index}" placeholder="URL (e.g. https://...)" value="${escapeHtml(btn.url)}">
                <button type="button" class="btn btn-danger btn-sm btn-remove-button" data-index="${index}" title="Remove Button">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            buttonsContainer.appendChild(item);
        });

        // Add event listeners for dynamic button inputs
        buttonsContainer.querySelectorAll('.btn-label-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                if (buttonsData[idx]) {
                    buttonsData[idx].label = e.target.value;
                    updateLivePreview();
                }
            });
        });

        buttonsContainer.querySelectorAll('.btn-url-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                if (buttonsData[idx]) {
                    buttonsData[idx].url = e.target.value;
                    updateLivePreview();
                }
            });
        });

        buttonsContainer.querySelectorAll('.btn-remove-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                buttonsData.splice(idx, 1);
                renderButtonsConfig();
                updateLivePreview();
            });
        });
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (buttonsData.length >= 5) {
                showToast('Discord limits Action Rows to 5 buttons max.', 'error');
                return;
            }
            buttonsData.push({ label: 'New Link', url: 'https://example.com' });
            renderButtonsConfig();
            updateLivePreview();
        });
    }

    // Update Color Accent & Swatches
    function setColorAccent(color) {
        if (!color || color === 'none' || color === 'null') {
            if (enableAccentCheck) enableAccentCheck.checked = false;
            updateAccentColorState();
            return;
        }
        if (enableAccentCheck) enableAccentCheck.checked = true;
        const uppercaseHex = color.toUpperCase();
        if (accentColorPicker) accentColorPicker.value = uppercaseHex;
        if (accentColorHex) accentColorHex.value = uppercaseHex;
        updateAccentColorState();
    }

    function updateAccentColorState() {
        const isEnabled = enableAccentCheck ? enableAccentCheck.checked : true;
        if (colorPickerWrapper) {
            colorPickerWrapper.classList.toggle('disabled', !isEnabled);
        }

        if (hexBadge) {
            if (isEnabled) {
                const hexVal = accentColorHex ? accentColorHex.value.toUpperCase() : '#00F0FF';
                hexBadge.textContent = hexVal;
                hexBadge.classList.remove('badge-disabled');
                hexBadge.style.color = hexVal;
                hexBadge.style.borderColor = hexVal;
            } else {
                hexBadge.textContent = 'None';
                hexBadge.classList.add('badge-disabled');
                hexBadge.style.color = '';
                hexBadge.style.borderColor = '';
            }
        }

        const curHex = accentColorHex ? accentColorHex.value.toUpperCase() : '#00F0FF';
        document.querySelectorAll('.swatch').forEach(s => {
            if (!isEnabled) {
                if (s.dataset.color === 'none') {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            } else {
                if (s.dataset.color && s.dataset.color.toUpperCase() === curHex) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            }
        });

        updateLivePreview();
    }

    if (enableAccentCheck) {
        enableAccentCheck.addEventListener('change', updateAccentColorState);
    }

    if (accentColorPicker) {
        accentColorPicker.addEventListener('input', (e) => {
            if (enableAccentCheck) enableAccentCheck.checked = true;
            setColorAccent(e.target.value);
        });
    }

    if (accentColorHex) {
        accentColorHex.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                if (enableAccentCheck) enableAccentCheck.checked = true;
                setColorAccent(e.target.value);
            }
        });
    }

    document.querySelectorAll('.swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            if (swatch.dataset.color === 'none') {
                if (enableAccentCheck) enableAccentCheck.checked = false;
                updateAccentColorState();
            } else {
                if (enableAccentCheck) enableAccentCheck.checked = true;
                setColorAccent(swatch.dataset.color);
            }
        });
    });

    // Width Slider & Divider Toggles
    if (widthSpacesRange) {
        widthSpacesRange.addEventListener('input', (e) => {
            if (paddingValDisplay) paddingValDisplay.textContent = e.target.value;
            updateLivePreview();
        });
    }

    if (showDividerCheck) showDividerCheck.addEventListener('change', updateLivePreview);
    if (expandWidthCheck) expandWidthCheck.addEventListener('change', updateLivePreview);
    if (priceSubtextCheck) priceSubtextCheck.addEventListener('change', updateLivePreview);

    // Quick Emoji Bar Insertion
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!mainContentArea) return;
            const emoji = btn.dataset.emoji;
            const start = mainContentArea.selectionStart || 0;
            const end = mainContentArea.selectionEnd || 0;
            const text = mainContentArea.value || '';
            mainContentArea.value = text.substring(0, start) + emoji + text.substring(end);
            mainContentArea.focus();
            mainContentArea.selectionStart = mainContentArea.selectionEnd = start + emoji.length;
            updateLivePreview();
            updateCharCounter();
        });
    });

    // Quick Template Snippets Insertion
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.template;
            const tpl = TEMPLATES[key];
            if (tpl) {
                if (titleInput) titleInput.value = tpl.title;
                if (thumbnailInput) thumbnailInput.value = tpl.thumbnail_url || '';
                if (bannerInput) bannerInput.value = tpl.banner_url || '';
                setColorAccent(tpl.accent_color);
                if (mainContentArea) mainContentArea.value = tpl.main_content;
                if (pricePrefixInput) pricePrefixInput.value = tpl.price_prefix || 'Price: ';
                if (priceTextInput) priceTextInput.value = tpl.price_text;
                if (priceSubtextCheck) priceSubtextCheck.checked = tpl.price_subtext !== undefined ? tpl.price_subtext : true;
                if (showDividerCheck && tpl.show_divider !== undefined) {
                    showDividerCheck.checked = tpl.show_divider;
                }
                buttonsData = JSON.parse(JSON.stringify(tpl.buttons));
                renderButtonsConfig();
                updateLivePreview();
                updateCharCounter();
                showToast(`Loaded "${tpl.title}" template!`, 'success');
            }
        });
    });

    // Character Counter
    function updateCharCounter() {
        if (!charCounter || !mainContentArea) return;
        const text = mainContentArea.value || '';
        const chars = text.length;
        const lines = text ? text.split('\n').length : 0;
        charCounter.textContent = `${chars} chars | ${lines} lines`;
    }

    if (mainContentArea) {
        mainContentArea.addEventListener('input', updateCharCounter);
    }

    // Copy Raw Markdown Text
    if (copyMdBtn && mainContentArea) {
        copyMdBtn.addEventListener('click', () => {
            const mdText = mainContentArea.value;
            if (!mdText.trim()) {
                showToast('Text area is empty!', 'error');
                return;
            }
            navigator.clipboard.writeText(mdText).then(() => {
                showToast('Raw markdown text copied to clipboard!', 'success');
            });
        });
    }

    // Markdown Toolbar Helper
    document.querySelectorAll('.markdown-toolbar button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!mainContentArea) return;
            const syntax = btn.dataset.md;
            const start = mainContentArea.selectionStart || 0;
            const end = mainContentArea.selectionEnd || 0;
            const text = mainContentArea.value || '';

            if (start !== end) {
                const selected = text.substring(start, end);
                if (syntax.endsWith(' ')) {
                    mainContentArea.value = text.substring(0, start) + syntax + selected + text.substring(end);
                } else if (syntax.startsWith('**') && syntax.endsWith('**')) {
                    mainContentArea.value = text.substring(0, start) + '**' + selected + '**' + text.substring(end);
                } else if (syntax.startsWith('*') && syntax.endsWith('*')) {
                    mainContentArea.value = text.substring(0, start) + '*' + selected + '*' + text.substring(end);
                } else if (syntax.startsWith('`') && syntax.endsWith('`')) {
                    mainContentArea.value = text.substring(0, start) + '`' + selected + '`' + text.substring(end);
                } else if (syntax.startsWith('-# ')) {
                    mainContentArea.value = text.substring(0, start) + '-# ' + selected + text.substring(end);
                } else {
                    mainContentArea.value = text.substring(0, start) + syntax + selected + syntax + text.substring(end);
                }
            } else {
                mainContentArea.value = text.substring(0, start) + syntax + text.substring(end);
            }
            mainContentArea.focus();
            updateLivePreview();
            updateCharCounter();
        });
    });

    // Rich Markdown Formatter for Preview Simulation
    function formatDiscordMarkdown(text) {
        if (!text) return '';
        let html = escapeHtml(text);

        // Code blocks: ```lang\ncode\n```
        html = html.replace(/```(?:([a-zA-Z0-9_-]+)?\n)?([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="v2-code-block"><code>${code.trim()}</code></pre>`;
        });

        // Headers (# H1, ## H2, ### H3)
        html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:0.86rem;font-weight:700;margin:4px 0 2px 0;color:#fff;">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:0.92rem;font-weight:700;margin:6px 0 3px 0;color:#fff;">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:1.02rem;font-weight:700;margin:8px 0 4px 0;color:#fff;">$1</h1>');

        // Block quotes: > text or >>> text
        html = html.replace(/^>>> ([\s\S]*$)/gim, '<blockquote class="v2-blockquote">$1</blockquote>');
        html = html.replace(/^> (.*$)/gim, '<blockquote class="v2-blockquote">$1</blockquote>');

        // Bold italic: ***text*** or _**text**_ or **_text_**
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/_\*\*(.*?)\*\*_|_\*(.*?)\*_/g, '<em><strong>$1$2</strong></em>');

        // Bold: **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Underline: __text__
        html = html.replace(/__(.*?)__/g, '<u>$1</u>');

        // Strikethrough: ~~text~~
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

        // Italic: *text* or _text_
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/(^|\s)_(.*?)_($|\s)/g, '$1<em>$2</em>$3');

        // Spoiler: ||text||
        html = html.replace(/\|\|(.*?)\|\|/g, '<span class="discord-spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');

        // Inline Code: `code`
        html = html.replace(/`([^`]+)`/g, '<code class="v2-inline-code">$1</code>');

        // Masked Links: [label](url)
        html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="v2-inline-link">$1</a>');

        // Bullet lists: • item, - item, * item
        html = html.replace(/^(?:•|-|\*) (.*$)/gim, '<div class="v2-bullet-item"><span class="bullet-dot">•</span> <span>$1</span></div>');

        // Subtext (-# text)
        html = html.replace(/^-# (.*$)/gim, '<div class="v2-subtext-line">$1</div>');

        // Discord Custom Emojis: <:name:id> or <a:name:id>
        html = html.replace(/&lt;a:([a-zA-Z0-9_]+):(\d+)&gt;/g, '<img class="discord-custom-emoji animated" src="https://cdn.discordapp.com/emojis/$2.gif?size=48&quality=lossless" alt=":$1:" title=":$1:">');
        html = html.replace(/&lt;:([a-zA-Z0-9_]+):(\d+)&gt;/g, '<img class="discord-custom-emoji" src="https://cdn.discordapp.com/emojis/$2.png?size=48&quality=lossless" alt=":$1:" title=":$1:">');

        // Discord Mentions: <@userid>, <#channelid>, <@&roleid>
        html = html.replace(/&lt;@!?(\d+)&gt;/g, '<span class="discord-mention">@user</span>');
        html = html.replace(/&lt;#(\d+)&gt;/g, '<span class="discord-mention">#channel</span>');
        html = html.replace(/&lt;@&amp;(\d+)&gt;/g, '<span class="discord-mention">@role</span>');

        return html;
    }

    function resolveDirectImageUrl(url) {
        if (!url) return '';
        url = url.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) return url;

        // 1. Tenor view link
        const tenorMatch = url.match(/tenor\.com\/view\/[^/]*?-(\d+)/) || url.match(/tenor\.com\/view\/.*?(\d+)$/);
        if (tenorMatch) {
            return `https://media.tenor.com/${tenorMatch[1]}/tenor.gif`;
        }

        // 2. Giphy view link
        const giphyMatch = url.match(/giphy\.com\/gifs\/(?:.*?-)?([a-zA-Z0-9]+)$/);
        if (giphyMatch) {
            return `https://media.giphy.com/media/${giphyMatch[1]}/giphy.gif`;
        }

        // 3. Imgur view link
        const imgurMatch = url.match(/imgur\.com\/(?:gallery\/)?([a-zA-Z0-9]+)$/);
        if (imgurMatch && !/\.(gif|png|jpg|jpeg|webp|ico)$/i.test(url)) {
            return `https://i.imgur.com/${imgurMatch[1]}.gif`;
        }

        return url;
    }

    // Collect Input Form Data
    function getFormData() {
        const isAccentEnabled = enableAccentCheck ? enableAccentCheck.checked : true;
        return {
            webhook_url: webhookUrlInput ? webhookUrlInput.value.trim() : '',
            username: botUsernameInput ? botUsernameInput.value.trim() : '',
            avatar_url: botAvatarInput ? botAvatarInput.value.trim() : '',
            title: titleInput ? titleInput.value.trim() : '',
            thumbnail_url: thumbnailInput ? thumbnailInput.value.trim() : '',
            banner_url: bannerInput ? bannerInput.value.trim() : '',
            enable_accent_color: isAccentEnabled,
            accent_color: isAccentEnabled ? (accentColorPicker ? accentColorPicker.value : '#00F0FF') : null,
            expand_width: expandWidthCheck ? expandWidthCheck.checked : true,
            show_divider: showDividerCheck ? showDividerCheck.checked : true,
            width_spaces: widthSpacesRange ? parseInt(widthSpacesRange.value, 10) : 22,
            main_content: mainContentArea ? mainContentArea.value : '',
            price_prefix: pricePrefixInput ? pricePrefixInput.value : 'Price: ',
            price_text: priceTextInput ? priceTextInput.value.trim() : '',
            price_subtext: priceSubtextCheck ? priceSubtextCheck.checked : true,
            buttons_data: buttonsData.filter(b => b.label && b.label.trim() && b.url && b.url.trim())
        };
    }

    // Client-side Local Payload Generator for Instant Sync
    function buildLocalComponentsV2Payload(data) {
        const hexColor = data.accent_color || '#00F0FF';
        let colorInt = 0x00A2C7;
        try {
            colorInt = parseInt(hexColor.replace('#', ''), 16) || 0x00A2C7;
        } catch(e) {}

        const containerChildren = [];
        const padding = (data.expand_width && data.width_spaces > 0) ? "⠀".repeat(data.width_spaces) : "";

        // 1. Header & Thumbnail
        if (data.title && data.title.trim()) {
            let headerText = `# ${data.title.trim()}`;
            if (padding) headerText += ` ${padding}`;

            if (data.thumbnail_url && (data.thumbnail_url.startsWith('http://') || data.thumbnail_url.startsWith('https://'))) {
                containerChildren.push({
                    type: 9,
                    components: [{ type: 10, content: headerText }],
                    accessory: {
                        type: 11,
                        media: { url: resolveDirectImageUrl(data.thumbnail_url.trim()) }
                    }
                });
            } else {
                containerChildren.push({ type: 10, content: headerText });
            }
        } else if (padding) {
            containerChildren.push({ type: 10, content: padding });
        }

        // 2. Main Content
        if (data.main_content && data.main_content.trim()) {
            containerChildren.push({ type: 10, content: data.main_content.trim() });
        }

        // 3. Banner
        if (data.banner_url && (data.banner_url.startsWith('http://') || data.banner_url.startsWith('https://'))) {
            containerChildren.push({
                type: 12,
                items: [{ media: { url: resolveDirectImageUrl(data.banner_url.trim()) } }]
            });
        }

        // 4. Price & Footer
        if (data.price_text && data.price_text.trim()) {
            if (data.show_divider) {
                containerChildren.push({ type: 14, divider: true, spacing: 1 });
            }
            const prefix = data.price_prefix !== undefined ? data.price_prefix : "Price: ";
            let fullPrice = `${prefix}${data.price_text.trim()}`;
            if (data.price_subtext) {
                fullPrice = `-# ${fullPrice}`;
            }
            containerChildren.push({ type: 10, content: fullPrice });
        }

        // 5. Buttons
        if (data.buttons_data && data.buttons_data.length > 0) {
            const actionRow = [];
            data.buttons_data.forEach(btn => {
                if (btn.label && btn.url) {
                    const btnComp = {
                        type: 2,
                        style: 5,
                        label: btn.label.trim(),
                        url: btn.url.trim()
                    };
                    const emojiMatch = btn.label.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
                    if (emojiMatch) {
                        const isAnim = Boolean(emojiMatch[1]);
                        const eName = emojiMatch[2];
                        const eId = emojiMatch[3];
                        btnComp.emoji = {
                            id: eId,
                            name: eName,
                            animated: isAnim
                        };
                        const cleaned = btn.label.replace(/<(a)?:[a-zA-Z0-9_]+:\d+>/, '').trim();
                        btnComp.label = cleaned || eName;
                    } else if (btn.emoji) {
                        btnComp.emoji = btn.emoji;
                    }
                    actionRow.push(btnComp);
                }
            });
            if (actionRow.length > 0) {
                if (data.show_divider) {
                    containerChildren.push({ type: 14, divider: true, spacing: 1 });
                }
                containerChildren.push({
                    type: 1,
                    components: actionRow
                });
            }
        }

        const containerObj = {
            type: 17,
            components: containerChildren
        };

        if (data.enable_accent_color !== false && data.accent_color) {
            let colorInt = 0x00A2C7;
            try {
                colorInt = parseInt(data.accent_color.replace('#', ''), 16) || 0x00A2C7;
            } catch(e) {}
            containerObj.accent_color = colorInt;
        }

        const payload = {
            flags: 32768, // 1 << 15 (IS_COMPONENTS_V2)
            components: [containerObj]
        };

        if (data.username && data.username.trim()) payload.username = data.username.trim();
        if (data.avatar_url && data.avatar_url.trim()) payload.avatar_url = resolveDirectImageUrl(data.avatar_url.trim());

        return payload;
    }

    // Update Live Visual Discord Preview Engine
    function updateLivePreview() {
        const data = getFormData();
        const avatarUrl = resolveDirectImageUrl(data.avatar_url);
        const thumbnailUrl = resolveDirectImageUrl(data.thumbnail_url);
        const bannerUrl = resolveDirectImageUrl(data.banner_url);

        // 1. Bot Profile
        if (prevBotName) prevBotName.textContent = data.username || "Webhook Sender";
        if (prevAvatarImg) {
            if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
                prevAvatarImg.src = avatarUrl;
            } else {
                prevAvatarImg.src = "https://cdn.discordapp.com/embed/avatars/0.png";
            }
        }

        // 2. Container Accent & Width
        if (v2Container) {
            if (data.enable_accent_color !== false && data.accent_color) {
                v2Container.style.borderLeftColor = data.accent_color;
                v2Container.style.borderLeftWidth = '4px';
                v2Container.style.borderLeftStyle = 'solid';
            } else {
                v2Container.style.borderLeftColor = 'transparent';
                v2Container.style.borderLeftWidth = '0px';
                v2Container.style.borderLeftStyle = 'none';
            }
            if (data.expand_width && data.width_spaces > 0) {
                const calculatedWidth = Math.min(540, Math.max(320, 300 + data.width_spaces * 4));
                v2Container.style.width = '100%';
                v2Container.style.maxWidth = `${calculatedWidth}px`;
            } else {
                v2Container.style.width = '100%';
                v2Container.style.maxWidth = '460px';
            }
        }

        // 3. Header & Thumbnail
        if (v2TitleDisplay) {
            if (data.title) {
                let formattedTitle = escapeHtml(data.title);
                formattedTitle = formattedTitle.replace(/&lt;a:([a-zA-Z0-9_]+):(\d+)&gt;/g, '<img class="discord-custom-emoji animated" src="https://cdn.discordapp.com/emojis/$2.gif?size=48&quality=lossless" alt=":$1:" title=":$1:">');
                formattedTitle = formattedTitle.replace(/&lt;:([a-zA-Z0-9_]+):(\d+)&gt;/g, '<img class="discord-custom-emoji" src="https://cdn.discordapp.com/emojis/$2.png?size=48&quality=lossless" alt=":$1:" title=":$1:">');
                v2TitleDisplay.innerHTML = `# ${formattedTitle}`;
                v2TitleDisplay.style.display = 'block';
            } else {
                v2TitleDisplay.innerHTML = '';
                v2TitleDisplay.style.display = 'none';
            }
        }

        if (v2ThumbnailWrapper && v2ThumbnailImg) {
            if (thumbnailUrl && (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://'))) {
                v2ThumbnailImg.src = thumbnailUrl;
                v2ThumbnailWrapper.style.display = 'block';
            } else {
                v2ThumbnailWrapper.style.display = 'none';
            }
        }

        if (v2HeaderSection) {
            const hasHeader = Boolean(data.title || (thumbnailUrl && thumbnailUrl.startsWith('http')));
            v2HeaderSection.style.display = hasHeader ? 'flex' : 'none';
        }

        // 4. Main Content Display
        if (v2ContentDisplay) {
            if (data.main_content && data.main_content.trim()) {
                v2ContentDisplay.innerHTML = formatDiscordMarkdown(data.main_content);
                v2ContentDisplay.style.display = 'block';
            } else {
                v2ContentDisplay.innerHTML = '';
                v2ContentDisplay.style.display = 'none';
            }
        }

        // 5. Banner Image Display
        if (v2BannerWrapper && v2BannerImg) {
            if (bannerUrl && (bannerUrl.startsWith('http://') || bannerUrl.startsWith('https://'))) {
                v2BannerImg.src = bannerUrl;
                v2BannerWrapper.style.display = 'block';
            } else {
                v2BannerWrapper.style.display = 'none';
            }
        }

        // 6. Price & Customizable Footer Subtext Display
        if (v2PriceWrapper && v2PriceDisplay) {
            if (data.price_text && data.price_text.trim()) {
                const prefix = data.price_prefix !== undefined ? data.price_prefix : 'Price: ';
                const fullPriceText = `${prefix}${data.price_text.trim()}`;
                if (data.price_subtext) {
                    v2PriceDisplay.innerHTML = `<span class="v2-subtext-muted">${escapeHtml(fullPriceText)}</span>`;
                } else {
                    v2PriceDisplay.innerHTML = `<span class="v2-text-normal">${escapeHtml(fullPriceText)}</span>`;
                }
                v2PriceWrapper.style.display = 'block';
                if (v2PriceDivider) {
                    const hasPrecedingContent = Boolean(data.title || data.main_content.trim() || (bannerUrl && bannerUrl.startsWith('http')));
                    v2PriceDivider.style.display = (data.show_divider && hasPrecedingContent) ? 'block' : 'none';
                }
            } else {
                v2PriceWrapper.style.display = 'none';
            }
        }

        // 7. Action Row Buttons
        if (v2ButtonsRow && v2ActionRowWrapper) {
            v2ButtonsRow.innerHTML = '';
            if (data.buttons_data.length > 0) {
                data.buttons_data.forEach(btn => {
                    const btnLabel = (btn.label || '').trim();
                    const a = document.createElement('a');
                    a.className = 'v2-btn-link';
                    a.href = btn.url || '#';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';

                    const emojiMatch = btnLabel.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
                    if (emojiMatch) {
                        const isAnim = Boolean(emojiMatch[1]);
                        const eName = emojiMatch[2];
                        const eId = emojiMatch[3];
                        const cleaned = btnLabel.replace(/<(a)?:[a-zA-Z0-9_]+:\d+>/, '').trim();
                        a.innerHTML = `<img class="discord-btn-emoji" src="https://cdn.discordapp.com/emojis/${eId}.${isAnim ? 'gif' : 'png'}?size=32" alt=":${eName}:"> <span>${escapeHtml(cleaned || eName)}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
                    } else {
                        a.innerHTML = `<span>${escapeHtml(btnLabel)}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
                    }
                    v2ButtonsRow.appendChild(a);
                });
                v2ActionRowWrapper.style.display = 'block';
                if (v2ButtonsDivider) {
                    const hasPrecedingContent = Boolean(data.title || data.main_content.trim() || (bannerUrl && bannerUrl.startsWith('http')) || (data.price_text && data.price_text.trim()));
                    v2ButtonsDivider.style.display = (data.show_divider && hasPrecedingContent) ? 'block' : 'none';
                }
            } else {
                v2ActionRowWrapper.style.display = 'none';
            }
        }

        // Fallback placeholder if container is completely empty
        const hasAnyContent = Boolean(
            data.title || 
            (data.main_content && data.main_content.trim()) || 
            (bannerUrl && bannerUrl.startsWith('http')) || 
            (thumbnailUrl && thumbnailUrl.startsWith('http')) || 
            (data.price_text && data.price_text.trim()) || 
            data.buttons_data.length > 0
        );

        if (!hasAnyContent && v2ContentDisplay) {
            v2ContentDisplay.innerHTML = '<span style="color: var(--text-muted); font-style: italic; font-size: 0.76rem;">(Empty Message Container)</span>';
            v2ContentDisplay.style.display = 'block';
        }

        // Instantly update Local JSON Viewer
        if (jsonCodeDisplay) {
            const localPayload = buildLocalComponentsV2Payload(data);
            jsonCodeDisplay.textContent = JSON.stringify(localPayload, null, 2);
        }

        // Fetch Backend Payload JSON Preview for double validation
        fetchPayloadPreview(data);
    }

    // Fetch JSON Preview from Flask backend (debounced)
    let previewDebounceTimer;
    function fetchPayloadPreview(data) {
        clearTimeout(previewDebounceTimer);
        previewDebounceTimer = setTimeout(() => {
            fetch('/api/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                if (res.success && jsonCodeDisplay) {
                    jsonCodeDisplay.textContent = JSON.stringify(res.payload, null, 2);
                }
            })
            .catch(err => {
                // Keep local payload on network glitch
                console.debug("Backend preview fetch notice:", err);
            });
        }, 150);
    }

    // Send Webhook Handler
    if (sendWebhookBtn) {
        sendWebhookBtn.addEventListener('click', () => {
            const data = getFormData();

            if (!data.webhook_url) {
                showToast('Please enter your Discord Webhook URL!', 'error');
                if (webhookUrlInput) webhookUrlInput.focus();
                return;
            }

            sendWebhookBtn.disabled = true;
            sendWebhookBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            if (logStatusBadge) {
                logStatusBadge.className = 'log-badge ready';
                logStatusBadge.textContent = 'Posting...';
            }
            if (logBodyText) {
                logBodyText.textContent = `Sending POST request to Discord Webhook...`;
            }

            const payload = buildLocalComponentsV2Payload(data);

            const directSendToDiscord = async () => {
                const targetUrl = data.webhook_url.trim() + (data.webhook_url.includes('?') ? '&with_components=true' : '?with_components=true');
                const discordRes = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (discordRes.ok) {
                    showToast('Components V2 message sent successfully to Discord!', 'success');
                    if (logStatusBadge) {
                        logStatusBadge.className = 'log-badge success';
                        logStatusBadge.textContent = `HTTP ${discordRes.status || 204} OK`;
                    }
                    if (logBodyText) {
                        logBodyText.innerHTML = `<span style="color: var(--discord-green)">✔ Components V2 payload successfully delivered to Discord!</span>`;
                    }
                    saveState();
                    return true;
                } else {
                    const errText = await discordRes.text();
                    throw new Error(`Discord API Error (${discordRes.status}): ${errText.slice(0, 300)}`);
                }
            };

            fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(async res => {
                const text = await res.text();
                let json = null;
                try {
                    json = JSON.parse(text);
                } catch(e) {
                    // Non-JSON response from server proxy -> direct client dispatch
                    return directSendToDiscord();
                }

                if (json.success) {
                    showToast(json.message, 'success');
                    if (logStatusBadge) {
                        logStatusBadge.className = 'log-badge success';
                        logStatusBadge.textContent = `HTTP ${json.status_code || 204} OK`;
                    }
                    if (logBodyText) {
                        logBodyText.innerHTML = `<span style="color: var(--discord-green)">✔ Components V2 payload successfully delivered to Discord!</span>`;
                    }
                    saveState();
                } else {
                    showToast(json.error, 'error');
                    if (logStatusBadge) {
                        logStatusBadge.className = 'log-badge error';
                        logStatusBadge.textContent = `Failed`;
                    }
                    if (logBodyText) {
                        logBodyText.innerHTML = `<span style="color: var(--discord-red)">❌ ${escapeHtml(json.error)}</span>`;
                    }
                }
            })
            .catch(async err => {
                try {
                    await directSendToDiscord();
                } catch(fallbackErr) {
                    showToast('Error: ' + fallbackErr.message, 'error');
                    if (logStatusBadge) {
                        logStatusBadge.className = 'log-badge error';
                        logStatusBadge.textContent = 'Error';
                    }
                    if (logBodyText) {
                        logBodyText.innerHTML = `<span style="color: var(--discord-red)">❌ ${escapeHtml(fallbackErr.message)}</span>`;
                    }
                }
            })
            .finally(() => {
                sendWebhookBtn.disabled = false;
                sendWebhookBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Webhook';
            });
        });
    }

    // Copy JSON Helper
    function copyJsonToClipboard() {
        if (!jsonCodeDisplay) return;
        const jsonText = jsonCodeDisplay.textContent;
        navigator.clipboard.writeText(jsonText).then(() => {
            showToast('JSON payload copied to clipboard!', 'success');
        });
    }

    if (copyJsonBtn) copyJsonBtn.addEventListener('click', copyJsonToClipboard);
    if (copyJsonTabBtn) copyJsonTabBtn.addEventListener('click', copyJsonToClipboard);
    if (savePresetBtn) savePresetBtn.addEventListener('click', saveState);

    // ==========================================
    // IN-WEBSITE SAVED MESSAGES VAULT & BAR MANAGER
    // ==========================================
    const VAULT_STORAGE_KEY = 'dc_saved_messages_vault_v2';
    const ACTIVE_PRESET_KEY = 'dc_active_preset_id';
    let currentActivePresetId = localStorage.getItem(ACTIVE_PRESET_KEY) || null;
    let pendingRenameId = null;

    const DEFAULT_VAULT_PRESETS = [
        {
            id: "preset_modmenu",
            name: "Mod Menu V7A",
            updatedAt: Date.now() - 3600000 * 2,
            data: {
                title: "Mod Menu V7A",
                thumbnail_url: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
                banner_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
                accent_color: "#00F0FF",
                expand_width: true,
                width_spaces: 22,
                show_divider: true,
                main_content: "## Memory\n• Silent Aim\n• Aimbot Lite\n\n## Exploits\n• Ghost\n• Speed Hack\n\n## ESP\n• Show Name\n• Show Distance\n• Show Health",
                price_prefix: "Price: ",
                price_text: "De R$ 10,00 a R$ 100,00",
                price_subtext: true,
                buttons_data: [
                    { label: "🛒 Ver Opções", url: "https://example.com" },
                    { label: "💬 Suporte", url: "https://discord.gg" }
                ],
                username: "Mod Menu Bot",
                avatar_url: ""
            }
        },
        {
            id: "preset_store",
            name: "VIP Store Package",
            updatedAt: Date.now() - 3600000 * 5,
            data: {
                title: "🔥 VIP Exclusive Package",
                thumbnail_url: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
                banner_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
                accent_color: "#FFD700",
                expand_width: true,
                width_spaces: 22,
                show_divider: true,
                main_content: "## Exclusive VIP Features\n• Unlimited Access to All Features\n• Priority 24/7 VIP Support Desk\n• Custom Discord Role & Secret Channel\n• Early Beta Updates Access",
                price_prefix: "Plan: ",
                price_text: "$19.99 / Lifetime Access",
                price_subtext: true,
                buttons_data: [
                    { label: "💳 Buy Now", url: "https://example.com/checkout" },
                    { label: "⭐ Customer Reviews", url: "https://example.com/reviews" }
                ],
                username: "Store Bot",
                avatar_url: ""
            }
        },
        {
            id: "preset_update",
            name: "System Update v3.2",
            updatedAt: Date.now() - 3600000 * 24,
            data: {
                title: "🚀 System Update v3.2 Released",
                thumbnail_url: "https://cdn-icons-png.flaticon.com/512/1162/1162499.png",
                banner_url: "",
                accent_color: "#5865F2",
                expand_width: true,
                width_spaces: 22,
                show_divider: true,
                main_content: "## What's New?\n• Fixed anti-cheat bypass latency\n• Enhanced UI responsiveness\n• Added 5 new custom features\n\n## Bug Fixes\n• Resolved crash on Windows 11",
                price_prefix: "Status: ",
                price_text: "Free Update for Existing Users",
                price_subtext: true,
                buttons_data: [
                    { label: "📥 Download Update", url: "https://example.com/download" },
                    { label: "📜 Patch Notes", url: "https://example.com/changelog" }
                ],
                username: "Update System",
                avatar_url: ""
            }
        },
        {
            id: "preset_support",
            name: "Customer Support Desk",
            updatedAt: Date.now() - 3600000 * 48,
            data: {
                title: "🛠️ Need Help or Support?",
                thumbnail_url: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
                banner_url: "",
                accent_color: "#00FF9D",
                expand_width: true,
                width_spaces: 22,
                show_divider: true,
                main_content: "## Customer Support Center\nOur team is active 24/7 to resolve your queries.\n\n• Open a support ticket below\n• Check FAQ documentation\n• Read community guides",
                price_prefix: "Notice: ",
                price_text: "Support is Always Free & Fast",
                price_subtext: true,
                buttons_data: [
                    { label: "🎫 Open Ticket", url: "https://discord.gg" },
                    { label: "📖 Knowledgebase", url: "https://example.com/faq" }
                ],
                username: "Support Desk",
                avatar_url: ""
            }
        },
        {
            id: "preset_rules",
            name: "Server Rules & Guidelines",
            updatedAt: Date.now() - 3600000 * 72,
            data: {
                title: "📜 Server Rules & Guidelines",
                thumbnail_url: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
                banner_url: "",
                accent_color: "#FF3366",
                expand_width: true,
                width_spaces: 22,
                show_divider: true,
                main_content: "## Community Guidelines\n1. Be respectful to all community members\n2. No spamming or self-promotion\n3. Keep topics in appropriate channels\n4. Follow Discord Terms of Service",
                price_prefix: "Rule Set: ",
                price_text: "Enforced by Moderation Team",
                price_subtext: true,
                buttons_data: [
                    { label: "🌐 Full Rules", url: "https://example.com/rules" }
                ],
                username: "Server Bot",
                avatar_url: ""
            }
        }
    ];

    function getVaultPresets() {
        try {
            const raw = localStorage.getItem(VAULT_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(DEFAULT_VAULT_PRESETS));
                return JSON.parse(JSON.stringify(DEFAULT_VAULT_PRESETS));
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Error loading vault presets:', e);
            return [];
        }
    }

    function saveVaultPresets(presets) {
        try {
            localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(presets));
        } catch (e) {
            console.error('Error saving vault presets:', e);
            showToast('Storage error: could not save to browser storage', 'error');
        }
    }

    function formatTimeAgo(timestamp) {
        if (!timestamp) return '';
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) return 'Just now';
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        const d = new Date(timestamp);
        return d.toLocaleDateString();
    }

    // Load Preset into Editor
    function loadPreset(presetId, quiet = false) {
        const presets = getVaultPresets();
        const preset = presets.find(p => p.id === presetId);
        if (!preset || !preset.data) {
            showToast('Preset not found!', 'error');
            return;
        }

        const data = preset.data;
        if (titleInput) titleInput.value = data.title || '';
        if (thumbnailInput) thumbnailInput.value = data.thumbnail_url || '';
        if (bannerInput) bannerInput.value = data.banner_url || '';
        if (data.enable_accent_color === false || data.accent_color === null || data.accent_color === 'none') {
            setColorAccent(null);
        } else if (accentColorPicker) {
            setColorAccent(data.accent_color || '#00F0FF');
        }
        if (showDividerCheck) showDividerCheck.checked = data.show_divider !== undefined ? data.show_divider : true;
        if (expandWidthCheck) expandWidthCheck.checked = data.expand_width !== undefined ? data.expand_width : true;
        if (widthSpacesRange) {
            widthSpacesRange.value = data.width_spaces !== undefined ? data.width_spaces : 22;
            if (paddingValDisplay) paddingValDisplay.textContent = widthSpacesRange.value;
        }
        if (mainContentArea) mainContentArea.value = data.main_content || '';
        if (pricePrefixInput) pricePrefixInput.value = data.price_prefix !== undefined ? data.price_prefix : 'Price: ';
        if (priceTextInput) priceTextInput.value = data.price_text || '';
        if (priceSubtextCheck) priceSubtextCheck.checked = data.price_subtext !== undefined ? data.price_subtext : true;
        
        // Optional Bot Identity / Webhook URL
        if (data.webhook_url && webhookUrlInput) {
            webhookUrlInput.value = data.webhook_url;
            updateUrlStatus();
        }
        if (data.username !== undefined && botUsernameInput) {
            botUsernameInput.value = data.username;
        }
        if (data.avatar_url !== undefined && botAvatarInput) {
            botAvatarInput.value = data.avatar_url;
        }

        if (Array.isArray(data.buttons_data)) {
            buttonsData = JSON.parse(JSON.stringify(data.buttons_data));
        } else {
            buttonsData = [];
        }

        currentActivePresetId = preset.id;
        localStorage.setItem(ACTIVE_PRESET_KEY, currentActivePresetId);

        renderButtonsConfig();
        updateLivePreview();
        updateCharCounter();
        renderSavedBar();
        renderVaultDrawer();

        if (!quiet) {
            showToast(`Loaded "${preset.name}" into studio!`, 'success');
        }
    }

    // Save Current Form State as New Preset Modal
    function openSavePresetModal() {
        if (!savePresetModal) return;
        const currentTitle = titleInput ? titleInput.value.trim() : '';
        let defaultName = currentTitle || "My Message Preset";
        if (savePresetNameInput) {
            savePresetNameInput.value = defaultName;
            savePresetModal.classList.add('active');
            setTimeout(() => {
                savePresetNameInput.focus();
                savePresetNameInput.select();
            }, 60);
        }
    }

    function closeSavePresetModal() {
        if (savePresetModal) savePresetModal.classList.remove('active');
    }

    function confirmSavePreset() {
        const name = (savePresetNameInput ? savePresetNameInput.value.trim() : '') || 'Untitled Preset';
        const includeWebhook = saveOptIncludeWebhook ? saveOptIncludeWebhook.checked : true;
        
        const currentData = getFormData();
        if (!includeWebhook) {
            delete currentData.webhook_url;
        }

        const presets = getVaultPresets();
        const newPreset = {
            id: 'preset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: name,
            updatedAt: Date.now(),
            data: currentData
        };

        presets.unshift(newPreset);
        saveVaultPresets(presets);
        currentActivePresetId = newPreset.id;
        localStorage.setItem(ACTIVE_PRESET_KEY, currentActivePresetId);

        closeSavePresetModal();
        renderSavedBar();
        renderVaultDrawer();
        showToast(`Saved "${name}" to your message bar!`, 'success');
    }

    // Update / Overwrite Current Active Preset
    function updateCurrentActivePreset() {
        if (!currentActivePresetId) {
            openSavePresetModal();
            return;
        }
        const presets = getVaultPresets();
        const idx = presets.findIndex(p => p.id === currentActivePresetId);
        if (idx === -1) {
            openSavePresetModal();
            return;
        }

        const includeWebhook = Boolean(presets[idx].data && presets[idx].data.webhook_url);
        const currentData = getFormData();
        if (!includeWebhook) {
            delete currentData.webhook_url;
        }

        presets[idx].data = currentData;
        presets[idx].updatedAt = Date.now();
        saveVaultPresets(presets);

        renderSavedBar();
        renderVaultDrawer();
        showToast(`Updated "${presets[idx].name}" with current changes!`, 'success');
    }

    // Delete Preset
    function deletePreset(id) {
        const presets = getVaultPresets();
        const preset = presets.find(p => p.id === id);
        const name = preset ? preset.name : 'Preset';

        const filtered = presets.filter(p => p.id !== id);
        saveVaultPresets(filtered);

        if (currentActivePresetId === id) {
            currentActivePresetId = null;
            localStorage.removeItem(ACTIVE_PRESET_KEY);
        }

        renderSavedBar();
        renderVaultDrawer();
        showToast(`Deleted "${name}"`, 'info');
    }

    // Duplicate Preset
    function duplicatePreset(id) {
        const presets = getVaultPresets();
        const preset = presets.find(p => p.id === id);
        if (!preset) return;

        const clone = {
            id: 'preset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            name: `${preset.name} (Copy)`,
            updatedAt: Date.now(),
            data: JSON.parse(JSON.stringify(preset.data))
        };

        const idx = presets.findIndex(p => p.id === id);
        presets.splice(idx + 1, 0, clone);
        saveVaultPresets(presets);
        renderSavedBar();
        renderVaultDrawer();
        showToast(`Duplicated "${preset.name}"!`, 'success');
    }

    // Rename Preset Modal
    function openRenameModal(id) {
        const presets = getVaultPresets();
        const preset = presets.find(p => p.id === id);
        if (!preset || !renamePresetModal || !renamePresetInput) return;
        pendingRenameId = id;
        renamePresetInput.value = preset.name;
        renamePresetModal.classList.add('active');
        setTimeout(() => {
            renamePresetInput.focus();
            renamePresetInput.select();
        }, 60);
    }

    function closeRenameModal() {
        if (renamePresetModal) renamePresetModal.classList.remove('active');
        pendingRenameId = null;
    }

    function confirmRenamePreset() {
        if (!pendingRenameId) return;
        const newName = (renamePresetInput ? renamePresetInput.value.trim() : '') || 'Untitled Preset';
        const presets = getVaultPresets();
        const preset = presets.find(p => p.id === pendingRenameId);
        if (preset) {
            preset.name = newName;
            preset.updatedAt = Date.now();
            saveVaultPresets(presets);
            renderSavedBar();
            renderVaultDrawer();
            showToast(`Renamed to "${newName}"!`, 'success');
        }
        closeRenameModal();
    }

    // Render Quick Saved Bar Pills
    function renderSavedBar() {
        if (!savedBarPills) return;
        const presets = getVaultPresets();
        const count = presets.length;

        if (vaultCountBadge) vaultCountBadge.textContent = count;
        if (quickBarCount) quickBarCount.textContent = count;
        if (vaultDrawerCount) vaultDrawerCount.textContent = count;

        // Active Badge
        const activePreset = presets.find(p => p.id === currentActivePresetId);
        if (activePreset && activePresetBadge && activePresetName) {
            activePresetName.textContent = activePreset.name;
            activePresetBadge.style.display = 'inline-flex';
            if (btnBarUpdateCurrent) btnBarUpdateCurrent.style.display = 'inline-flex';
        } else {
            if (activePresetBadge) activePresetBadge.style.display = 'none';
            if (btnBarUpdateCurrent) btnBarUpdateCurrent.style.display = 'none';
        }

        savedBarPills.innerHTML = '';

        if (count === 0) {
            savedBarPills.innerHTML = '<span class="saved-pill-empty-msg">No saved messages yet. Click "+ Save Current" to create one!</span>';
        } else {
            presets.forEach(preset => {
                const pill = document.createElement('div');
                const isActive = preset.id === currentActivePresetId;
                pill.className = `saved-pill ${isActive ? 'active' : ''}`;
                pill.title = `Click to load "${escapeHtml(preset.name)}"`;
                const accent = (preset.data && preset.data.accent_color) ? preset.data.accent_color : '#00F0FF';

                pill.innerHTML = `
                    <span class="saved-pill-dot" style="background-color: ${accent}; color: ${accent};"></span>
                    <span class="saved-pill-name">${escapeHtml(preset.name)}</span>
                    <button type="button" class="saved-pill-btn-del" title="Delete preset" data-id="${preset.id}">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;

                // Click pill to load
                pill.addEventListener('click', (e) => {
                    if (e.target.closest('.saved-pill-btn-del')) return;
                    loadPreset(preset.id);
                });

                // Click x to delete
                const delBtn = pill.querySelector('.saved-pill-btn-del');
                if (delBtn) {
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deletePreset(preset.id);
                    });
                }

                savedBarPills.appendChild(pill);
            });
        }

        // Add Quick Save Pill at end
        const addPill = document.createElement('button');
        addPill.type = 'button';
        addPill.className = 'saved-pill-add';
        addPill.innerHTML = '<i class="fa-solid fa-plus"></i> Save New';
        addPill.addEventListener('click', openSavePresetModal);
        savedBarPills.appendChild(addPill);
    }

    // Render Vault Drawer Cards
    function renderVaultDrawer() {
        if (!vaultCardsContainer) return;
        const presets = getVaultPresets();
        const query = (vaultSearchInput ? vaultSearchInput.value.trim().toLowerCase() : '');

        let filtered = presets;
        if (query) {
            filtered = presets.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(query);
                const titleMatch = (p.data && p.data.title && p.data.title.toLowerCase().includes(query));
                const textMatch = (p.data && p.data.main_content && p.data.main_content.toLowerCase().includes(query));
                return nameMatch || titleMatch || textMatch;
            });
        }

        if (btnClearSearch) {
            btnClearSearch.style.display = query ? 'block' : 'none';
        }

        vaultCardsContainer.innerHTML = '';

        if (filtered.length === 0) {
            vaultCardsContainer.innerHTML = `
                <div class="vault-empty-state">
                    <i class="fa-solid fa-folder-open vault-empty-icon"></i>
                    <div class="vault-empty-title">${query ? 'No matching saved messages' : 'Your Library is Empty'}</div>
                    <p class="vault-empty-desc">${query ? 'Try searching for different keywords or clear the search.' : 'Click "Save Current" to store your Discord message layouts right here on the website!'}</p>
                </div>
            `;
            return;
        }

        filtered.forEach(preset => {
            const card = document.createElement('div');
            const isActive = preset.id === currentActivePresetId;
            const accent = (preset.data && preset.data.accent_color) ? preset.data.accent_color : '#00F0FF';
            card.className = `vault-card ${isActive ? 'active' : ''}`;
            card.style.borderLeftColor = accent;

            const timeStr = formatTimeAgo(preset.updatedAt);
            const btnCount = (preset.data && preset.data.buttons_data) ? preset.data.buttons_data.length : 0;
            const hasBanner = Boolean(preset.data && preset.data.banner_url);
            const hasThumb = Boolean(preset.data && preset.data.thumbnail_url);
            const rawContent = (preset.data && preset.data.main_content) ? preset.data.main_content : '(No description)';

            card.innerHTML = `
                <div class="vault-card-header">
                    <div class="vault-card-title-box">
                        <div class="vault-card-name">
                            <span>${escapeHtml(preset.name)}</span>
                            ${isActive ? '<span class="vault-card-active-tag"><i class="fa-solid fa-check"></i> Active</span>' : ''}
                        </div>
                        <span class="vault-card-date"><i class="fa-regular fa-clock"></i> ${timeStr}</span>
                    </div>
                </div>

                <div class="vault-card-snippet">
                    ${escapeHtml(rawContent.replace(/\n+/g, ' '))}
                </div>

                <div class="vault-card-meta-row">
                    <span class="vault-meta-tag color-tag" style="border-color:${accent}44;">
                        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${accent};margin-right:2px;"></span>
                        ${accent}
                    </span>
                    ${btnCount > 0 ? `<span class="vault-meta-tag"><i class="fa-solid fa-square-arrow-up-right"></i> ${btnCount} ${btnCount === 1 ? 'Btn' : 'Btns'}</span>` : ''}
                    ${hasBanner ? `<span class="vault-meta-tag"><i class="fa-solid fa-image"></i> Banner</span>` : ''}
                    ${hasThumb ? `<span class="vault-meta-tag"><i class="fa-solid fa-icons"></i> Icon</span>` : ''}
                </div>

                <div class="vault-card-actions">
                    <div class="vault-actions-left">
                        <button type="button" class="btn-vault-action primary btn-load-preset" data-id="${preset.id}">
                            <i class="fa-solid fa-bolt"></i> Load
                        </button>
                        <button type="button" class="btn-vault-action update btn-update-preset" data-id="${preset.id}" title="Overwrite with current editor values">
                            <i class="fa-solid fa-arrows-rotate"></i> Sync
                        </button>
                    </div>
                    <div class="vault-actions-right">
                        <button type="button" class="btn-vault-action icon-only btn-rename-preset" data-id="${preset.id}" title="Rename Preset">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="btn-vault-action icon-only btn-dup-preset" data-id="${preset.id}" title="Duplicate Preset">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                        <button type="button" class="btn-vault-action icon-only danger btn-del-preset" data-id="${preset.id}" title="Delete Preset">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;

            // Wire Card Buttons
            card.querySelector('.btn-load-preset').addEventListener('click', () => {
                loadPreset(preset.id);
                closeVaultDrawer();
            });

            card.querySelector('.btn-update-preset').addEventListener('click', () => {
                currentActivePresetId = preset.id;
                updateCurrentActivePreset();
            });

            card.querySelector('.btn-rename-preset').addEventListener('click', () => {
                openRenameModal(preset.id);
            });

            card.querySelector('.btn-dup-preset').addEventListener('click', () => {
                duplicatePreset(preset.id);
            });

            card.querySelector('.btn-del-preset').addEventListener('click', () => {
                deletePreset(preset.id);
            });

            vaultCardsContainer.appendChild(card);
        });
    }

    // Vault Drawer Open & Close
    function openVaultDrawer() {
        if (!vaultDrawerOverlay) return;
        renderVaultDrawer();
        vaultDrawerOverlay.classList.add('active');
        if (vaultSearchInput) {
            setTimeout(() => vaultSearchInput.focus(), 150);
        }
    }

    function closeVaultDrawer() {
        if (vaultDrawerOverlay) vaultDrawerOverlay.classList.remove('active');
    }

    // Attach Event Listeners for Vault & Saved Bar
    if (btnOpenVault) btnOpenVault.addEventListener('click', openVaultDrawer);
    if (btnSaveCurrent) btnSaveCurrent.addEventListener('click', openSavePresetModal);
    if (btnBarSaveNew) btnBarSaveNew.addEventListener('click', openSavePresetModal);
    if (btnBarUpdateCurrent) btnBarUpdateCurrent.addEventListener('click', updateCurrentActivePreset);
    if (btnBarViewAll) btnBarViewAll.addEventListener('click', openVaultDrawer);

    if (btnCloseVaultDrawer) btnCloseVaultDrawer.addEventListener('click', closeVaultDrawer);
    if (vaultDrawerOverlay) {
        vaultDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === vaultDrawerOverlay) closeVaultDrawer();
        });
    }

    if (btnDrawerQuickSave) btnDrawerQuickSave.addEventListener('click', openSavePresetModal);

    if (vaultSearchInput) {
        vaultSearchInput.addEventListener('input', () => {
            renderVaultDrawer();
        });
    }

    if (btnClearSearch && vaultSearchInput) {
        btnClearSearch.addEventListener('click', () => {
            vaultSearchInput.value = '';
            renderVaultDrawer();
            vaultSearchInput.focus();
        });
    }

    // Save Preset Modal Events
    if (btnConfirmSavePreset) btnConfirmSavePreset.addEventListener('click', confirmSavePreset);
    if (btnCancelSavePreset) btnCancelSavePreset.addEventListener('click', closeSavePresetModal);
    if (btnCloseSaveModal) btnCloseSaveModal.addEventListener('click', closeSavePresetModal);

    if (savePresetModal) {
        savePresetModal.addEventListener('click', (e) => {
            if (e.target === savePresetModal) closeSavePresetModal();
        });
    }

    if (savePresetNameInput) {
        savePresetNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmSavePreset();
            } else if (e.key === 'Escape') {
                closeSavePresetModal();
            }
        });
    }

    document.querySelectorAll('.save-tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (savePresetNameInput) {
                savePresetNameInput.value = chip.dataset.name;
                savePresetNameInput.focus();
            }
        });
    });

    // Rename Modal Events
    if (btnConfirmRenamePreset) btnConfirmRenamePreset.addEventListener('click', confirmRenamePreset);
    if (btnCancelRenamePreset) btnCancelRenamePreset.addEventListener('click', closeRenameModal);
    if (btnCloseRenameModal) btnCloseRenameModal.addEventListener('click', closeRenameModal);

    if (renamePresetModal) {
        renamePresetModal.addEventListener('click', (e) => {
            if (e.target === renamePresetModal) closeRenameModal();
        });
    }

    if (renamePresetInput) {
        renamePresetInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmRenamePreset();
            } else if (e.key === 'Escape') {
                closeRenameModal();
            }
        });
    }

    // Vault Backup & Restore
    if (btnVaultExportBackup) {
        btnVaultExportBackup.addEventListener('click', () => {
            const presets = getVaultPresets();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presets, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute("href", dataStr);
            dlAnchorElem.setAttribute("download", `discord_webhook_vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(dlAnchorElem);
            dlAnchorElem.click();
            dlAnchorElem.remove();
            showToast('All saved messages exported as backup!', 'success');
        });
    }

    if (btnVaultImportBackup && vaultImportFile) {
        btnVaultImportBackup.addEventListener('click', () => {
            vaultImportFile.click();
        });

        vaultImportFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (Array.isArray(imported)) {
                        saveVaultPresets(imported);
                        renderSavedBar();
                        renderVaultDrawer();
                        showToast(`Restored ${imported.length} saved messages!`, 'success');
                    } else {
                        showToast('Invalid vault backup format', 'error');
                    }
                } catch (err) {
                    showToast('Invalid JSON backup file', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    if (btnVaultResetDefaults) {
        btnVaultResetDefaults.addEventListener('click', () => {
            if (confirm('Reset all saved presets to standard defaults? Any custom presets will be replaced.')) {
                saveVaultPresets(DEFAULT_VAULT_PRESETS);
                currentActivePresetId = null;
                localStorage.removeItem(ACTIVE_PRESET_KEY);
                renderSavedBar();
                renderVaultDrawer();
                showToast('Reset library to default templates', 'info');
            }
        });
    }

    // Export Modal & Custom Filename Logic
    function openExportModal() {
        if (!exportModal) return;
        const titleText = titleInput ? titleInput.value.trim() : '';
        let defaultName = "discord_webhook_config";
        if (titleText) {
            const slug = titleText.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            if (slug) {
                defaultName = `discord_${slug}`;
            }
        }
        if (exportFilenameInput) {
            exportFilenameInput.value = defaultName;
            exportModal.classList.add('active');
            setTimeout(() => {
                exportFilenameInput.focus();
                exportFilenameInput.select();
            }, 50);
        }
    }

    function closeExportModal() {
        if (exportModal) exportModal.classList.remove('active');
    }

    function downloadConfigJSON(customFilename) {
        let name = (customFilename || '').trim();
        if (!name) name = 'discord_webhook_config';
        if (!name.endsWith('.json')) {
            name += '.json';
        }

        const data = getFormData();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", name);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        dlAnchorElem.remove();

        closeExportModal();
        showToast(`Config exported as "${name}"!`, 'success');
    }

    if (exportJsonBtn) exportJsonBtn.addEventListener('click', openExportModal);

    if (btnConfirmExport) {
        btnConfirmExport.addEventListener('click', () => {
            if (exportFilenameInput) downloadConfigJSON(exportFilenameInput.value);
        });
    }

    if (btnCancelExport) btnCancelExport.addEventListener('click', closeExportModal);
    if (btnCloseExportModal) btnCloseExportModal.addEventListener('click', closeExportModal);

    if (exportModal) {
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                closeExportModal();
            }
        });
    }

    if (exportFilenameInput) {
        exportFilenameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                downloadConfigJSON(exportFilenameInput.value);
            } else if (e.key === 'Escape') {
                closeExportModal();
            }
        });
    }

    document.querySelectorAll('.chip-btn').forEach(btn => {
        if (btn.classList.contains('save-tag-chip')) return;
        btn.addEventListener('click', () => {
            if (exportFilenameInput) {
                exportFilenameInput.value = btn.dataset.name;
                exportFilenameInput.focus();
            }
        });
    });

    // Import Config JSON File
    if (importJsonBtn && importJsonFile) {
        importJsonBtn.addEventListener('click', () => {
            importJsonFile.click();
        });

        importJsonFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    if (config.webhook_url !== undefined && webhookUrlInput) webhookUrlInput.value = config.webhook_url;
                    if (config.username !== undefined && botUsernameInput) botUsernameInput.value = config.username;
                    if (config.avatar_url !== undefined && botAvatarInput) botAvatarInput.value = config.avatar_url;
                    if (config.title !== undefined && titleInput) titleInput.value = config.title;
                    if (config.thumbnail_url !== undefined && thumbnailInput) thumbnailInput.value = config.thumbnail_url;
                    if (config.banner_url !== undefined && bannerInput) bannerInput.value = config.banner_url;
                    if (config.enable_accent_color === false || config.accent_color === null || config.accent_color === 'none') {
                        setColorAccent(null);
                    } else if (config.accent_color !== undefined) {
                        setColorAccent(config.accent_color);
                    }
                    if (config.show_divider !== undefined && showDividerCheck) {
                        showDividerCheck.checked = config.show_divider;
                    }
                    if (config.expand_width !== undefined && expandWidthCheck) {
                        expandWidthCheck.checked = config.expand_width;
                    }
                    if (config.width_spaces !== undefined && widthSpacesRange) {
                        widthSpacesRange.value = config.width_spaces;
                        if (paddingValDisplay) paddingValDisplay.textContent = config.width_spaces;
                    }
                    if (config.main_content !== undefined && mainContentArea) mainContentArea.value = config.main_content;
                    if (config.price_prefix !== undefined && pricePrefixInput) pricePrefixInput.value = config.price_prefix;
                    if (config.price_text !== undefined && priceTextInput) priceTextInput.value = config.price_text;
                    if (config.price_subtext !== undefined && priceSubtextCheck) priceSubtextCheck.checked = config.price_subtext;
                    if (Array.isArray(config.buttons_data)) buttonsData = config.buttons_data;

                    currentActivePresetId = null;
                    localStorage.removeItem(ACTIVE_PRESET_KEY);

                    updateUrlStatus();
                    renderButtonsConfig();
                    updateLivePreview();
                    updateCharCounter();
                    renderSavedBar();
                    renderVaultDrawer();
                    showToast('Config loaded from JSON!', 'success');
                } catch (err) {
                    showToast('Invalid JSON file format', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const target = document.getElementById(`tab-${btn.dataset.tab}`);
            if (target) target.classList.add('active');
        });
    });

    // ==========================================
    // DISCORD CUSTOM EMOJI CONTROLLER & LIBRARY
    // ==========================================
    const CUSTOM_EMOJI_STORAGE_KEY = 'dc_custom_emojis_v1';
    const DEFAULT_CUSTOM_EMOJIS = [
        { name: "discord", id: "853314984784429076", animated: false },
        { name: "nitro", id: "853314984784429077", animated: false },
        { name: "verified", id: "853314984784429078", animated: false },
        { name: "pepe_cool", id: "853314984784429080", animated: false }
    ];

    const btnOpenCustomEmoji = document.getElementById('btn-open-custom-emoji');
    const customEmojiModal = document.getElementById('custom-emoji-modal');
    const btnCloseCustomEmojiModal = document.getElementById('btn-close-custom-emoji-modal');
    const btnCloseEmojiDialog = document.getElementById('btn-close-emoji-dialog');
    const customEmojiInput = document.getElementById('custom-emoji-input');
    const btnParseCustomEmoji = document.getElementById('btn-parse-custom-emoji');
    const emojiPreviewImg = document.getElementById('emoji-preview-img');
    const emojiPreviewName = document.getElementById('emoji-preview-name');
    const emojiPreviewBadge = document.getElementById('emoji-preview-badge');
    const emojiPreviewCode = document.getElementById('emoji-preview-code');
    const btnInsertEmojiDesc = document.getElementById('btn-insert-emoji-desc');
    const btnInsertEmojiTitle = document.getElementById('btn-insert-emoji-title');
    const btnSaveCustomEmoji = document.getElementById('btn-save-custom-emoji');
    const customEmojiLibraryGrid = document.getElementById('custom-emoji-library-grid');
    const savedEmojiCount = document.getElementById('saved-emoji-count');
    const quickCustomEmojisBar = document.getElementById('quick-custom-emojis-bar');

    let currentParsedEmoji = {
        name: "discord",
        id: "853314984784429076",
        animated: false
    };

    function getCustomEmojis() {
        try {
            const raw = localStorage.getItem(CUSTOM_EMOJI_STORAGE_KEY);
            if (!raw) {
                localStorage.setItem(CUSTOM_EMOJI_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_EMOJIS));
                return JSON.parse(JSON.stringify(DEFAULT_CUSTOM_EMOJIS));
            }
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch(e) {
            return DEFAULT_CUSTOM_EMOJIS;
        }
    }

    function saveCustomEmojisList(list) {
        try {
            localStorage.setItem(CUSTOM_EMOJI_STORAGE_KEY, JSON.stringify(list));
        } catch(e) {}
    }

    function parseCustomEmojiString(raw) {
        if (!raw || !raw.trim()) return null;
        raw = raw.trim();

        // 1. Match standard <:name:id> or <a:name:id>
        const tagMatch = raw.match(/<(a)?:([a-zA-Z0-9_]+):(\d+)>/);
        if (tagMatch) {
            return {
                animated: Boolean(tagMatch[1]),
                name: tagMatch[2],
                id: tagMatch[3]
            };
        }

        // 2. Match URL: https://cdn.discordapp.com/emojis/123456789.(png|gif|webp)
        const urlMatch = raw.match(/cdn\.discordapp\.com\/emojis\/(\d+)\.(gif|png|webp)/i);
        if (urlMatch) {
            return {
                animated: urlMatch[2].toLowerCase() === 'gif',
                name: `emoji_${urlMatch[1].slice(-4)}`,
                id: urlMatch[1]
            };
        }

        // 3. Match name:id
        const pairMatch = raw.match(/^([a-zA-Z0-9_]+):(\d+)$/);
        if (pairMatch) {
            return {
                animated: false,
                name: pairMatch[1],
                id: pairMatch[2]
            };
        }

        // 4. Pure snowflake ID
        const idMatch = raw.match(/^(\d{17,21})$/);
        if (idMatch) {
            return {
                animated: false,
                name: `emoji_${idMatch[1].slice(-4)}`,
                id: idMatch[1]
            };
        }

        return null;
    }

    function updateEmojiPreview(emoji) {
        if (!emoji || !emoji.id) return;
        currentParsedEmoji = emoji;
        const ext = emoji.animated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=64&quality=lossless`;
        if (emojiPreviewImg) emojiPreviewImg.src = url;
        if (emojiPreviewName) emojiPreviewName.textContent = `:${emoji.name}:`;
        if (emojiPreviewBadge) {
            emojiPreviewBadge.textContent = emoji.animated ? 'Animated' : 'Static';
            emojiPreviewBadge.className = `badge-tag ${emoji.animated ? 'animated' : ''}`;
        }
        if (emojiPreviewCode) {
            const code = emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
            emojiPreviewCode.textContent = code;
        }
    }

    function insertTextAtCursor(inputElement, textToInsert) {
        if (!inputElement) return;
        inputElement.focus();
        const start = inputElement.selectionStart !== undefined ? inputElement.selectionStart : inputElement.value.length;
        const end = inputElement.selectionEnd !== undefined ? inputElement.selectionEnd : inputElement.value.length;
        const val = inputElement.value;
        inputElement.value = val.substring(0, start) + textToInsert + val.substring(end);
        inputElement.selectionStart = inputElement.selectionEnd = start + textToInsert.length;
        updateLivePreview();
        updateCharCounter();
    }

    function renderCustomEmojiLibrary() {
        const list = getCustomEmojis();
        if (savedEmojiCount) savedEmojiCount.textContent = `${list.length} saved`;
        if (customEmojiLibraryGrid) {
            customEmojiLibraryGrid.innerHTML = '';
            list.forEach((emoji, idx) => {
                const card = document.createElement('div');
                card.className = 'lib-emoji-card';
                card.title = `Click to inspect :${emoji.name}:`;
                const ext = emoji.animated ? 'gif' : 'png';
                const code = emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
                card.innerHTML = `
                    <button type="button" class="lib-emoji-del" data-index="${idx}" title="Remove">&times;</button>
                    <img src="https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=48&quality=lossless" alt=":${emoji.name}:">
                    <span class="lib-emoji-name">${escapeHtml(emoji.name)}</span>
                `;
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.lib-emoji-del')) return;
                    updateEmojiPreview(emoji);
                    if (customEmojiInput) customEmojiInput.value = code;
                });
                customEmojiLibraryGrid.appendChild(card);
            });

            customEmojiLibraryGrid.querySelectorAll('.lib-emoji-del').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.dataset.index, 10);
                    const currentList = getCustomEmojis();
                    currentList.splice(idx, 1);
                    saveCustomEmojisList(currentList);
                    renderCustomEmojiLibrary();
                    renderQuickCustomEmojisBar();
                });
            });
        }
        renderQuickCustomEmojisBar();
    }

    function renderQuickCustomEmojisBar() {
        if (!quickCustomEmojisBar) return;
        const list = getCustomEmojis();
        quickCustomEmojisBar.innerHTML = '';
        if (list.length === 0) {
            quickCustomEmojisBar.style.display = 'none';
            return;
        }
        quickCustomEmojisBar.style.display = 'flex';
        list.slice(0, 14).forEach(emoji => {
            const ext = emoji.animated ? 'gif' : 'png';
            const code = emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quick-custom-emoji-btn';
            btn.title = `Click to insert :${emoji.name}:`;
            btn.innerHTML = `<img src="https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=32&quality=lossless" alt=":${emoji.name}:">`;
            btn.addEventListener('click', () => {
                insertTextAtCursor(mainContentArea, code);
                showToast(`Inserted :${emoji.name}:`, 'info');
            });
            quickCustomEmojisBar.appendChild(btn);
        });
    }

    if (btnOpenCustomEmoji && customEmojiModal) {
        btnOpenCustomEmoji.addEventListener('click', () => {
            customEmojiModal.classList.add('active');
            renderCustomEmojiLibrary();
            if (customEmojiInput) customEmojiInput.focus();
        });
    }

    const closeCustomEmojiModal = () => {
        if (customEmojiModal) customEmojiModal.classList.remove('active');
    };
    if (btnCloseCustomEmojiModal) btnCloseCustomEmojiModal.addEventListener('click', closeCustomEmojiModal);
    if (btnCloseEmojiDialog) btnCloseEmojiDialog.addEventListener('click', closeCustomEmojiModal);

    if (btnParseCustomEmoji && customEmojiInput) {
        const doParse = () => {
            const parsed = parseCustomEmojiString(customEmojiInput.value);
            if (parsed) {
                updateEmojiPreview(parsed);
                showToast(`Parsed :${parsed.name}:!`, 'success');
            } else if (customEmojiInput.value.trim()) {
                showToast('Could not parse emoji. Use <:name:id> format', 'error');
            }
        };
        btnParseCustomEmoji.addEventListener('click', doParse);
        customEmojiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                doParse();
            }
        });
        customEmojiInput.addEventListener('input', () => {
            const parsed = parseCustomEmojiString(customEmojiInput.value);
            if (parsed) updateEmojiPreview(parsed);
        });
    }

    if (btnInsertEmojiDesc) {
        btnInsertEmojiDesc.addEventListener('click', () => {
            const code = currentParsedEmoji.animated ? 
                `<a:${currentParsedEmoji.name}:${currentParsedEmoji.id}>` : 
                `<:${currentParsedEmoji.name}:${currentParsedEmoji.id}>`;
            insertTextAtCursor(mainContentArea, code);
            closeCustomEmojiModal();
            showToast(`Inserted :${currentParsedEmoji.name}: into description!`, 'success');
        });
    }

    if (btnInsertEmojiTitle) {
        btnInsertEmojiTitle.addEventListener('click', () => {
            const code = currentParsedEmoji.animated ? 
                `<a:${currentParsedEmoji.name}:${currentParsedEmoji.id}>` : 
                `<:${currentParsedEmoji.name}:${currentParsedEmoji.id}>`;
            insertTextAtCursor(titleInput, code);
            closeCustomEmojiModal();
            showToast(`Inserted :${currentParsedEmoji.name}: into title!`, 'success');
        });
    }

    if (btnSaveCustomEmoji) {
        btnSaveCustomEmoji.addEventListener('click', () => {
            if (!currentParsedEmoji || !currentParsedEmoji.id) return;
            const list = getCustomEmojis();
            const exists = list.some(e => e.id === currentParsedEmoji.id);
            if (!exists) {
                list.unshift(currentParsedEmoji);
                saveCustomEmojisList(list);
                renderCustomEmojiLibrary();
                showToast(`Saved :${currentParsedEmoji.name}: to library!`, 'success');
            } else {
                showToast(`:${currentParsedEmoji.name}: is already in library!`, 'info');
            }
        });
    }

    // Toast Notification System
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '<i class="fa-solid fa-info-circle"></i>';
        if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';

        toast.innerHTML = `${icon} <span>${escapeHtml(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Attach Listeners to Form Inputs for Real-Time Sync
    [titleInput, thumbnailInput, bannerInput, mainContentArea, pricePrefixInput, priceTextInput, botUsernameInput, botAvatarInput].forEach(elem => {
        if (elem) {
            elem.addEventListener('input', updateLivePreview);
            elem.addEventListener('change', updateLivePreview);
        }
    });

    // Keyboard Shortcut (Ctrl+Enter to Send)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            if (sendWebhookBtn) sendWebhookBtn.click();
        }
    });

    // Initial Setup
    loadSavedState();
    renderButtonsConfig();
    updateLivePreview();
    updateCharCounter();
    renderSavedBar();
    renderVaultDrawer();
    renderCustomEmojiLibrary();
});
