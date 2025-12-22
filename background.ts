// Handle keyboard shortcut command
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-tab-manager") {
    // Get the extension URL for the tab manager page
    // Using Plasmo's tabs directory feature
    const tabManagerUrl = chrome.runtime.getURL("tabs/tabmanager.html")

    // Open the tab manager in a new tab
    chrome.tabs.create({ url: tabManagerUrl })
  }
})

