let datingGuide = "";
let context = "";
let userEncryptionKey = null;

// Open window on popup load
document.addEventListener("DOMContentLoaded", () => {
  chrome.windows.create({
    url: chrome.runtime.getURL("window.html"),
    type: "popup",
    width: 820,
    height: 640,
    top: 100,
    left: 100
  }, () => {
    window.close(); // Close the popup
  });
});

// Load dating guide (runs in window.html context)
if (location.pathname.includes("window.html")) {
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

    // Handle submissions
    submitAnalyzeBtn.addEventListener("click", () => handleSubmit("analyze"));
    submitCraftBtn.addEventListener("click", () => handleSubmit("craft"));
    submitWizardBtn.addEventListener("click", () => handleSubmit("wizard"));

    // Clear messages on close
    window.addEventListener("unload", () => {
      userInput.value = "";
      responseArea.textContent = "";
      context = "";
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

    async function handleSubmit(mode) {
      const input = userInput.value.trim();
      if (!input) {
        responseArea.textContent = "Please provide input.";
        return;
      }

      responseArea.textContent = "Processing...";
      let prompt = "";

      if (mode === "analyze") {
        prompt = `Based on the following dating communication guide:\n${datingGuide}\n\nContext: ${context || "None"}\n\nConversation/Situation: ${input}\n\nAnalyze the situation, providing empathetic and actionable recommendations. Use a friendly, human tone and format the response with clear headings, numbered lists, and emojis (e.g., 🌱 for tips, ✅ for do's, ❌ for don'ts). Include specific suggestions grounded in the guide's principles.`;
      } else if (mode === "craft") {
        prompt = `Based on the following dating communication guide:\n${datingGuide}\n\nContext: ${context || "None"}\n\nConversation: ${input}\n\nCraft a response that aligns with the guide's principles (e.g., empathy, active listening, genuine interest). Preserve the user's tone and voice, making the response personal, engaging, and human (not robotic). Provide 2-3 response options with brief explanations of why they work. Format the response with clear headings, numbered lists, and emojis (e.g., 🌱 for tips, ✅ for response options). Ensure the response feels natural and conversational.`;
      } else if (mode === "wizard") {
        prompt = `Based on the following dating communication guide:\n${datingGuide}\n\nContext: ${context || "None"}\n\nProvide general dating advice tailored to the context, focusing on emotional intelligence and communication. Use a friendly, human tone and format with clear headings, numbered lists, and emojis (e.g., 🌱 for tips, 📘 for habits). Offer actionable strategies for common dating dynamics (e.g., flirting, texting, handling rejection).`;
      }

      try {
        const apiKey = await new Promise(resolve => {
          chrome.storage.local.get(["encryptedApiKey"], ({ encryptedApiKey }) => {
            resolve(decryptApiKey(encryptedApiKey));
          });
        });

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1000 // Increased for richer responses
          })
        });

        if (!response.ok) throw new Error("API request failed");
        const data = await response.json();
        responseArea.innerHTML = renderMarkdown(data.choices[0].message.content);
      } catch (err) {
        responseArea.textContent = "Error: " + err.message;
      }
    }
  });
}