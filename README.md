# Text Expander

An AI-powered text expansion tool with smart triggers and processing capabilities.

## Features

- Smart text expansion with customizable triggers
- AI integration with multiple provider support (OpenAI, Anthropic, Cohere)
- Real-time processing with visual feedback
- Undo detection to prevent unwanted expansions
- Customizable delay settings for AI commands
- Works across all websites and text inputs

## Installation

1. Install Tampermonkey extension in your browser
2. Create a new userscript
3. Copy the contents of Text-Expander.js into the editor
4. Save and enable the script

## Usage

### Text Expansion Triggers

Type any of the predefined triggers and press space or enter to expand:
- hi → Hello!
- ok → okey
- brb → Be right back
- omw → On my way
- thx → Thanks!
- And many more...

### Dynamic Content Triggers

- :tarih → Current date in Turkish format
- :date → Current date in US format
- :saat → Current time in Turkish format
- :time → Current time in US format
- :gun → Current day of the week in Turkish

### AI Commands

Add any of these commands after your text and press space or enter:
- -fix : Fix grammar and spelling errors
- -imp : Improve text clarity and impact
- -gen : Expand text into detailed response
- -en : Translate to English
- -tr : Translate to Turkish
- -sum : Summarize text
- -frm : Make text more formal
- -cas : Make text more casual
- -ai : Free-form AI prompt

Example: "hello world -en" will translate the text to English.

Press ESC to cancel AI processing.

## Configuration

Edit the AI_CONFIG section to set up your preferred AI provider and API keys:
- AI_PROVIDER: Choose between "openai", "anthropic", "cohere", or "custom"
- API keys for each provider
- Model selection
- Temperature and token settings

## Requirements

- Tampermonkey or compatible userscript manager
- Internet connection for AI features
- API keys for desired AI providers

## License

MIT
