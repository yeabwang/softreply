# SoftReply  Browser Extension

The **SoftReply ** is a browser extension designed to help you improve your communication skills, with a focus on dating scenarios. This extension is available for **Chrome**, **Edge**, and **Brave** browsers.

## Features

- **OpenAI API Key Encryption**: Stores your OpenAI API key locally with a user-provided password for added security.
- **Dating Communication Tools**:
  - **Analysis**: Get insights and actionable recommendations for dating-related conversations.
  - **Craft Response**: Generate personalized, human-toned responses that match your communication style.
  - **Dating Wizard**: Receive helpful, general dating advice tailored to your specific situation.
  - **Interactive Follow-Ups**: Ask follow-up questions to continue the conversation and deepen the dialogue.
- **Chat-Inspired Interface**: Provides a full-screen, maximized window for a distraction-free experience.
- **Conversation History**: Keeps track of your conversations, allowing you to build context and follow-up questions seamlessly.
- **Scroll Through Long Conversations**: Navigate through longer exchanges effortlessly.
- **Context Setting**: An interactive modal allows you to set personalized context for more relevant responses.
- **Privacy Focused**: No data is stored other than your encrypted API key, and all messages are cleared when the extension is closed.

## Installation

### 1. Clone or Download the Repository

To get started, clone or download the repository using the following command:

git clone https://github.com/yeabwang/softreply.git

## Add the Extension to Your Browser

- **Chrome**: Go to [chrome://extensions/](chrome://extensions/)
- **Edge**: Go to [edge://extensions/](edge://extensions/)
- **Brave**: Go to [brave://extensions/](brave://extensions/)

### Enable Developer Mode
In the extensions page, enable **Developer mode** at the top-right corner.

### Load the Extension
Click **Load unpacked**, then select the `soft-reply` folder from the cloned repository.

### Open the Extension
Click the extension icon to open the interface in a full-screen window.

---

## Usage

### First-Time Setup
When you first open the extension:

1. Enter your **OpenAI API key**.
2. Create a **strong encryption password** to securely store your API key.
3. **Keep your encryption password safe** (e.g., in a password manager), as you will need it each time you open the extension.
4. If you forget your password, you can reset it by re-entering your API key and setting a new password.

### Key Features

- **Dating Tab**: Access various features to improve your communication.
  - **Analyze**: Get insights and recommendations on how to improve a conversation.
  - **Craft Response**: Generate personalized, human-sounding responses that reflect your voice.
  - **Dating Wizard**: Receive tailored dating advice based on your specific situation.
  - **Follow-Up Questions**: Continue the conversation with follow-up questions based on previous exchanges.
  
- **Set Context**: Click **Set Context** to open an interactive modal where you can provide personal context (e.g., “I’m shy but like this girl”), helping generate more relevant responses.
  - Save or cancel the context, or click outside the modal to close it.

- **Clear Conversation**: Click **Clear Conversation** to reset the conversation history. All inputs will be cleared when the window closes.

- **Scrollable Interface**: The interface is scrollable for long conversations, providing a seamless browsing experience.

---

## Notes

- Requires an **OpenAI API key** for functionality.
- New tabs like **Casual** and **Professional** will be added in future updates.
- Ensure that **crypto-js.min.js** is present in the **lib/** folder. You can download it [here](https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js).
- The extension opens in a single, **maximized** window for a stable and full-screen experience.

---

## Troubleshooting

If you're encountering issues, try the following:

1. **Follow-up Questions Not Working**: 
   - Check the console for errors by pressing `Ctrl+Shift+J`.
   - Ensure the `popup.js` file includes conversation history logic.

2. **Context Modal Not Closing**: 
   - Verify that `popup.js` has the overlay click handler.
   - Check that `popup.css` has the correct `z-index` and `pointer-events` properties.

3. **Modal Not Interactive**: 
   - Ensure `pointer-events: auto;` is set on modal content in `popup.css`.
   - Reload the extension.

4. **Window Not Full-Screen**: 
   - Ensure `open-window.js` is using the state `"maximized"`.
   - Reload the extension.

5. **Crashes**: 
   - Clear the browser storage (chrome.storage.local) via developer tools and re-enter your API key.

---

## Contributing

We welcome contributions to the **SoftReply **! Feel free to fork the repository and submit pull requests with improvements or bug fixes.

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Feedback

We would love to hear your thoughts on the **SoftReply **. If you have any suggestions or feature requests, please open an issue on the GitHub repository or contact us directly.
