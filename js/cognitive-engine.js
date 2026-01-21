/**
 * Cognitive RSVP Engine
 * 
 * An advanced language-aware adaptive reading system that optimizes
 * timing based on linguistic, semantic, and cognitive load signals.
 * 
 * Design Philosophy:
 * - Speed emerges from cognitive alignment, not forced acceleration
 * - Adapt timing per word, phrase, and sentence
 * - Treat reading as a real-time control system
 */

class CognitiveEngine {
    constructor() {
        // ═══════════════════════════════════════════════════════════════
        // LINGUISTIC PATTERNS
        // ═══════════════════════════════════════════════════════════════
        
        // Clause boundary markers (trigger pause)
        this.clauseBoundaries = /[,;:\-–—]/;
        
        // Sentence terminators (longer pause)
        this.sentenceEnd = /[.!?]+$/;
        
        // Paragraph indicators
        this.paragraphEnd = /[.!?]+["']?$/;
        
        // Subordinating conjunctions (signal clause complexity)
        this.subordinators = new Set([
            'although', 'because', 'since', 'while', 'whereas', 'unless',
            'until', 'before', 'after', 'when', 'whenever', 'where',
            'wherever', 'if', 'though', 'even', 'provided', 'assuming'
        ]);
        
        // Transition words (semantic shift markers)
        this.transitions = new Set([
            'however', 'therefore', 'furthermore', 'moreover', 'nevertheless',
            'consequently', 'meanwhile', 'subsequently', 'accordingly',
            'hence', 'thus', 'otherwise', 'instead', 'alternatively'
        ]);
        
        // High-frequency words (can be processed faster)
        this.highFrequency = new Set([
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
            'from', 'as', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'under', 'again', 'further',
            'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
            'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
            'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
            'very', 'just', 'also', 'now', 'and', 'but', 'or', 'yet', 'both',
            'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
            'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
            'your', 'his', 'our', 'their', 'what', 'which', 'who', 'whom'
        ]);
        
        // Common collocations and phrases (display together)
        this.collocations = [
            // Prepositional phrases
            ['in', 'order', 'to'], ['as', 'well', 'as'], ['in', 'front', 'of'],
            ['in', 'spite', 'of'], ['on', 'behalf', 'of'], ['in', 'terms', 'of'],
            ['by', 'means', 'of'], ['in', 'addition', 'to'], ['with', 'respect', 'to'],
            ['on', 'top', 'of'], ['in', 'case', 'of'], ['at', 'the', 'same', 'time'],
            // Discourse markers
            ['on', 'the', 'other', 'hand'], ['as', 'a', 'result'],
            ['for', 'example'], ['for', 'instance'], ['in', 'other', 'words'],
            ['that', 'is'], ['in', 'fact'], ['of', 'course'], ['at', 'least'],
            ['at', 'last'], ['at', 'first'], ['first', 'of', 'all'],
            // Common verb phrases
            ['going', 'to'], ['used', 'to'], ['have', 'to'], ['has', 'to'],
            ['want', 'to'], ['need', 'to'], ['able', 'to'], ['ought', 'to'],
            // Time expressions
            ['right', 'now'], ['so', 'far'], ['up', 'to'], ['from', 'now', 'on']
        ];
        
        // ═══════════════════════════════════════════════════════════════
        // TIMING MULTIPLIERS (base = 1.0)
        // ═══════════════════════════════════════════════════════════════
        
        this.timing = {
            // Punctuation delays
            sentenceEnd: 2.0,        // Full stop, !, ?
            clauseBoundary: 1.4,     // Comma, semicolon, colon
            paragraphEnd: 2.5,       // End of paragraph
            
            // Word complexity
            shortWord: 0.85,         // 1-3 chars
            mediumWord: 1.0,         // 4-7 chars
            longWord: 1.25,          // 8-11 chars
            veryLongWord: 1.5,       // 12+ chars
            
            // Semantic factors
            highFrequency: 0.8,      // Common words
            transition: 1.5,         // Discourse markers
            subordinator: 1.3,       // Clause complexity signal
            
            // Token types
            number: 1.4,             // Numeric tokens
            mixedCase: 1.3,          // CamelCase, technical terms
            allCaps: 1.2,            // Acronyms, emphasis
            hasSymbols: 1.3,         // Special characters
            
            // Concept tracking
            firstOccurrence: 1.35,   // New concept introduction
            recentRepeat: 0.75,      // Seen in last 20 words
            
            // Compound handling
            hyphenated: 1.4,         // Hyphenated compounds
            
            // Collocation (displayed together)
            collocationUnit: 1.1     // Slight extra time for multi-word
        };
        
        // ═══════════════════════════════════════════════════════════════
        // READING MODES
        // ═══════════════════════════════════════════════════════════════
        
        this.modes = {
            scan: {
                name: 'Scan',
                description: 'Quick overview, skip details',
                baseMultiplier: 0.7,
                punctuationSensitivity: 0.5,
                complexityWeight: 0.3
            },
            normal: {
                name: 'Normal',
                description: 'Balanced speed and comprehension',
                baseMultiplier: 1.0,
                punctuationSensitivity: 1.0,
                complexityWeight: 1.0
            },
            study: {
                name: 'Study',
                description: 'Deep comprehension, slower pace',
                baseMultiplier: 1.4,
                punctuationSensitivity: 1.3,
                complexityWeight: 1.5
            },
            proofread: {
                name: 'Proofread',
                description: 'Careful attention to every word',
                baseMultiplier: 1.8,
                punctuationSensitivity: 1.5,
                complexityWeight: 1.8
            }
        };
        
        this.currentMode = 'normal';
        
        // ═══════════════════════════════════════════════════════════════
        // STATE TRACKING
        // ═══════════════════════════════════════════════════════════════
        
        this.conceptMemory = new Map();  // Track seen concepts
        this.recentWords = [];           // Last N words for repetition detection
        this.recentWindowSize = 25;
        
        // Fatigue tracking
        this.fatigue = {
            startTime: null,
            wordsRead: 0,
            rewinds: 0,
            pauses: 0,
            lastPauseTime: null,
            fatigueLevel: 0,           // 0-1 scale
            autoSlowdownApplied: 0     // Cumulative slowdown %
        };
        
        // Comprehension signals
        this.comprehension = {
            rewindCount: 0,
            pauseCount: 0,
            hesitationEvents: [],
            avgPauseDuration: 0
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // MAIN ANALYSIS PIPELINE
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Analyze a token and return timing + display metadata
     * @param {Object} token - { word, index, context }
     * @returns {Object} - { displayText, duration multiplier, orp, metadata }
     */
    analyzeToken(token) {
        const word = token.word;
        const cleanWord = word.replace(/[^\w'-]/g, '').toLowerCase();
        
        const analysis = {
            original: word,
            display: word,
            multiplier: 1.0,
            factors: [],
            isChunkStart: false,
            chunkWords: null,
            orpOffset: 0
        };
        
        // ─────────────────────────────────────────────────────────────
        // 1. PUNCTUATION ANALYSIS
        // ─────────────────────────────────────────────────────────────
        
        if (this.sentenceEnd.test(word)) {
            if (token.isLastInParagraph) {
                analysis.multiplier *= this.timing.paragraphEnd;
                analysis.factors.push('paragraph-end');
            } else {
                analysis.multiplier *= this.timing.sentenceEnd;
                analysis.factors.push('sentence-end');
            }
        } else if (this.clauseBoundaries.test(word)) {
            analysis.multiplier *= this.timing.clauseBoundary;
            analysis.factors.push('clause-boundary');
        }
        
        // ─────────────────────────────────────────────────────────────
        // 2. WORD LENGTH COMPLEXITY
        // ─────────────────────────────────────────────────────────────
        
        const length = cleanWord.length;
        if (length <= 3) {
            analysis.multiplier *= this.timing.shortWord;
            analysis.factors.push('short');
        } else if (length <= 7) {
            // Medium - base timing
        } else if (length <= 11) {
            analysis.multiplier *= this.timing.longWord;
            analysis.factors.push('long');
            analysis.orpOffset = 1; // Shift ORP slightly right
        } else {
            analysis.multiplier *= this.timing.veryLongWord;
            analysis.factors.push('very-long');
            analysis.orpOffset = 2;
        }
        
        // ─────────────────────────────────────────────────────────────
        // 3. FREQUENCY-BASED ADJUSTMENT
        // ─────────────────────────────────────────────────────────────
        
        if (this.highFrequency.has(cleanWord)) {
            analysis.multiplier *= this.timing.highFrequency;
            analysis.factors.push('high-freq');
        }
        
        // ─────────────────────────────────────────────────────────────
        // 4. SEMANTIC ROLE
        // ─────────────────────────────────────────────────────────────
        
        if (this.transitions.has(cleanWord)) {
            analysis.multiplier *= this.timing.transition;
            analysis.factors.push('transition');
        }
        
        if (this.subordinators.has(cleanWord)) {
            analysis.multiplier *= this.timing.subordinator;
            analysis.factors.push('subordinator');
        }
        
        // ─────────────────────────────────────────────────────────────
        // 5. TOKEN TYPE ANALYSIS
        // ─────────────────────────────────────────────────────────────
        
        if (/\d/.test(word)) {
            analysis.multiplier *= this.timing.number;
            analysis.factors.push('numeric');
        }
        
        if (/[A-Z].*[a-z].*[A-Z]|[a-z].*[A-Z]/.test(word)) {
            analysis.multiplier *= this.timing.mixedCase;
            analysis.factors.push('mixed-case');
        }
        
        if (/^[A-Z]{2,}$/.test(cleanWord)) {
            analysis.multiplier *= this.timing.allCaps;
            analysis.factors.push('acronym');
        }
        
        if (/[@#$%&*+=<>]/.test(word)) {
            analysis.multiplier *= this.timing.hasSymbols;
            analysis.factors.push('symbols');
        }
        
        if (word.includes('-') && word.length > 3) {
            analysis.multiplier *= this.timing.hyphenated;
            analysis.factors.push('hyphenated');
        }
        
        // ─────────────────────────────────────────────────────────────
        // 6. CONCEPT TRACKING
        // ─────────────────────────────────────────────────────────────
        
        if (cleanWord.length > 4) {  // Only track meaningful words
            const isRecent = this.recentWords.includes(cleanWord);
            const seenBefore = this.conceptMemory.has(cleanWord);
            
            if (!seenBefore && !this.highFrequency.has(cleanWord)) {
                // First occurrence of a content word
                analysis.multiplier *= this.timing.firstOccurrence;
                analysis.factors.push('first-occurrence');
                this.conceptMemory.set(cleanWord, 1);
            } else if (isRecent) {
                // Recently seen - can process faster
                analysis.multiplier *= this.timing.recentRepeat;
                analysis.factors.push('recent-repeat');
                this.conceptMemory.set(cleanWord, (this.conceptMemory.get(cleanWord) || 0) + 1);
            }
            
            // Update recent words window
            this.recentWords.push(cleanWord);
            if (this.recentWords.length > this.recentWindowSize) {
                this.recentWords.shift();
            }
        }
        
        // ─────────────────────────────────────────────────────────────
        // 7. APPLY READING MODE
        // ─────────────────────────────────────────────────────────────
        
        const mode = this.modes[this.currentMode];
        analysis.multiplier *= mode.baseMultiplier;
        
        // Mode affects how much we respond to complexity
        const complexityFactors = analysis.factors.filter(f => 
            ['long', 'very-long', 'first-occurrence', 'numeric', 'mixed-case'].includes(f)
        ).length;
        
        if (complexityFactors > 0) {
            const complexityBoost = (mode.complexityWeight - 1) * 0.1 * complexityFactors;
            analysis.multiplier *= (1 + complexityBoost);
        }
        
        // ─────────────────────────────────────────────────────────────
        // 8. FATIGUE ADJUSTMENT
        // ─────────────────────────────────────────────────────────────
        
        if (this.fatigue.fatigueLevel > 0) {
            // Gradually slow down based on fatigue
            const fatigueMultiplier = 1 + (this.fatigue.fatigueLevel * 0.3);
            analysis.multiplier *= fatigueMultiplier;
            if (this.fatigue.fatigueLevel > 0.3) {
                analysis.factors.push('fatigue-adjusted');
            }
        }
        
        // ─────────────────────────────────────────────────────────────
        // 9. CLAMP MULTIPLIER TO REASONABLE RANGE
        // ─────────────────────────────────────────────────────────────
        
        analysis.multiplier = Math.max(0.5, Math.min(3.5, analysis.multiplier));
        
        return analysis;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // COLLOCATION DETECTION
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Detect if current position starts a collocation
     * @param {Array} words - Full word array
     * @param {number} index - Current position
     * @returns {Array|null} - Matched collocation or null
     */
    detectCollocation(words, index) {
        const remaining = words.length - index;
        
        for (const collocation of this.collocations) {
            if (collocation.length > remaining) continue;
            
            let matches = true;
            for (let i = 0; i < collocation.length; i++) {
                const word = words[index + i].toLowerCase().replace(/[^\w]/g, '');
                if (word !== collocation[i]) {
                    matches = false;
                    break;
                }
            }
            
            if (matches) {
                return {
                    words: words.slice(index, index + collocation.length),
                    length: collocation.length,
                    display: words.slice(index, index + collocation.length).join(' ')
                };
            }
        }
        
        return null;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // FATIGUE MONITORING
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Update fatigue metrics based on reading behavior
     */
    updateFatigue(event) {
        const now = Date.now();
        
        switch (event.type) {
            case 'start':
                this.fatigue.startTime = now;
                this.fatigue.wordsRead = 0;
                this.fatigue.fatigueLevel = 0;
                break;
                
            case 'word':
                this.fatigue.wordsRead++;
                // Time-based fatigue (increases after 5 minutes)
                if (this.fatigue.startTime) {
                    const minutes = (now - this.fatigue.startTime) / 60000;
                    if (minutes > 5) {
                        this.fatigue.fatigueLevel = Math.min(1, (minutes - 5) / 20);
                    }
                }
                break;
                
            case 'rewind':
                this.fatigue.rewinds++;
                this.comprehension.rewindCount++;
                // Rewinds signal comprehension difficulty
                this.fatigue.fatigueLevel = Math.min(1, 
                    this.fatigue.fatigueLevel + 0.05
                );
                break;
                
            case 'pause':
                this.fatigue.pauses++;
                this.comprehension.pauseCount++;
                const pauseDuration = event.duration || 0;
                
                // Long pauses may indicate fatigue
                if (pauseDuration > 3000) {
                    this.fatigue.fatigueLevel = Math.min(1,
                        this.fatigue.fatigueLevel + 0.03
                    );
                }
                break;
                
            case 'resume':
                // Slight fatigue recovery after pause
                this.fatigue.fatigueLevel = Math.max(0,
                    this.fatigue.fatigueLevel - 0.02
                );
                break;
        }
    }
    
    /**
     * Get current fatigue level and recommendation
     */
    getFatigueStatus() {
        const level = this.fatigue.fatigueLevel;
        
        if (level < 0.2) {
            return { level, status: 'fresh', recommendation: null };
        } else if (level < 0.5) {
            return { 
                level, 
                status: 'mild', 
                recommendation: 'Consider taking a short break soon' 
            };
        } else if (level < 0.8) {
            return { 
                level, 
                status: 'moderate', 
                recommendation: 'Speed has been reduced. Break recommended.' 
            };
        } else {
            return { 
                level, 
                status: 'high', 
                recommendation: 'Strong fatigue detected. Please rest.' 
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // MODE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════
    
    setMode(mode) {
        if (this.modes[mode]) {
            this.currentMode = mode;
            return this.modes[mode];
        }
        return null;
    }
    
    getMode() {
        return {
            current: this.currentMode,
            config: this.modes[this.currentMode]
        };
    }
    
    getModes() {
        return Object.entries(this.modes).map(([key, config]) => ({
            key,
            ...config
        }));
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // DYNAMIC ORP CALCULATION
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Calculate optimal recognition point with cognitive adjustments
     * @param {string} word - The word to analyze
     * @param {Object} analysis - Token analysis result
     * @returns {Object} - { prefix, focus, suffix }
     */
    calculateAdaptiveORP(word, analysis = {}) {
        const cleanWord = word.replace(/[^\w]/g, '');
        const length = cleanWord.length;
        
        if (length === 0) return { prefix: '', focus: word, suffix: '' };
        if (length === 1) return { prefix: '', focus: word, suffix: '' };
        if (length === 2) return { prefix: word[0], focus: word[1], suffix: '' };
        
        // Base ORP position (roughly 1/3 into word)
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
        
        // Apply cognitive offset if provided
        orpIndex += (analysis.orpOffset || 0);
        orpIndex = Math.max(0, Math.min(length - 1, orpIndex));
        
        // Map back to original word (accounting for punctuation)
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
    
    // ═══════════════════════════════════════════════════════════════════
    // TEXT PREPROCESSING
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Preprocess text into enriched token stream
     * @param {string} text - Raw input text
     * @returns {Array} - Enriched token array
     */
    preprocessText(text) {
        const paragraphs = text.split(/\n\s*\n/);
        const tokens = [];
        let globalIndex = 0;
        
        paragraphs.forEach((para, paraIndex) => {
            const words = para.split(/\s+/).filter(w => w.length > 0);
            
            words.forEach((word, wordIndex) => {
                const isLastInParagraph = wordIndex === words.length - 1;
                const isLastWord = paraIndex === paragraphs.length - 1 && isLastInParagraph;
                
                // Check for collocation
                const collocation = this.detectCollocation(words, wordIndex);
                
                tokens.push({
                    word,
                    index: globalIndex,
                    paragraphIndex: paraIndex,
                    sentencePosition: wordIndex,
                    isLastInParagraph,
                    isLastWord,
                    collocation: collocation
                });
                
                globalIndex++;
            });
        });
        
        return tokens;
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // COMPREHENSION FEEDBACK
    // ═══════════════════════════════════════════════════════════════════
    
    /**
     * Detect comprehension issues from behavior patterns
     * @returns {Object} - Comprehension status and recommendations
     */
    assessComprehension() {
        const rewindRate = this.comprehension.rewindCount / Math.max(1, this.fatigue.wordsRead);
        const pauseRate = this.comprehension.pauseCount / Math.max(1, this.fatigue.wordsRead);
        
        let score = 1.0;  // 1.0 = good comprehension
        let issues = [];
        
        if (rewindRate > 0.05) {  // More than 5% rewinds
            score -= 0.2;
            issues.push('frequent-rewinds');
        }
        
        if (pauseRate > 0.03) {  // Frequent pauses
            score -= 0.1;
            issues.push('frequent-pauses');
        }
        
        if (this.fatigue.fatigueLevel > 0.5) {
            score -= 0.2;
            issues.push('fatigue');
        }
        
        return {
            score: Math.max(0, score),
            issues,
            suggestSlowdown: score < 0.7,
            suggestBreak: score < 0.5 || this.fatigue.fatigueLevel > 0.7
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // RESET
    // ═══════════════════════════════════════════════════════════════════
    
    reset() {
        this.conceptMemory.clear();
        this.recentWords = [];
        this.fatigue = {
            startTime: null,
            wordsRead: 0,
            rewinds: 0,
            pauses: 0,
            lastPauseTime: null,
            fatigueLevel: 0,
            autoSlowdownApplied: 0
        };
        this.comprehension = {
            rewindCount: 0,
            pauseCount: 0,
            hesitationEvents: [],
            avgPauseDuration: 0
        };
    }
}

// Export
window.CognitiveEngine = CognitiveEngine;
