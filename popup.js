let datingGuide = "";
let context = "";
let userEncryptionKey = null;
let conversationHistory = [];

// Load dating guide
fetch(chrome.runtime.getURL("dating-guide.txt"))
  .then(response => response.text())
  .then(data => datingGuide = data)
  .catch(err => console.error("Failed to load dating guide:", err));

// Initialize window.html
document.addEventListener("DOMContentLoaded", () => {
  const apiKeyScreen = document.getElementById("api-key-screen");
  const encryptionKeyPrompt = document.getElementById("encryption-key-prompt");
  const mainScreen = document.getElementById("main-screen");
  const apiKeyInput = document.getElementById("api-key-input");
  const encryptionKeyInput = document.getElementById("encryption-key-input");
  const saveApiKeyBtn = document.getElementById("save-api-key");
  const apiKeyError = document.getElementById("api-key-error");
  const decryptKeyInput = document.getElementById("decrypt-key-input");
  const submitDecryptKeyBtn = document.getElementById("submit-decrypt-key");
  const cancelDecryptKeyBtn = document.getElementById("cancel-decrypt-key");
  const decryptError = document.getElementById("decrypt-error");
  const setContextBtn = document.getElementById("set-context");
  const contextModal = document.getElementById("context-modal");
  const contextInput = document.getElementById("context-input");
  const saveContextBtn = document.getElementById("save-context");
  const cancelContextBtn = document.getElementById("cancel-context");
  const contextDisplay = document.getElementById("context-display");
  const userInput = document.getElementById("user-input");
  const responseArea = document.getElementById("response-area");
  const submitAnalyzeBtn = document.getElementById("submit-analyze");
  const submitCraftBtn = document.getElementById("submit-craft");
  const submitWizardBtn = document.getElementById("submit-wizard");
  const followUpInput = document.getElementById("follow-up-input");
  const submitFollowUpBtn = document.getElementById("submit-follow-up");
  const clearConversationBtn = document.getElementById("clear-conversation");

  // Debug: Ensure elements are found
  if (!contextModal || !saveContextBtn || !cancelContextBtn) {
    console.error("Modal elements not found:", { contextModal, saveContextBtn, cancelContextBtn });
  }
  if (!followUpInput || !submitFollowUpBtn || !clearConversationBtn) {
    console.error("Follow-up elements not found:", { followUpInput, submitFollowUpBtn, clearConversationBtn });
  }

  // Check for stored API key
  chrome.storage.local.get(["encryptedApiKey", "keyHash"], ({ encryptedApiKey, keyHash }) => {
    if (encryptedApiKey && keyHash) {
      showEncryptionKeyPrompt();
    } else {
      showApiKeyScreen();
    }
  });

  // Save API key and encryption key
  saveApiKeyBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    const encryptionKey = encryptionKeyInput.value.trim();
    if (!encryptionKey) {
      apiKeyError.textContent = "Please provide an encryption password.";
      apiKeyError.classList.remove("hidden");
      return;
    }
    validateApiKey(apiKey).then(valid => {
      if (valid) {
        userEncryptionKey = encryptionKey;
        const encrypted = CryptoJS.AES.encrypt(apiKey, encryptionKey).toString();
        const keyHash = CryptoJS.SHA256(encryptionKey).toString();
        chrome.storage.local.set({ encryptedApiKey: encrypted, keyHash: keyHash }, () => {
          showMainScreen();
        });
      } else {
        apiKeyError.textContent = "Invalid API key. Please try again.";
        apiKeyError.classList.remove("hidden");
      }
    });
  });

  // Handle decryption key submission
  submitDecryptKeyBtn.addEventListener("click", () => {
    const enteredKey = decryptKeyInput.value.trim();
    chrome.storage.local.get(["keyHash", "encryptedApiKey"], ({ keyHash, encryptedApiKey }) => {
      const enteredHash = CryptoJS.SHA256(enteredKey).toString();
      if (enteredHash === keyHash) {
        userEncryptionKey = enteredKey;
        const decryptedApiKey = decryptApiKey(encryptedApiKey);
        validateApiKey(decryptedApiKey).then(valid => {
          if (valid) {
            encryptionKeyPrompt.classList.add("hidden");
            showMainScreen();
          } else {
            chrome.storage.local.remove(["encryptedApiKey", "keyHash"]);
            decryptError.textContent = "API key is invalid. Please re-enter.";
            decryptError.classList.remove("hidden");
            setTimeout(() => showApiKeyScreen(), 2000);
          }
        });
      } else {
        decryptError.classList.remove("hidden");
      }
    });
  });

  cancelDecryptKeyBtn.addEventListener("click", () => {
    chrome.storage.local.remove(["encryptedApiKey", "keyHash"]);
    encryptionKeyPrompt.classList.add("hidden");
    showApiKeyScreen();
  });

  // Context modal
  setContextBtn.addEventListener("click", () => {
    contextModal.classList.remove("hidden");
  });

  saveContextBtn.addEventListener("click", () => {
    context = contextInput.value.trim();
    contextDisplay.textContent = context || "No context set.";
    contextDisplay.classList.toggle("hidden", !context);
    contextModal.classList.add("hidden");
    contextInput.value = "";
  });

  cancelContextBtn.addEventListener("click", () => {
    contextModal.classList.add("hidden");
    contextInput.value = "";
  });

  // Close modal when clicking outside content
  contextModal.addEventListener("click", (e) => {
    if (e.target === contextModal) {
      contextModal.classList.add("hidden");
      contextInput.value = "";
    }
  });

  // Handle submissions
  submitAnalyzeBtn.addEventListener("click", () => handleSubmit("analyze", userInput));
  submitCraftBtn.addEventListener("click", () => handleSubmit("craft", userInput));
  submitWizardBtn.addEventListener("click", () => handleSubmit("wizard", userInput));
  submitFollowUpBtn.addEventListener("click", () => handleSubmit("follow-up", followUpInput));
  clearConversationBtn.addEventListener("click", () => {
    conversationHistory = [];
    responseArea.innerHTML = "";
    userInput.value = "";
    followUpInput.value = "";
  });

  // Clear messages on close
  window.addEventListener("unload", () => {
    userInput.value = "";
    followUpInput.value = "";
    responseArea.textContent = "";
    context = "";
    conversationHistory = [];
    contextDisplay.textContent = "";
    contextDisplay.classList.add("hidden");
  });

  function showApiKeyScreen() {
    apiKeyScreen.classList.remove("hidden");
    encryptionKeyPrompt.classList.add("hidden");
    mainScreen.classList.add("hidden");
  }

  function showEncryptionKeyPrompt() {
    encryptionKeyPrompt.classList.remove("hidden");
    apiKeyScreen.classList.add("hidden");
    mainScreen.classList.add("hidden");
  }

  function showMainScreen() {
    apiKeyScreen.classList.add("hidden");
    encryptionKeyPrompt.classList.add("hidden");
    mainScreen.classList.remove("hidden");
  }

  async function validateApiKey(apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  function decryptApiKey(encrypted) {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, userEncryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "";
    }
  }

  function renderMarkdown(text) {
    // Basic markdown rendering for headings, lists, and emojis
    text = text.replace(/^# (.*)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>');
    text = text.replace(/^## (.*)$/gm, '<h2 class="text-lg font-semibold mt-3 mb-1">$1</h2>');
    text = text.replace(/^- (.*)$/gm, '<li class="ml-4">$1</li>');
    text = text.replace(/^\d+\. (.*)$/gm, '<li class="ml-4">$1</li>');
    text = text.replace(/🌱|📘|✅|❌/g, match => `<span class="text-2xl">${match}</span>`);
    text = text.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*)\*/g, '<em>$1</em>');
    return `<div class="prose">${text}</div>`;
  }

  function renderConversationHistory() {
    let html = "";
    conversationHistory.forEach(({ role, content }) => {
      const className = role === "user" ? "conversation-user" : "conversation-assistant";
      const prefix = role === "user" ? "You: " : "Assistant: ";
      html += `<div class="${className}"><strong>${prefix}</strong>${content}</div>`;
    });
    responseArea.innerHTML = html;
    responseArea.scrollTop = responseArea.scrollHeight; // Auto-scroll to bottom
  }

  async function handleSubmit(mode, inputElement) {
    const input = inputElement.value.trim();
    if (!input) {
      responseArea.textContent = "Please provide input.";
      return;
    }

    // Add user input to conversation history
    const userContent = mode === "follow-up" ? input : `[${mode.toUpperCase()}] ${input}`;
    conversationHistory.push({ role: "user", content: userContent });
    renderConversationHistory();
    inputElement.value = ""; // Clear input

    let prompt = "";
    const historyText = conversationHistory.map(({ role, content }) => `${role.toUpperCase()}: ${content}`).join("\n");

    if (mode === "analyze") {
      prompt = `
    Based on the following **Dating Communication Guide** (which contains principles of emotional intelligence, effective communication, and empathy):
    ${datingGuide}\n\n
    **Context**: ${context || "None"}\n\n
    **Conversation History**:
    ${historyText}\n\n
    **Analysis**:
    Please analyze the situation using principles from the Dating Communication Guide. Focus on empathy, emotional intelligence, and actionable communication strategies. Provide clear and human-centered recommendations that help improve the conversation dynamics and emotional connection. Structure your response with:
    - **Empathetic Analysis**: What emotional cues are present? How can the user better engage emotionally? 🤔
    - **Actionable Recommendations**: What specific steps can be taken to enhance the conversation? 🌱
    - **Do's** ✅ and **Don'ts** ❌: Provide specific, actionable guidance based on the situation.

    Ensure the response is clear, engaging, and formatted in a friendly, conversational tone, with emojis to make it easy to follow.`;
    } else if (mode === "craft") {
      prompt = `
    Based on the following **Dating Communication Guide** (which contains principles of emotional intelligence, effective communication, and empathy):
    ${datingGuide}\n\n
    **Context**: ${context || "None"}\n\n
    **Conversation History**:
    ${historyText}\n\n
    **Craft a Response**:
    Using the guide's principles, craft a thoughtful and engaging response that aligns with the user's tone and voice. The response should be empathetic, human, and aligned with best practices in communication, such as active listening, genuine interest, and emotional intelligence.
    - Provide **2-3 response options** that fit the situation, explaining why each option works based on the principles in the guide.
    - Use **clear formatting**, with headings, numbered lists, and emojis (e.g., ✅ for do's, 🌱 for tips).

    The response should feel natural, conversational, and appropriate for the context.`;
    } else if (mode === "wizard") {
      prompt = `
    Based on the following **Dating Communication Guide** (which contains principles of emotional intelligence, effective communication, and empathy):
    ${datingGuide}\n\n
    **Context**: ${context || "None"}\n\n
    **Conversation History**:
    ${historyText}\n\n
    **General Dating Advice**:
    Provide tailored advice based on the context and conversation history. Focus on emotional intelligence and communication strategies (e.g., empathy, handling rejection, flirting, texting). Use the principles from the guide to give actionable suggestions that will improve the user’s dating experience.
    Format the advice with clear headings, numbered lists, and emojis (e.g., 🌱 for tips, 📘 for habits).
    - **Actionable Strategies**: Offer advice for common dating dynamics (e.g., flirting, texting, navigating mixed signals).
    - **Helpful Habits** 📘: Recommend habits that foster healthy communication and emotional connection.

    Ensure the response is friendly, approachable, and practical.`;
    } else if (mode === "follow-up") {
      prompt = `
    Based on the following **Dating Communication Guide** (which contains principles of emotional intelligence, effective communication, and empathy):
    ${datingGuide}\n\n
    **Context**: ${context || "None"}\n\n
    **Conversation History**:
    ${historyText}\n\n
    **User's Follow-Up Question**:
    The user asked: "${input}"\n\n
    **Follow-Up Response**:
    Build upon the previous conversation by answering the user's follow-up question while maintaining empathy and the principles from the guide. Use clear headings, numbered lists, and emojis to break down the response:
    - **Empathetic Response**: How can we acknowledge the user's feelings or concerns? 🤗
    - **Actionable Insights**: What steps should the user take next? 🌱
    - **Response Tone**: Ensure the response maintains the user’s tone (friendly, conversational) and provides actionable, human-centered advice.

    Be sure to keep the response natural, positive, and emotionally intelligent.`;
    }


    try {
      const apiKey = await new Promise(resolve => {
        chrome.storage.local.get(["encryptedApiKey"], ({ encryptedApiKey }) => {
          resolve(decryptApiKey(encryptedApiKey));
        });
      });

      responseArea.textContent = "Processing...";
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      const assistantResponse = renderMarkdown(data.choices[0].message.content);
      conversationHistory.push({ role: "assistant", content: assistantResponse });
      renderConversationHistory();
    } catch (err) {
      responseArea.textContent = "Error: " + err.message;
    }
  }
});