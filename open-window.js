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