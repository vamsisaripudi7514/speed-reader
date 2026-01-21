/**
 * Speed Reader Application
 * 
 * Main application controller that handles UI interactions,
 * settings management, and coordinates with the SpeedReader engine.
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const elements = {
        // Sections
        inputSection: document.getElementById('input-section'),
        readerSection: document.getElementById('reader-section'),
        
        // Logo
        logoHome: document.getElementById('logo-home'),
        homeBtn: document.getElementById('home-btn'),
        
        // Input
        textInput: document.getElementById('text-input'),
        wordCount: document.getElementById('word-count'),
        readingTime: document.getElementById('reading-time'),
        clearBtn: document.getElementById('clear-btn'),
        sampleBtn: document.getElementById('sample-btn'),
        startBtn: document.getElementById('start-btn'),
        
        // Reader Display
        wordDisplay: document.getElementById('word-display'),
        readerDisplay: document.querySelector('.reader-display'),
        focusContainer: document.querySelector('.focus-container'),
        
        // Progress
        progressFill: document.getElementById('progress-fill'),
        progressWords: document.getElementById('progress-words'),
        progressPercent: document.getElementById('progress-percent'),
        timeRemaining: document.getElementById('time-remaining'),
        
        // Completion
        completionOverlay: document.getElementById('completion-overlay'),
        completionWords: document.getElementById('completion-words'),
        completionSpeed: document.getElementById('completion-speed'),
        readAgainBtn: document.getElementById('read-again-btn'),
        newTextBtn: document.getElementById('new-text-btn'),
        
        // Cognitive UI
        modeButtons: document.querySelectorAll('.btn-mode'),
        adaptiveIndicator: document.getElementById('adaptive-indicator'),
        fatigueIndicator: document.getElementById('fatigue-indicator'),
        fatigueText: document.querySelector('.fatigue-text'),
        fatigueFill: document.querySelector('.fatigue-fill'),
        wordAnalysis: document.getElementById('word-analysis'),
        analysisTags: document.querySelector('.analysis-tags'),
        
        // Playback Controls
        playPauseBtn: document.getElementById('play-pause-btn'),
        restartBtn: document.getElementById('restart-btn'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        backBtn: document.getElementById('back-btn'),
        
        // Speed Controls
        speedSlider: document.getElementById('speed-slider'),
        speedValue: document.getElementById('speed-value'),
        speedDown: document.getElementById('speed-down'),
        speedUp: document.getElementById('speed-up'),
        speedPresets: document.querySelectorAll('.btn-preset'),
        
        // Theme
        themeToggle: document.getElementById('theme-toggle'),
        
        // Settings Panel
        settingsToggle: document.getElementById('settings-toggle'),
        settingsPanel: document.getElementById('settings-panel'),
        settingsClose: document.getElementById('settings-close'),
        fontSizeSlider: document.getElementById('font-size-slider'),
        fontSizeValue: document.getElementById('font-size-value'),
        fontFamilySelect: document.getElementById('font-family-select'),
        colorButtons: document.querySelectorAll('.color-btn'),
        pausePunctuation: document.getElementById('pause-punctuation'),
        pauseLongWords: document.getElementById('pause-long-words'),
        showContext: document.getElementById('show-context'),
        focusMode: document.getElementById('focus-mode'),
        adaptiveModeToggle: document.getElementById('adaptive-mode'),
        resetSettings: document.getElementById('reset-settings'),
        
        // Help Modal
        helpToggle: document.getElementById('help-toggle'),
        helpModal: document.getElementById('help-modal'),
        helpClose: document.getElementById('help-close'),
        
        // Toast Container
        toastContainer: document.getElementById('toast-container')
    };

    // ============================================
    // Default Settings
    // ============================================
    const defaultSettings = {
        theme: 'dark',
        wpm: 300,
        fontSize: 56,
        fontFamily: "'Inter', sans-serif",
        focusColor: '#ef4444',
        pauseAtPunctuation: true,
        extraTimeForLongWords: true,
        showContext: true,
        focusMode: false,
        adaptiveMode: true,      // NEW: Cognitive adaptation
        readingMode: 'normal'    // NEW: scan, normal, study, proofread
    };

    // ============================================
    // Application State
    // ============================================
    let settings = { ...defaultSettings };
    let reader = null;
    let contextElements = { prev: null, next: null };

    // ============================================
    // Sample Text
    // ============================================
    const sampleText = `The art of speed reading is not about rushing through text mindlessly. It's about training your brain to process information more efficiently while maintaining comprehension.

This technique, known as Rapid Serial Visual Presentation or RSVP, displays words one at a time at a fixed focal point. By eliminating the need for eye movement across the page, your brain can focus entirely on word recognition and meaning extraction.

Studies have shown that the average person reads at about 200 to 250 words per minute. With practice, many readers can double or even triple their reading speed while maintaining high comprehension levels.

The key to successful speed reading lies in eliminating subvocalization, the habit of silently pronouncing words in your head as you read. This internal speech typically limits reading speed to speaking speed. By training yourself to recognize words visually without the mental pronunciation, you can dramatically increase your reading velocity.

Another crucial factor is the optimal recognition point, highlighted in red during this exercise. This is the letter in each word where your eye should focus for the quickest word recognition. Research suggests this point is typically about one-third into the word.

Start at a comfortable pace and gradually increase your speed. Your brain is remarkably adaptable, and with consistent practice, you'll find yourself reading faster and faster while understanding more of what you read.

Remember, the goal is not just speed but comprehension. Take breaks when needed, and don't be discouraged if some material requires slower reading. Different types of content naturally require different reading speeds.

Happy reading!`;

    // ============================================
    // Initialization
    // ============================================
    function init() {
        loadSettings();
        applySettings();
        setupEventListeners();
        setupKeyboardShortcuts();
        initReader();
        
        // Initial UI state
        updateWordCount();
    }

    function initReader() {
        reader = new SpeedReader({
            wpm: settings.wpm,
            pauseAtPunctuation: settings.pauseAtPunctuation,
            extraTimeForLongWords: settings.extraTimeForLongWords,
            adaptiveMode: settings.adaptiveMode,
            onWordChange: handleWordChange,
            onProgress: handleProgress,
            onComplete: handleComplete,
            onStateChange: handleStateChange,
            onAnalysis: handleAnalysis
        });
        
        // Set initial reading mode
        if (reader.setMode) {
            reader.setMode(settings.readingMode);
        }
    }

    // ============================================
    // Settings Management
    // ============================================
    function loadSettings() {
        try {
            const saved = localStorage.getItem('speedReaderSettings');
            if (saved) {
                settings = { ...defaultSettings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem('speedReaderSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    function applySettings() {
        // Theme
        document.documentElement.setAttribute('data-theme', settings.theme);
        
        // Font Size
        document.documentElement.style.setProperty('--font-size-word', `${settings.fontSize}px`);
        elements.fontSizeSlider.value = settings.fontSize;
        elements.fontSizeValue.textContent = `${settings.fontSize}px`;
        
        // Font Family
        document.documentElement.style.setProperty('--font-display', settings.fontFamily);
        elements.fontFamilySelect.value = settings.fontFamily;
        
        // Focus Color
        document.documentElement.style.setProperty('--focus-color', settings.focusColor);
        document.documentElement.style.setProperty('--focus-glow', `${settings.focusColor}66`);
        elements.colorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === settings.focusColor);
        });
        
        // Speed
        elements.speedSlider.value = settings.wpm;
        elements.speedValue.textContent = `${settings.wpm} WPM`;
        updateSpeedPresets();
        
        // Checkboxes
        elements.pausePunctuation.checked = settings.pauseAtPunctuation;
        elements.pauseLongWords.checked = settings.extraTimeForLongWords;
        elements.showContext.checked = settings.showContext;
        elements.focusMode.checked = settings.focusMode;
        if (elements.adaptiveModeToggle) {
            elements.adaptiveModeToggle.checked = settings.adaptiveMode;
        }
        
        // Focus mode class
        document.body.classList.toggle('focus-mode', settings.focusMode);
        
        // Reading mode buttons
        elements.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === settings.readingMode);
        });
        
        // Adaptive indicator
        if (elements.adaptiveIndicator) {
            elements.adaptiveIndicator.classList.toggle('active', settings.adaptiveMode);
        }
        
        // Update reader config if exists
        if (reader) {
            reader.updateConfig({
                wpm: settings.wpm,
                pauseAtPunctuation: settings.pauseAtPunctuation,
                extraTimeForLongWords: settings.extraTimeForLongWords,
                adaptiveMode: settings.adaptiveMode
            });
            if (reader.setMode) {
                reader.setMode(settings.readingMode);
            }
        }
    }

    function resetSettingsToDefault() {
        settings = { ...defaultSettings };
        saveSettings();
        applySettings();
        showToast('Settings reset to defaults');
    }

    // ============================================
    // Event Listeners
    // ============================================
    function setupEventListeners() {
        // Text Input
        elements.textInput.addEventListener('input', handleTextInput);
        elements.clearBtn.addEventListener('click', clearText);
        elements.sampleBtn.addEventListener('click', loadSampleText);
        elements.startBtn.addEventListener('click', startReading);
        
        // Playback Controls
        elements.playPauseBtn.addEventListener('click', togglePlayPause);
        elements.restartBtn.addEventListener('click', restartReading);
        elements.prevBtn.addEventListener('click', prevWord);
        elements.nextBtn.addEventListener('click', nextWord);
        elements.backBtn.addEventListener('click', backToInput);
        elements.readAgainBtn.addEventListener('click', restartReading);
        elements.newTextBtn.addEventListener('click', backToInputAndClear);
        
        // Logo click to go home
        elements.logoHome.addEventListener('click', backToInputAndClear);
        elements.homeBtn.addEventListener('click', backToInputAndClear);
        
        // Speed Controls
        elements.speedSlider.addEventListener('input', handleSpeedChange);
        elements.speedDown.addEventListener('click', () => adjustSpeed(-25));
        elements.speedUp.addEventListener('click', () => adjustSpeed(25));
        elements.speedPresets.forEach(btn => {
            btn.addEventListener('click', () => setSpeedPreset(parseInt(btn.dataset.speed)));
        });
        
        // Reading Mode buttons
        elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => setReadingMode(btn.dataset.mode));
        });
        
        // Theme Toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        
        // Settings Panel
        elements.settingsToggle.addEventListener('click', toggleSettings);
        elements.settingsClose.addEventListener('click', closeSettings);
        elements.fontSizeSlider.addEventListener('input', handleFontSizeChange);
        elements.fontFamilySelect.addEventListener('change', handleFontFamilyChange);
        elements.colorButtons.forEach(btn => {
            btn.addEventListener('click', () => handleColorChange(btn.dataset.color));
        });
        elements.pausePunctuation.addEventListener('change', handlePausePunctuationChange);
        elements.pauseLongWords.addEventListener('change', handlePauseLongWordsChange);
        elements.showContext.addEventListener('change', handleShowContextChange);
        elements.focusMode.addEventListener('change', handleFocusModeChange);
        if (elements.adaptiveModeToggle) {
            elements.adaptiveModeToggle.addEventListener('change', handleAdaptiveModeChange);
        }
        elements.resetSettings.addEventListener('click', resetSettingsToDefault);
        
        // Help Modal
        elements.helpToggle.addEventListener('click', toggleHelp);
        elements.helpClose.addEventListener('click', closeHelp);
        elements.helpModal.addEventListener('click', (e) => {
            if (e.target === elements.helpModal) closeHelp();
        });
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.settingsPanel.contains(e.target) && 
                !elements.settingsToggle.contains(e.target) &&
                !elements.settingsPanel.classList.contains('hidden')) {
                closeSettings();
            }
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in text input
            if (e.target === elements.textInput) return;
            
            // Ignore if modal is open
            if (!elements.helpModal.classList.contains('hidden')) {
                if (e.key === 'Escape') closeHelp();
                return;
            }

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    if (!elements.readerSection.classList.contains('hidden')) {
                        togglePlayPause();
                    } else if (!elements.startBtn.disabled) {
                        startReading();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (!elements.readerSection.classList.contains('hidden')) {
                        prevWord();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (!elements.readerSection.classList.contains('hidden')) {
                        nextWord();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    adjustSpeed(25);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    adjustSpeed(-25);
                    break;
                case 'r':
                case 'R':
                    if (!elements.readerSection.classList.contains('hidden')) {
                        e.preventDefault();
                        restartReading();
                    }
                    break;
                case 'Escape':
                    if (!elements.settingsPanel.classList.contains('hidden')) {
                        closeSettings();
                    } else if (!elements.readerSection.classList.contains('hidden')) {
                        backToInput();
                    }
                    break;
                case '[':
                    if (!elements.readerSection.classList.contains('hidden')) {
                        e.preventDefault();
                        reader.jump(-10);
                    }
                    break;
                case ']':
                    if (!elements.readerSection.classList.contains('hidden')) {
                        e.preventDefault();
                        reader.jump(10);
                    }
                    break;
                case 'Home':
                    if (!elements.readerSection.classList.contains('hidden')) {
                        e.preventDefault();
                        reader.goToWord(0);
                    }
                    break;
                case 'End':
                    if (!elements.readerSection.classList.contains('hidden')) {
                        e.preventDefault();
                        reader.goToWord(reader.words.length - 1);
                    }
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    toggleTheme();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    toggleSettings();
                    break;
                case '?':
                    e.preventDefault();
                    toggleHelp();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    const presetSpeeds = [150, 250, 300, 450, 600];
                    setSpeedPreset(presetSpeeds[parseInt(e.key) - 1]);
                    break;
            }
        });
    }

    // ============================================
    // Text Input Handlers
    // ============================================
    function handleTextInput() {
        updateWordCount();
    }

    function updateWordCount() {
        const text = elements.textInput.value.trim();
        const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
        const minutes = words / settings.wpm;
        
        elements.wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
        elements.readingTime.textContent = `~${Math.ceil(minutes)} min`;
        
        elements.clearBtn.disabled = words === 0;
        elements.startBtn.disabled = words === 0;
    }

    function clearText() {
        elements.textInput.value = '';
        updateWordCount();
        elements.textInput.focus();
    }

    function loadSampleText() {
        elements.textInput.value = sampleText;
        updateWordCount();
        showToast('Sample text loaded');
    }

    // ============================================
    // Reader Controls
    // ============================================
    function startReading() {
        const text = elements.textInput.value.trim();
        if (!text) return;

        const wordCount = reader.load(text);
        if (wordCount === 0) return;

        elements.inputSection.classList.add('hidden');
        elements.readerSection.classList.remove('hidden');
        
        // Reset display
        elements.progressFill.style.width = '0%';
        elements.completionOverlay.classList.add('hidden');
        
        // Show first word without playing
        const firstWord = reader.getCurrentWord();
        if (firstWord) {
            displayWord(firstWord);
            updateProgressDisplay(1, wordCount, 0);
        }

        // Update play button state
        elements.playPauseBtn.classList.remove('playing');
    }

    function togglePlayPause() {
        if (reader.isPlaying) {
            reader.pause();
        } else {
            reader.play();
        }
    }

    function restartReading() {
        reader.restart();
        elements.completionOverlay.classList.add('hidden');
        showToast('Restarted from beginning');
    }

    function prevWord() {
        reader.prev();
    }

    function nextWord() {
        reader.next();
    }

    function backToInput() {
        reader.pause();
        elements.readerSection.classList.add('hidden');
        elements.inputSection.classList.remove('hidden');
        elements.textInput.focus();
    }
    
    function backToInputAndClear() {
        reader.pause();
        elements.textInput.value = '';
        elements.completionOverlay.classList.add('hidden');
        elements.readerSection.classList.add('hidden');
        elements.inputSection.classList.remove('hidden');
        elements.textInput.focus();
    }

    // ============================================
    // Speed Controls
    // ============================================
    function handleSpeedChange(e) {
        const wpm = parseInt(e.target.value);
        settings.wpm = wpm;
        reader.setWPM(wpm);
        elements.speedValue.textContent = `${wpm} WPM`;
        updateSpeedPresets();
        saveSettings();
    }

    function adjustSpeed(delta) {
        const newWpm = Math.max(100, Math.min(1000, settings.wpm + delta));
        settings.wpm = newWpm;
        reader.setWPM(newWpm);
        elements.speedSlider.value = newWpm;
        elements.speedValue.textContent = `${newWpm} WPM`;
        updateSpeedPresets();
        saveSettings();
        showToast(`Speed: ${newWpm} WPM`);
    }

    function setSpeedPreset(wpm) {
        settings.wpm = wpm;
        reader.setWPM(wpm);
        elements.speedSlider.value = wpm;
        elements.speedValue.textContent = `${wpm} WPM`;
        updateSpeedPresets();
        saveSettings();
    }

    function updateSpeedPresets() {
        elements.speedPresets.forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.speed) === settings.wpm);
        });
    }
    
    // ============================================
    // Reading Mode
    // ============================================
    
    function setReadingMode(mode) {
        settings.readingMode = mode;
        if (reader.setMode) {
            reader.setMode(mode);
        }
        
        // Update UI
        elements.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        saveSettings();
        showToast(`Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
    }
    
    // ============================================
    // Cognitive Analysis Display
    // ============================================
    
    function handleAnalysis(analysis) {
        if (!analysis || !elements.analysisTags) return;
        
        // Clear previous tags
        elements.analysisTags.innerHTML = '';
        
        // Display up to 3 relevant factors
        const factors = analysis.factors || [];
        const displayFactors = factors.slice(0, 3);
        
        displayFactors.forEach(factor => {
            const tag = document.createElement('span');
            tag.className = 'analysis-tag';
            
            // Categorize factors
            if (['short', 'high-freq', 'recent-repeat'].includes(factor)) {
                tag.classList.add('timing-fast');
            } else if (['long', 'very-long', 'first-occurrence', 'numeric', 'transition'].includes(factor)) {
                tag.classList.add('timing-slow');
            } else {
                tag.classList.add('semantic');
            }
            
            // Format factor name
            tag.textContent = factor.replace(/-/g, ' ');
            elements.analysisTags.appendChild(tag);
        });
        
        // Show timing multiplier if significant
        if (analysis.multiplier && Math.abs(analysis.multiplier - 1) > 0.15) {
            const timingTag = document.createElement('span');
            timingTag.className = 'analysis-tag';
            if (analysis.multiplier > 1) {
                timingTag.classList.add('timing-slow');
                timingTag.textContent = `${Math.round(analysis.multiplier * 100)}%`;
            } else {
                timingTag.classList.add('timing-fast');
                timingTag.textContent = `${Math.round(analysis.multiplier * 100)}%`;
            }
            elements.analysisTags.appendChild(timingTag);
        }
        
        // Update fatigue indicator
        updateFatigueDisplay();
    }
    
    function updateFatigueDisplay() {
        if (!reader.getFatigueStatus) return;
        
        const fatigue = reader.getFatigueStatus();
        
        if (elements.fatigueText) {
            elements.fatigueText.textContent = fatigue.status.charAt(0).toUpperCase() + fatigue.status.slice(1);
        }
        
        if (elements.fatigueFill) {
            elements.fatigueFill.style.width = `${fatigue.level * 100}%`;
            elements.fatigueFill.className = 'fatigue-fill';
            if (fatigue.level > 0.7) {
                elements.fatigueFill.classList.add('high');
            } else if (fatigue.level > 0.4) {
                elements.fatigueFill.classList.add('moderate');
            } else {
                elements.fatigueFill.classList.add('mild');
            }
        }
        
        if (elements.fatigueIndicator) {
            elements.fatigueIndicator.classList.remove('active', 'warning', 'alert');
            if (fatigue.level > 0.7) {
                elements.fatigueIndicator.classList.add('alert');
            } else if (fatigue.level > 0.4) {
                elements.fatigueIndicator.classList.add('warning');
            } else {
                elements.fatigueIndicator.classList.add('active');
            }
        }
        
        // Show fatigue recommendation if needed
        if (fatigue.recommendation && fatigue.level > 0.5) {
            // Could show a subtle notification here
        }
    }

    // ============================================
    // Reader Callbacks
    // ============================================
    function handleWordChange(wordData) {
        displayWord(wordData);
    }

    function handleProgress({ current, total, progress }) {
        updateProgressDisplay(current, total, progress);
    }

    function handleComplete(stats) {
        elements.playPauseBtn.classList.remove('playing');
        
        // Show completion overlay
        elements.completionOverlay.classList.remove('hidden');
        elements.completionWords.textContent = `${stats.wordCount} words in ${formatDuration(stats.duration)}`;
        
        // Show enhanced stats with comprehension info
        let speedText = `Actual speed: ${stats.actualWPM} WPM`;
        if (stats.comprehension && stats.comprehension.score < 1) {
            speedText += ` • Comprehension: ${Math.round(stats.comprehension.score * 100)}%`;
        }
        elements.completionSpeed.textContent = speedText;
        
        showToast(`Finished! ${stats.wordCount} words at ${stats.actualWPM} WPM`);
    }

    function handleStateChange({ state }) {
        switch (state) {
            case 'playing':
                elements.playPauseBtn.classList.add('playing');
                break;
            case 'paused':
            case 'ready':
            case 'loaded':
                elements.playPauseBtn.classList.remove('playing');
                break;
        }
    }

    // ============================================
    // Display Functions
    // ============================================
    function displayWord(wordData) {
        if (!wordData) return;

        const wordDisplay = elements.wordDisplay;
        
        // Clear previous content
        wordDisplay.innerHTML = '';
        
        // Create word parts with ORP highlighting
        const prefixSpan = document.createElement('span');
        prefixSpan.className = 'word-prefix';
        prefixSpan.textContent = wordData.prefix;
        
        const focusSpan = document.createElement('span');
        focusSpan.className = 'word-focus';
        focusSpan.textContent = wordData.focus;
        
        const suffixSpan = document.createElement('span');
        suffixSpan.className = 'word-suffix';
        suffixSpan.textContent = wordData.suffix;
        
        wordDisplay.appendChild(prefixSpan);
        wordDisplay.appendChild(focusSpan);
        wordDisplay.appendChild(suffixSpan);
        
        // Position the word so the focus letter is exactly at center
        // We need to offset by half the focus letter width plus the entire prefix width
        requestAnimationFrame(() => {
            const prefixWidth = prefixSpan.offsetWidth;
            const focusWidth = focusSpan.offsetWidth;
            // Offset = prefix width + half of focus letter
            const offset = prefixWidth + (focusWidth / 2);
            wordDisplay.style.left = `calc(50% - ${offset}px + ${focusWidth / 2}px)`;
            wordDisplay.style.transform = 'translateY(-50%)';
        });
        
        // Update context words if enabled
        updateContextWords(wordData);
    }

    function updateContextWords(wordData) {
        // Remove existing context elements
        if (contextElements.prev) {
            contextElements.prev.remove();
            contextElements.prev = null;
        }
        if (contextElements.next) {
            contextElements.next.remove();
            contextElements.next = null;
        }

        if (!settings.showContext) return;

        const container = elements.focusContainer;

        if (wordData.prevWord) {
            const prevEl = document.createElement('div');
            prevEl.className = 'word-context word-context-prev';
            prevEl.textContent = wordData.prevWord;
            container.appendChild(prevEl);
            contextElements.prev = prevEl;
        }

        if (wordData.nextWord) {
            const nextEl = document.createElement('div');
            nextEl.className = 'word-context word-context-next';
            nextEl.textContent = wordData.nextWord;
            container.appendChild(nextEl);
            contextElements.next = nextEl;
        }
    }

    function updateProgressDisplay(current, total, progress) {
        elements.progressFill.style.width = `${progress}%`;
        elements.progressWords.textContent = `${current} / ${total}`;
        elements.progressPercent.textContent = `${Math.round(progress)}%`;
        
        const remaining = reader.getEstimatedTime();
        elements.timeRemaining.textContent = `~${remaining.formatted} remaining`;
    }

    // ============================================
    // Settings Handlers
    // ============================================
    function toggleTheme() {
        settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', settings.theme);
        saveSettings();
    }

    function toggleSettings() {
        elements.settingsPanel.classList.toggle('hidden');
    }

    function closeSettings() {
        elements.settingsPanel.classList.add('hidden');
    }

    function handleFontSizeChange(e) {
        const size = parseInt(e.target.value);
        settings.fontSize = size;
        document.documentElement.style.setProperty('--font-size-word', `${size}px`);
        elements.fontSizeValue.textContent = `${size}px`;
        saveSettings();
    }

    function handleFontFamilyChange(e) {
        settings.fontFamily = e.target.value;
        document.documentElement.style.setProperty('--font-display', settings.fontFamily);
        saveSettings();
    }

    function handleColorChange(color) {
        settings.focusColor = color;
        document.documentElement.style.setProperty('--focus-color', color);
        document.documentElement.style.setProperty('--focus-glow', `${color}66`);
        elements.colorButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
        saveSettings();
    }

    function handlePausePunctuationChange(e) {
        settings.pauseAtPunctuation = e.target.checked;
        reader.updateConfig({ pauseAtPunctuation: settings.pauseAtPunctuation });
        saveSettings();
    }

    function handlePauseLongWordsChange(e) {
        settings.extraTimeForLongWords = e.target.checked;
        reader.updateConfig({ extraTimeForLongWords: settings.extraTimeForLongWords });
        saveSettings();
    }

    function handleShowContextChange(e) {
        settings.showContext = e.target.checked;
        saveSettings();
        
        // Update display if currently reading
        if (!elements.readerSection.classList.contains('hidden')) {
            const currentWord = reader.getCurrentWord();
            if (currentWord) {
                updateContextWords(currentWord);
            }
        }
    }

    function handleFocusModeChange(e) {
        settings.focusMode = e.target.checked;
        document.body.classList.toggle('focus-mode', settings.focusMode);
        saveSettings();
    }
    
    function handleAdaptiveModeChange(e) {
        settings.adaptiveMode = e.target.checked;
        if (reader.setAdaptiveMode) {
            reader.setAdaptiveMode(settings.adaptiveMode);
        }
        if (elements.adaptiveIndicator) {
            elements.adaptiveIndicator.classList.toggle('active', settings.adaptiveMode);
        }
        saveSettings();
        showToast(settings.adaptiveMode ? 'Adaptive timing enabled' : 'Adaptive timing disabled');
    }

    // ============================================
    // Help Modal
    // ============================================
    function toggleHelp() {
        elements.helpModal.classList.toggle('hidden');
    }

    function closeHelp() {
        elements.helpModal.classList.add('hidden');
    }

    // ============================================
    // Utility Functions
    // ============================================
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        
        if (mins === 0) {
            return `${secs} seconds`;
        } else if (mins === 1) {
            return `1 min ${secs} sec`;
        } else {
            return `${mins} mins ${secs} sec`;
        }
    }

    // ============================================
    // Initialize App
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
