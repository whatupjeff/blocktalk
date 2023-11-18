
// Define constants
const WS_URL = 'ws://[::1]:3002';
const EMPTY_STR = '';

// Define messages
const MSG_JOINING = "Connecting...";
const MSG_CONN_LOST = "Connection lost, reconnecting...";
const MSG_CONN_FAIL = "Connection failed, reconnecting...";
const MSG_MSG_HISTORY_SAVED = 'Message history is saved';

let socket;
let chatName;
let messageHistory = [];

// Elements
const elements = {
  chatWindow: document.getElementById('chat_window'),
  status: document.getElementById('status'),
  statusIndicator: document.getElementById('statusIndicator'),
  chatTitle: document.getElementById('chat_title'),
  sendButton: document.getElementById('send_button'),
  messageInput: document.getElementById('message_input'),
  scrollDownButton: document.getElementById('scroll_down_button')
};

// Functions
const createMessageElement = (text) => {
  const message = document.createElement('p');
  message.className = 'message';
  message.innerText = text;
  return message;
};

const updateStatus = (text) => elements.status.innerText = text;

const updateStatusIndicator = (className) => elements.statusIndicator.className = className;

const appendMessage = (message) => {
  const messageElement = createMessageElement(message);
  elements.chatWindow.appendChild(messageElement);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
};

// Initialize WebSocket connection
const connectWebSocket = () => {
  socket = io(WS_URL);

  socket.on('connect', () => {
    console.log('WebSocket connected');
    updateStatus(MSG_JOINING);
    updateStatusIndicator('checkmark');

    // Restore session if exists
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      socket.emit('resumeSession', { sessionId });
    }
  });

  socket.on('newMessage', handleSocketMessage);
  socket.on('updateUserCount', handleSocketUpdateUserCount);
  socket.on('disconnect', handleSocketDisconnect);
  socket.on('connect_error', handleSocketConnectError);
};

// Socket handlers
const handleSocketMessage = (message) => {
  console.log('New message received:', message);
  if (message && message.message) {
    appendMessage(message.message);
    messageHistory.push(message.message);
    saveMessageHistory();
  }
};

const handleSocketUpdateUserCount = (count) => {
  // Update user count
};

const handleSocketDisconnect = () => {
  updateStatus(MSG_CONN_LOST);
};

const handleSocketConnectError = () => {
  updateStatus(MSG_CONN_FAIL);
};

// Send message
const sendMessage = () => {
  const messageText = elements.messageInput.value.trim();
  if (messageText) {
    const room = chatName; // Use chatName as room
    const message = { room: room, message: messageText };
    socket.emit('chatToRoom', message);
    elements.messageInput.value = EMPTY_STR;
    elements.sendButton.disabled = true;  
  }
};

// Event listeners
const setupEventListeners = () => {
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!socket || socket.disconnected) {
      connectWebSocket();
    }

    socket.off('session').off('error');

    socket.once('session', (data) => {
      localStorage.setItem('sessionId', data.sessionId);
      document.getElementById('loginScreen').style.display = "none";
      document.getElementById('chatScreen').style.display = "block";
    });

    socket.once('error', (error) => {
      console.error('Login failed:', error.message);
    });

    socket.emit('login', { username, password });
  });

  elements.messageInput.addEventListener('input', handleInputChange);
  elements.messageInput.addEventListener('keydown', handleInputKeydown);
  elements.sendButton.addEventListener('click', sendMessage);
};

const handleInputChange = (event) => {
  elements.sendButton.disabled = !event.target.value.trim();
  event.target.style.height = 'auto';
  event.target.style.height = event.target.scrollHeight + 'px';
};

const handleInputKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// Function to clear chat window
const clearChatWindow = () => {
  while (elements.chatWindow.firstChild) {
    elements.chatWindow.removeChild(elements.chatWindow.firstChild);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chatName = new URL(tabs[0].url).hostname; // Use hostname as chat room name
    loadMessageHistory(); // Load message history for this chat room
    setupEventListeners();
  });
});

// Load message history from local storage
function loadMessageHistory() {
    let savedHistory = localStorage.getItem('messageHistory_' + chatName);
    if (savedHistory) {
        messageHistory = JSON.parse(savedHistory);
        messageHistory.forEach(message => appendMessage(message));
    }
}

// Function to save chat history
const saveMessageHistory = () => {
  localStorage.setItem('messageHistory_' + chatName, JSON.stringify(messageHistory));
  console.log(MSG_MSG_HISTORY_SAVED);
};

async function connectToWallet() {
  if (typeof WalletConnectProvider === 'undefined') {
      console.error('WalletConnectProvider is not defined. Make sure you have included the WalletConnect script.');
      return;
  }

  // Initialize WalletConnectProvider
  const provider = new WalletConnectProvider.default({
      infuraId: "https://mainnet.infura.io/v3/5915d9e9b91f4168b5e2ee4d09915145" // Replace with your Infura Project ID
  });

  // Start wallet connection
  try {
      await provider.enable();
      console.log('Wallet connected');
      // Perform further actions with the provider here
      updateStatus("Wallet connected");
  } catch (error) {
      console.error('Failed to connect wallet:', error);
      updateStatus("Failed to connect wallet");
  }
}

// Add event listener to the connect wallet button
document.getElementById('connectWalletButton').addEventListener('click', connectToWallet);
