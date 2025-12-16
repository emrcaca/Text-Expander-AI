# Text-Expander-AI + Hover Translator

A userscript that combines AI-powered text expansion with hover translation functionality.

[Türkçe README](README.md)

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

| Command | Description |
|---------|-------------|
| `-ai` | General AI assistant |
| `-tr` | Translate to Turkish |
| `-en` | Translate to English |
| `-fix` | Fix grammar, spelling, and punctuation |
| `-imp` | Improve style and readability while preserving meaning |
| `-enh` | Enhance content with details and examples |
| `-sum` | Summarize in a single sentence |
| `-frm` | Rewrite in formal, professional tone |
| `-cas` | Rewrite in friendly, casual tone |
| `--eng` | Generate AI prompts |
| `--enh` | Enhance existing prompts |
| `--imp` | Improve prompt structure and tone |

### Triggers
Type a trigger keyword to auto-replace it with predefined text.

Default triggers:

| Trigger | Value |
|---------|-------|
| `hi`, `hello`, `hey` | Greeting messages |
| `selam`, `bye`, `gorusuruz` | Turkish greetings/farewells |
| `thanks`, `thankyou` | Thank you messages |
| `:tel` | Phone number |
| `:email` | Email address |
| `:address` | Address info |
| `:yardım`, `:help` | Help message |
| `office_hours`, `calisma_saatleri` | Working hours |
| `support`, `faq` | Support info |
| `website`, `instagram`, `twitter`, `linkedin` | Social media links |
| `whatsapp`, `iletisim` | Contact info |
| `pricing`, `randevu` | Pricing and appointment info |
| `acil`, `konum` | Emergency and location |
| `newsletter`, `privacy`, `terms` | Newsletter and legal links |

### Translation
Select any text on a webpage to see its translation in a tooltip.

## Configuration

Access settings via the userscript menu (click on your userscript manager icon and select "Settings").

### Settings Tabs
- **General**: Enable/disable features, API configuration, target language
- **Commands**: Add/remove AI commands with custom prompts
- **Triggers**: Add/remove text triggers
- **Help**: Keyboard shortcuts and usage guide

### API Configuration
- **URL**: Your OpenAI-compatible API endpoint
- **Key**: Your API key
- **Model**: Model name to use
- **Timeout**: Request timeout (default: 60000ms)

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
