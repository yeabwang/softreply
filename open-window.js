document.addEventListener("DOMContentLoaded", () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("window.html"),
      type: "popup",
      state: "maximized"
    }, () => {
      window.close(); // Close the popup
    });
  });