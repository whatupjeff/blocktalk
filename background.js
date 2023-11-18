// Background service worker
let messageHistory = [];
let socket;

chrome.runtime.onStartup.addListener(() => {
    socket = new WebSocket('ws://localhost:3000');
    socket.addEventListener('message', function (event) {
        let incomingMessage = JSON.parse(event.data);
        if (incomingMessage.event === 'newMessage') {
            messageHistory.push(incomingMessage.data.message);
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getMessageHistory') {
        sendResponse({messageHistory: messageHistory});
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (socket) {
      socket.close();
    }
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.active && socket) {
      socket.close();
    }
  });
  