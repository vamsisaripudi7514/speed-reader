/**
 * SpeedReader - RSVP Reading Engine
 * 
 * This module handles the core RSVP (Rapid Serial Visual Presentation) functionality
 * including word parsing, ORP (Optimal Recognition Point) calculation, and timing.
 * 
 * Now integrated with CognitiveEngine for adaptive, language-aware pacing.
 */

class SpeedReader {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            wpm: options.wpm || 300,
            pauseAtPunctuation: options.pauseAtPunctuation !== false,
            extraTimeForLongWords: options.extraTimeForLongWords !== false,
            adaptiveMode: options.adaptiveMode !== false,  // NEW: Enable cognitive adaptation
            longWordThreshold: options.longWordThreshold || 8,
            punctuationMultiplier: options.punctuationMultiplier || 1.5,
            longWordMultiplier: options.longWordMultiplier || 1.3,
            onWordChange: options.onWordChange || (() => {}),
            onProgress: options.onProgress || (() => {}),
            onComplete: options.onComplete || (() => {}),
            onStateChange: options.onStateChange || (() => {}),
            onAnalysis: options.onAnalysis || (() => {})  // NEW: Callback for analysis data
        };

        // State
        this.words = [];
        this.tokens = [];           // NEW: Enriched token stream
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.timeoutId = null;
        this.startTime = null;
        this.pausedTime = null;
        this.pauseStartTime = null;  // NEW: Track pause duration
        this.totalPausedDuration = 0;

        // Punctuation patterns for pause detection
        this.endPunctuation = /[.!?]$/;
        this.midPunctuation = /[,;:—–-]$/;
        this.paragraphBreak = /\n\n/;
        
        // NEW: Cognitive engine integration
        this.cognitive = typeof CognitiveEngine !== 'undefined' ? new CognitiveEngine() : null;
        
        // NEW: Collocation state
        this.skipCount = 0;  // Words to skip (already displayed in collocation)
    }

    /**
     * Calculate the Optimal Recognition Point (ORP) for a word
     * Now delegates to CognitiveEngine when available
     */
    calculateORP(word, analysis = null) {
        // Use cognitive engine if available and we have analysis
        if (this.cognitive && analysis) {
            return this.cognitive.calculateAdaptiveORP(word, analysis);
        }
        
        // Fallback to basic calculation
        const cleanWord = word.replace(/[^\w]/g, '');
        const length = cleanWord.length;
        
        if (length === 0) return { prefix: '', focus: word, suffix: '' };
        if (length === 1) return { prefix: '', focus: word, suffix: '' };
        if (length === 2) return { prefix: word[0], focus: word[1], suffix: '' };
        
        let orpIndex;
        if (length <= 4) {
            orpIndex = 1;
        } else if (length <= 8) {
            orpIndex = 2;
        } else if (length <= 12) {
            orpIndex = 3;
        } else {
            orpIndex = Math.floor(length / 4);
        }

        let actualIndex = 0;
        let cleanIndex = 0;
        while (cleanIndex < orpIndex && actualIndex < word.length) {
            if (/\w/.test(word[actualIndex])) {
                cleanIndex++;
            }
            actualIndex++;
        }

        return {
            prefix: word.substring(0, actualIndex),
            focus: word[actualIndex] || '',
            suffix: word.substring(actualIndex + 1)
        };
    }

    /**
     * Parse text into an array of words, preserving punctuation
     */
    parseText(text) {
        if (!text || typeof text !== 'string') return [];

        const words = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split(/\s+/)
            .filter(word => word.length > 0);

        return words;
    }

    /**
     * Calculate display duration for a word based on WPM and cognitive analysis
     */
    getWordDuration(word, analysis = null) {
        const baseInterval = 60000 / this.config.wpm;
        
        // If adaptive mode with cognitive engine, use analysis multiplier
        if (this.config.adaptiveMode && analysis && analysis.multiplier) {
            return Math.round(baseInterval * analysis.multiplier);
        }
        
        // Fallback to basic timing
        let multiplier = 1;

        if (this.config.pauseAtPunctuation) {
            if (this.endPunctuation.test(word)) {
                multiplier *= this.config.punctuationMultiplier * 1.2;
            } else if (this.midPunctuation.test(word)) {
                multiplier *= this.config.punctuationMultiplier;
            }
        }

        if (this.config.extraTimeForLongWords) {
            const cleanLength = word.replace(/[^\w]/g, '').length;
            if (cleanLength > this.config.longWordThreshold) {
                multiplier *= this.config.longWordMultiplier;
            }
        }

        return Math.round(baseInterval * multiplier);
    }

    /**
     * Load text and prepare for reading
     */
    load(text) {
        this.words = this.parseText(text);
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.totalPausedDuration = 0;
        this.skipCount = 0;
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        // NEW: Preprocess with cognitive engine
        if (this.cognitive) {
            this.tokens = this.cognitive.preprocessText(text);
            this.cognitive.reset();
            this.cognitive.updateFatigue({ type: 'start' });
        }

        this.config.onStateChange({ 
            state: 'loaded', 
            wordCount: this.words.length 
        });

        return this.words.length;
    }

    /**
     * Get current word with ORP calculation and cognitive analysis
     */
    getCurrentWord() {
        if (this.currentIndex >= this.words.length) {
            return null;
        }
        
        const word = this.words[this.currentIndex];
        const token = this.tokens[this.currentIndex] || { word, index: this.currentIndex };
        
        // Get cognitive analysis
        let analysis = null;
        if (this.cognitive && this.config.adaptiveMode) {
            analysis = this.cognitive.analyzeToken(token);
            this.config.onAnalysis(analysis);
        }
        
        const orp = this.calculateORP(word, analysis);
        
        // Check for collocation (multi-word unit)
        let displayText = word;
        let isCollocation = false;
        if (token.collocation && this.skipCount === 0) {
            displayText = token.collocation.display;
            isCollocation = true;
            this.skipCount = token.collocation.length - 1;
        }
        
        return {
            word,
            displayText,
            isCollocation,
            index: this.currentIndex,
            total: this.words.length,
            progress: this.words.length > 0 ? (this.currentIndex / this.words.length) * 100 : 0,
            ...orp,
            prevWord: this.currentIndex > 0 ? this.words[this.currentIndex - 1] : null,
            nextWord: this.currentIndex < this.words.length - 1 ? this.words[this.currentIndex + 1] : null,
            analysis
        };
    }

    /**
     * Display the next word
     */
    showNextWord() {
        // Handle collocation skip
        if (this.skipCount > 0) {
            this.skipCount--;
            this.currentIndex++;
            if (this.isPlaying && this.currentIndex < this.words.length) {
                // Minimal delay for skipped collocation words
                this.timeoutId = setTimeout(() => this.showNextWord(), 10);
            }
            return;
        }
        
        if (this.currentIndex >= this.words.length) {
            this.complete();
            return;
        }

        const currentWord = this.getCurrentWord();
        
        // Update fatigue tracking
        if (this.cognitive) {
            this.cognitive.updateFatigue({ type: 'word' });
        }
        
        this.config.onWordChange(currentWord);
        this.config.onProgress({
            current: this.currentIndex + 1,
            total: this.words.length,
            progress: ((this.currentIndex + 1) / this.words.length) * 100
        });

        this.currentIndex++;

        if (this.isPlaying && this.currentIndex < this.words.length) {
            const duration = this.getWordDuration(currentWord.word, currentWord.analysis);
            this.timeoutId = setTimeout(() => this.showNextWord(), duration);
        } else if (this.currentIndex >= this.words.length) {
            this.complete();
        }
    }

    /**
     * Start or resume reading
     */
    play() {
        if (this.words.length === 0) return false;
        
        if (this.currentIndex >= this.words.length) {
            this.currentIndex = 0;
        }

        this.isPlaying = true;
        this.isPaused = false;

        // Track pause duration for fatigue
        if (this.pauseStartTime && this.cognitive) {
            const pauseDuration = Date.now() - this.pauseStartTime;
            this.cognitive.updateFatigue({ type: 'resume', duration: pauseDuration });
            this.pauseStartTime = null;
        }

        if (this.pausedTime) {
            this.totalPausedDuration += Date.now() - this.pausedTime;
            this.pausedTime = null;
        } else if (!this.startTime) {
            this.startTime = Date.now();
        }

        this.config.onStateChange({ state: 'playing' });
        this.showNextWord();
        
        return true;
    }

    /**
     * Pause reading
     */
    pause() {
        if (!this.isPlaying) return false;

        this.isPlaying = false;
        this.isPaused = true;
        this.pausedTime = Date.now();
        this.pauseStartTime = Date.now();

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        // Track pause for fatigue/comprehension
        if (this.cognitive) {
            this.cognitive.updateFatigue({ type: 'pause' });
        }

        this.config.onStateChange({ state: 'paused' });
        return true;
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            return this.pause();
        } else {
            return this.play();
        }
    }

    /**
     * Restart from the beginning
     */
    restart() {
        this.pause();
        this.currentIndex = 0;
        this.startTime = null;
        this.pausedTime = null;
        this.totalPausedDuration = 0;
        this.skipCount = 0;
        
        // Reset cognitive state
        if (this.cognitive) {
            this.cognitive.reset();
            this.cognitive.updateFatigue({ type: 'start' });
        }

        const currentWord = this.getCurrentWord();
        if (currentWord) {
            this.config.onWordChange(currentWord);
            this.config.onProgress({
                current: 1,
                total: this.words.length,
                progress: 0
            });
        }

        this.config.onStateChange({ state: 'ready' });
    }

    /**
     * Go to a specific word by index
     */
    goToWord(index) {
        if (index < 0) index = 0;
        if (index >= this.words.length) index = this.words.length - 1;

        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.pause();

        this.currentIndex = index;
        this.skipCount = 0;
        
        const currentWord = this.getCurrentWord();
        if (currentWord) {
            this.config.onWordChange(currentWord);
            this.config.onProgress({
                current: this.currentIndex + 1,
                total: this.words.length,
                progress: ((this.currentIndex + 1) / this.words.length) * 100
            });
        }

        if (wasPlaying) this.play();
    }

    /**
     * Move to next word
     */
    next() {
        if (this.currentIndex < this.words.length - 1) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) this.pause();
            
            this.currentIndex++;
            this.skipCount = 0;
            const currentWord = this.getCurrentWord();
            if (currentWord) {
                this.config.onWordChange(currentWord);
                this.config.onProgress({
                    current: this.currentIndex + 1,
                    total: this.words.length,
                    progress: ((this.currentIndex + 1) / this.words.length) * 100
                });
            }

            if (wasPlaying) this.play();
        }
    }

    /**
     * Move to previous word
     */
    prev() {
        if (this.currentIndex > 0) {
            const wasPlaying = this.isPlaying;
            if (wasPlaying) this.pause();

            this.currentIndex--;
            this.skipCount = 0;
            
            // Track rewind for comprehension analysis
            if (this.cognitive) {
                this.cognitive.updateFatigue({ type: 'rewind' });
            }
            
            const currentWord = this.getCurrentWord();
            if (currentWord) {
                this.config.onWordChange(currentWord);
                this.config.onProgress({
                    current: this.currentIndex + 1,
                    total: this.words.length,
                    progress: ((this.currentIndex + 1) / this.words.length) * 100
                });
            }

            if (wasPlaying) this.play();
        }
    }

    /**
     * Jump forward/backward by number of words
     */
    jump(count) {
        const newIndex = Math.max(0, Math.min(this.words.length - 1, this.currentIndex + count));
        
        // Track rewinds
        if (count < 0 && this.cognitive) {
            this.cognitive.updateFatigue({ type: 'rewind' });
        }
        
        this.goToWord(newIndex);
    }

    /**
     * Update WPM setting
     */
    setWPM(wpm) {
        this.config.wpm = Math.max(50, Math.min(1500, wpm));
        return this.config.wpm;
    }

    /**
     * Get current WPM
     */
    getWPM() {
        return this.config.wpm;
    }
    
    /**
     * NEW: Set reading mode via cognitive engine
     */
    setMode(mode) {
        if (this.cognitive) {
            return this.cognitive.setMode(mode);
        }
        return null;
    }
    
    /**
     * NEW: Get available reading modes
     */
    getModes() {
        if (this.cognitive) {
            return this.cognitive.getModes();
        }
        return [];
    }
    
    /**
     * NEW: Get current mode
     */
    getMode() {
        if (this.cognitive) {
            return this.cognitive.getMode();
        }
        return null;
    }
    
    /**
     * NEW: Get fatigue status
     */
    getFatigueStatus() {
        if (this.cognitive) {
            return this.cognitive.getFatigueStatus();
        }
        return { level: 0, status: 'fresh', recommendation: null };
    }
    
    /**
     * NEW: Get comprehension assessment
     */
    getComprehension() {
        if (this.cognitive) {
            return this.cognitive.assessComprehension();
        }
        return { score: 1, issues: [], suggestSlowdown: false, suggestBreak: false };
    }
    
    /**
     * NEW: Toggle adaptive mode
     */
    setAdaptiveMode(enabled) {
        this.config.adaptiveMode = enabled;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }

    /**
     * Handle reading completion
     */
    complete() {
        this.isPlaying = false;
        this.isPaused = false;

        const duration = this.startTime 
            ? (Date.now() - this.startTime - this.totalPausedDuration) / 1000 
            : 0;

        const stats = {
            wordCount: this.words.length,
            duration: duration,
            actualWPM: duration > 0 ? Math.round((this.words.length / duration) * 60) : 0,
            fatigue: this.getFatigueStatus(),
            comprehension: this.getComprehension()
        };

        this.config.onStateChange({ state: 'completed', stats });
        this.config.onComplete(stats);
    }

    /**
     * Calculate estimated reading time
     */
    getEstimatedTime() {
        const remainingWords = this.words.length - this.currentIndex;
        const minutes = remainingWords / this.config.wpm;
        return {
            minutes: Math.floor(minutes),
            seconds: Math.round((minutes % 1) * 60),
            formatted: this.formatTime(minutes * 60)
        };
    }

    /**
     * Format seconds to MM:SS
     */
    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get reading statistics
     */
    getStats() {
        return {
            totalWords: this.words.length,
            currentWord: this.currentIndex + 1,
            remainingWords: Math.max(0, this.words.length - this.currentIndex),
            progress: this.words.length > 0 ? ((this.currentIndex) / this.words.length) * 100 : 0,
            wpm: this.config.wpm,
            estimatedTime: this.getEstimatedTime(),
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            mode: this.getMode(),
            fatigue: this.getFatigueStatus()
        };
    }

    /**
     * Destroy instance and clean up
     */
    destroy() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.words = [];
        this.tokens = [];
        this.isPlaying = false;
        this.isPaused = false;
        if (this.cognitive) {
            this.cognitive.reset();
        }
    }
}

// Export for use in app.js
window.SpeedReader = SpeedReader;
