// Background service worker for FALO Prompt Manager extension

// Set panel behavior to open sidepanel on clicking the extension icon
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));

// Log installation event
chrome.runtime.onInstalled.addListener(() => {
  console.log("FALO Prompt Manager extension installed.");
});
