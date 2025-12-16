# Text-Expander-AI + Hover Translator

A userscript that combines AI-powered text expansion with hover translation functionality.

[Turkce README](README.md)

## Features

### Text Expander
- Define custom triggers that automatically expand into predefined text
- AI-powered commands for text processing (grammar fix, summarization, tone adjustment, etc.)
- Undo/Redo support with Ctrl+Z / Ctrl+Y
- Quick undo with Backspace immediately after expansion

### Hover Translator
- Automatically translates selected text using Google Translate
- Supports multiple target languages (Turkish, English, German, French, Spanish)
- Caches translations for better performance
- Skips translation when source and target languages match

## Installation

1. Install a userscript manager (Tampermonkey, Violentmonkey, etc.)
2. Create a new script and paste the contents of `Userscript.js`
3. Configure your API settings in the settings panel

## Usage

### AI Commands
Type your text followed by a command:
```
your text here -fix
```

Available default commands:
- `-fix` - Fix grammar, spelling, and punctuation
- `-ai` - General AI assistant
- `-short` - Summarize to one line
- `-formal` - Rewrite in formal tone
- `-casual` - Rewrite in casual tone
- `-prompt-engineer` - Generate AI prompts
- `-prompt-enhancer` - Enhance existing prompts
- `-text-improver` - Improve text readability

### Triggers
Type a trigger keyword to auto-replace it with predefined text. Default triggers include common greetings, contact info placeholders, and social links.

### Translation
Select any text on a webpage to see its translation in a tooltip.

## Configuration

Access settings via the userscript menu (click on your userscript manager icon and select "Settings").

### Settings Tabs
- General: Enable/disable features, API configuration, target language
- Commands: Add/remove AI commands with custom prompts
- Triggers: Add/remove text triggers
- Help: Keyboard shortcuts and usage guide

### API Configuration
- URL: Your OpenAI-compatible API endpoint
- Key: Your API key
- Model: Model name to use

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Quick Undo | Backspace (immediately after expansion) |
| Cancel | ESC |

## Requirements

- Userscript manager (Tampermonkey, Violentmonkey, Greasemonkey)
- OpenAI-compatible API endpoint for AI commands

## License

MIT
