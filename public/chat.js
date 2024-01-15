    const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = ({ data }) => {
  const message = document.createElement('div');
  message.textContent = data;
  messages.appendChild(message);
};

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  ws.send(messageInput.value);
  messageInput.value = '';
});

    