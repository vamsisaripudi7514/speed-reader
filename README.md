# Speed Reader - Cognitive RSVP Engine

An advanced, language-aware speed reading application using RSVP (Rapid Serial Visual Presentation) with **cognitive adaptive pacing**. Speed emerges naturally from cognitive alignment, not forced acceleration.

![Speed Reader Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

## 🧠 Cognitive Engine Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    COGNITIVE RSVP ENGINE                          │
├──────────────────────────────────────────────────────────────────┤
│  [Text] → [Tokenizer] → [Linguistic Analyzer] → [Token Stream]   │
│                               │                                   │
│          ┌────────────────────┼────────────────────┐             │
│          ▼                    ▼                    ▼             │
│   [Syntax Parser]    [Semantic Analyzer]   [Complexity Scorer]   │
│          │                    │                    │             │
│          └────────────────────┼────────────────────┘             │
│                               ▼                                   │
│                  [Cognitive Timing Engine]                        │
│                               │                                   │
│    ┌──────────────────────────┼──────────────────────────┐       │
│    ▼                          ▼                          ▼       │
│ [Fatigue]              [Timing Calc]              [Mode Ctrl]    │
│    │                          │                          │       │
│    └──────────────────────────┼──────────────────────────┘       │
│                               ▼                                   │
│              [RSVP Renderer + Dynamic ORP]                        │
│                               ▼                                   │
│              [Comprehension Feedback Loop]                        │
└──────────────────────────────────────────────────────────────────┘
```

## 🚀 Features

### Cognitive Adaptive Timing
Unlike static WPM readers, timing adapts per-word based on:

| Signal | Effect | Multiplier |
|--------|--------|------------|
| **Sentence end** (. ! ?) | Longer pause for comprehension | 2.0× |
| **Clause boundary** (, ; :) | Brief pause | 1.4× |
| **Long words** (12+ chars) | Extra recognition time | 1.5× |
| **First occurrence** | New concept introduction | 1.35× |
| **Recent repeat** | Faster - already primed | 0.75× |
| **High-frequency** (the, is, a) | Speed up | 0.8× |
| **Transition words** (however, therefore) | Semantic shift pause | 1.5× |
| **Numbers/symbols** | Extra parsing time | 1.3-1.4× |

### Reading Modes

| Mode | Purpose | Base Multiplier |
|------|---------|-----------------|
| **Scan** | Quick overview, skip details | 0.7× |
| **Normal** | Balanced speed and comprehension | 1.0× |
| **Study** | Deep comprehension | 1.4× |
| **Proofread** | Careful attention to every word | 1.8× |

### Fatigue Monitoring
- Tracks reading duration and behavior
- Detects rewinds and pauses as comprehension signals
- Automatically reduces speed when fatigue detected
- Provides break recommendations

### Phrase Chunking
Displays multi-word semantic units together:
- "in order to"
- "on the other hand"
- "for example"
- Common collocations and idioms

### Core Reading Features
- **RSVP Display**: Words at fixed focal point
- **Dynamic ORP**: Optimal Recognition Point adjusted per word length
- **Static Focus Position**: Red letter anchored at center

### Playback Controls
- ▶️ Play/Pause (Space)
- ⏮️ Previous word (←)
- ⏭️ Next word (→)
- 🔄 Restart (R)
- ⏹️ Back to input (Esc)

### Speed Control
- **Range**: 100-1000 WPM
- **Presets**: Slow (150), Normal (250), Fast (300), Rapid (450), Expert (600)
- **Fine-tuning**: ±25 WPM with arrow keys

### Customization
- 🌙 **Dark/Light Theme**: Eye-friendly themes for any environment
- 🔤 **Font Size**: Adjustable from 32px to 96px
- 🎨 **Focus Color**: Choose from 6 accent colors
- 📝 **Font Family**: Multiple font options for readability
- ⚙️ **Reading Settings**: 
  - Pause at punctuation
  - Extra time for long words
  - Show word context (previous/next word preview)
  - Focus mode (minimal UI during reading)

### Accessibility
- **Keyboard Shortcuts**: Full keyboard navigation
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Storage**: Settings persist across sessions
- **No Backend Required**: Runs entirely in the browser

## ⌨️ Keyboard Shortcuts

### Playback
| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Previous word |
| `→` | Next word |
| `R` | Restart from beginning |
| `Esc` | Return to input |

### Speed
| Key | Action |
|-----|--------|
| `↑` | Increase speed (+25 WPM) |
| `↓` | Decrease speed (-25 WPM) |
| `1`-`5` | Speed presets |

### Navigation
| Key | Action |
|-----|--------|
| `[` | Jump back 10 words |
| `]` | Jump forward 10 words |
| `Home` | Go to start |
| `End` | Go to end |

### Other
| Key | Action |
|-----|--------|
| `T` | Toggle theme |
| `S` | Open settings |
| `?` | Show help |

## 📁 Project Structure

```
speed-reader/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles with CSS custom properties
├── js/
│   ├── cognitive-engine.js # Linguistic analysis & adaptive timing
│   ├── reader.js           # RSVP engine core
│   └── app.js              # Application controller
└── README.md               # This file
```

## 🔬 Cognitive Engine Details

### Timing Calculation Pipeline

```javascript
baseInterval = 60000 / WPM

multiplier = 1.0
  × punctuationFactor      // Clause/sentence boundaries
  × lengthFactor           // Word character count
  × frequencyFactor        // Common vs rare words
  × semanticFactor         // Transitions, subordinators
  × tokenTypeFactor        // Numbers, symbols, acronyms
  × conceptFactor          // First occurrence vs repeat
  × modeFactor             // Scan/Normal/Study/Proofread
  × fatigueFactor          // Time-based slowdown

finalDuration = baseInterval × clamp(multiplier, 0.5, 3.5)
```

### Linguistic Patterns Detected

**Clause Boundaries**: `, ; : — – -`
**Sentence Terminators**: `. ! ?`
**Subordinating Conjunctions**: although, because, while, unless, until...
**Transition Words**: however, therefore, furthermore, consequently...
**High-Frequency Words**: 100+ common words (the, a, is, are, to, of...)
**Collocations**: 50+ multi-word phrases displayed together

### Fatigue Model

```
fatigueLevel = f(readingDuration, rewindCount, pauseCount)

After 5 minutes:
  fatigueLevel += (minutes - 5) / 20

On rewind:
  fatigueLevel += 0.05  // Signals comprehension difficulty

Auto-slowdown:
  multiplier *= (1 + fatigueLevel × 0.3)
```


## 🎯 How It Works

### RSVP (Rapid Serial Visual Presentation)
Traditional reading requires your eyes to move across each line, which takes time and can cause fatigue. RSVP eliminates this by presenting words at a single, fixed focal point.

### ORP (Optimal Recognition Point)
Research shows that the eye naturally focuses on a point about 1/3 into each word for fastest recognition. The highlighted letter (in red by default) marks this optimal point, helping your brain process words more quickly.

### Recommended Starting Speeds
- **Beginner**: 150-200 WPM
- **Comfortable Reader**: 250-300 WPM
- **Advanced**: 350-450 WPM
- **Expert**: 500+ WPM

Start slower than you think necessary and gradually increase. Most people can comfortably read 25-50% faster than their normal reading speed with practice.

## 🛠️ Technical Details

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Flexbox, Grid
- **ES6+ JavaScript**: Classes, modules, modern syntax
- **Web APIs**: LocalStorage, Custom Fonts

### Performance
- Zero external dependencies
- ~15KB total (uncompressed)
- No build step required
- Instant loading

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💡 Tips for Effective Speed Reading

1. **Start Slow**: Begin at 150-200 WPM and gradually increase
2. **Stay Focused**: Minimize distractions and use focus mode
3. **Take Breaks**: Speed reading is mentally intensive
4. **Practice Regularly**: Consistency improves comprehension at higher speeds
5. **Adjust for Content**: Technical material may require slower speeds
6. **Trust Your Brain**: Your subconscious processes more than you realize

---

Made with ❤️ for faster reading
