const chatbox = document.getElementById("chatbox");
const input = document.getElementById("userInput");

function addMessage(content, className) {
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.innerText = content;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;
  addMessage(userText, "user");
  input.value = "";

  fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
  })
  .then(res => res.json())
  .then(data => {
    addMessage(data.reply, "bot");
  });
}

function handleKey(event) {
  if (event.key === "Enter") sendMessage();
}
