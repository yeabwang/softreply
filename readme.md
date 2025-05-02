Communication Enhancer Browser Extension
A browser extension to polish communication, starting with dating scenarios. Built for Chrome, Edge, and Brave.
Features

Encrypts and stores OpenAI API key locally with a user-provided password.
Dating tab with analysis, response crafting, dating wizard, and interactive follow-up questions, featuring human, engaging responses.
Chat-inspired interface in a full-screen, maximized window that persists while browsing.
Scrollable content for long conversations and responses.
Interactive context-setting modal for personalized responses.
Conversation history with follow-up questions for a seamless dialogue.
No data stored except encrypted API key; messages clear on close.

Installation

Clone or download this repository:git clone https://github.com/yeabwang/communication-enhancer.git


Open your browser’s extension page:
Chrome: chrome://extensions/
Edge: edge://extensions/
Brave: brave://extensions/


Enable “Developer mode”.
Click “Load unpacked” and select the communication-enhancer folder.
Click the extension icon to open the interface in a full-screen window.

Usage

Enter your OpenAI API key and create a strong encryption password on first load.
Keep your encryption password safe (e.g., in a password manager). You’ll need it each time you open the extension.
If you forget the password, re-enter your API key and set a new password.
Use the Dating tab to:
Analyze: Get insights and recommendations for conversations or situations.
Craft Response: Generate personalized, human-toned response options that match your voice.
Dating Wizard: Receive general dating advice tailored to your context.
Follow-Up Questions: Ask follow-up questions after any response to continue the conversation, building on previous exchanges.


Click “Set Context” to open an interactive modal for setting conversation context (e.g., “I’m shy but like this girl”). Save, cancel, or click outside to close.
Click “Clear Conversation” to reset the conversation history and start fresh.
All inputs clear when the window closes.
The interface is scrollable and opens full-screen for a better experience.

Notes

Requires an OpenAI API key.
Casual and Professional tabs are coming soon.
Ensure crypto-js.min.js is in the lib/ folder (download from https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js).
The extension opens in a single, maximized window for a stable, full-screen experience.

Troubleshooting

Follow-up questions not working: Check console for errors (Ctrl+Shift+J). Ensure popup.js includes conversation history logic.
Context modal not closing: Verify popup.js has the overlay click handler and popup.css has correct z-index and pointer-events.
Modal not interactive: Confirm pointer-events: auto on modal content in popup.css. Reload the extension.
Window not full-screen: Ensure open-window.js uses state: "maximized". Reload the extension.
Crashes: Clear browser storage (chrome.storage.local) via developer tools and re-enter your API key.

