# Chrome Extension Documentation

## Installing the Extension

1. **Create a folder for the extension.**
2. **Create the `manifest.json` file:** This file defines the main properties of your extension.
3. **Add scripts and resources:** Add the necessary scripts and files to the extension folder.
4. **Go to `chrome://extensions/` in your browser.**
5. **Enable "Developer mode".**
6. **Load your extension.**

## 1. Example `manifest.json`

```json
{
  "background": {
    "persistent": true, // This parameter indicates that the background script will run continuously.
    "scripts": [
      "js/background.js" // Specifies the path to the background script file.
    ]
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>" // Indicates that this content script will run on all URLs.
      ],
      "js": [
        "js/test.js" // Specifies the path to the content script file.
      ]
    }
  ],
  "browser_action": {
    "default_icon": "./img/icons/extension/free.png", // Specifies the path to the extension icon.
    "default_popup": "popup.html", // Specifies the path to the file that will be displayed in the extension's popup window.
    "default_title": "__MSG_name__" // Specifies the title for the browser action, using a localized value.
  },
  "default_locale": "en", // Specifies the default language for localized messages.
  "description": "__MSG_description__", // Specifies the description of the extension, using a localized value.
  "icons": {
    "128": "./img/icons/extension/free.png" // Specifies the path to the extension icon with a size of 128x128.
  },
  "manifest_version": 2, // Specifies the version of the manifest.
  "name": "__MSG_name__", // Specifies the name of the extension, using a localized value.
  "options_page": "popup.html?options=1", // Specifies the path to the extension's options page.
  "permissions": [
    "activeTab", // Allows the extension to access the active browser tab.
    "cookies", // Allows the extension to access cookies.
    "clipboardWrite", // Allows the extension to write to the clipboard.
    "storage", // Allows the extension to use the browser's storage.
    "background", // Allows the extension to perform background tasks.
    "<all_urls>", // Allows the extension to access all URLs.
    "tabs" // Allows the extension to access browser tabs.
  ],
  "short_name": "__MSG_name__", // Specifies the short name of the extension, using a localized value.
  "update_url": "https://clients2.google.com/service/update2/crx", // Specifies the URL for updating the extension.
  "version": "1.1" // Specifies the version of the extension.
}
```

## 2. API

### 2.1 chrome.tabs.query
API for sending a message from Extensions to the front end:

```javascript
chrome.tabs.query(
  // 1st Parameter of chrome.tabs.query: QUERY OBJECT.
  // Executes a query to get information about tabs.
  // In this case, it requests tabs that are active (active: true) and in the current window (currentWindow: true).
  { active: true, currentWindow: true },
  // 2nd Parameter of chrome.tabs.query: FUNCTION THAT ALREADY HAS AN ARRAY OF TABS AS PARAMETERS.
  // function (tabs): This is a callback function that is called after executing the chrome.tabs.query request. It receives an array of tabs that match the query conditions.
  function (tabs) {
    // chrome.tabs.sendMessage: Sends a message to the specified tab.
    chrome.tabs.sendMessage(
      // 1st Parameter of chrome.tabs.sendMessage: TAB.
      // In this case, the message is sent to the first (and only active) tab from the tabs array.
      tabs[0].id,
      // 2nd Parameter of chrome.tabs.sendMessage: MESSAGE.
      // The message contains an object { word: data }, where data is the value you want to pass.
      { word: data },
      // 3rd Parameter of chrome.tabs.sendMessage: CALLBACK FUNCTION.
      // function (response): This is a callback function that is called after the message has been sent and a response is received from the content script.
      function (response) {
        console.log(response);
      }
    );
  }
);
```

### 2.2 chrome.runtime.onInstalled
Event listener for installing or updating the extension:

```javascript
chrome.runtime.onInstalled.addListener(function (details) {
    // chrome.runtime.onInstalled:
    // This event occurs when the extension is installed, updated, or when Chrome is updated to a new version and the extension is re-installed.
    if (details.reason === 'install') {
        console.log('Extension installed');
    } else if (details.reason === 'update') {
        console.log('Extension updated from version ' + details.previousVersion);
    }
    // Arguments:
    // details (object): An object containing information about the installation event.
    // reason (string): The reason for the installation. Possible values are:
    // install: The extension was installed.
    // update: The extension was updated.
    // chrome_update: Chrome was updated to a new version.
    // shared_module_update: A shared module was updated.
    // previousVersion (string, optional): The previous version of the extension, if reason is update.
    // id (string, optional): The ID of the extension, if reason is shared_module_update.
});
```

### 2.3 chrome.tabs.onUpdated
Event listener for tab updates:

```javascript
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // chrome.tabs.onUpdated:
    // This event occurs when the status or content of a tab is updated.
    if (changeInfo.status === 'complete' && tab.active) {
        chrome.tabs.sendMessage(tabId, { greeting: "hello from background extension" }, function (response) {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
            } else {
                console.log(response.farewell);
            }
        });
    }
    // Arguments:
    // tabId (number): The ID of the tab.
    // changeInfo (object): An object containing changes to the tab.
    // status (string, optional): The loading status of the tab. Possible values are:
    // loading: The tab is loading.
    // complete: The tab is fully loaded.
    // url (string, optional): The URL of the tab, if it has changed.
    // Other properties: may include changes to tab attributes such as favIconUrl, title, etc.
    // tab (object): The tab object containing all information about the tab.
});
```

### 2.4 chrome.runtime.onMessage
Listener for receiving messages:

```javascript
chrome.runtime.onMessage.addListener(
    // The chrome.runtime.onMessage.addListener event
    // is used to listen for messages sent by another component of the extension (e.g., background script, popup, or content script).
    // Arguments:
    // message (object): The message object sent via chrome.runtime.sendMessage or chrome.tabs.sendMessage.
    // sender (object): An object containing information about the sender of the message.
    // tab (object, optional): The tab object if the message was sent from a content script.
    // id (string): The ID of the extension or app that sent the message.
    // url (string, optional): The URL of the frame that sent the message (if available).
    // sendResponse (function): A function used to send a response back to the sender of the message.
    function (data, sender, sendResponse) {
        console.log(data);
        if (data.greeting) {
            console.log(data.greeting);
            sendResponse({ farewell: "goodbye" });
        }
    }
);
```

This content is ready to be copied and pasted into your `README.md` file.
