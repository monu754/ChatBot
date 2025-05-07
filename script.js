document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const chatMessages = document.getElementById("chat-messages")
    const userInput = document.getElementById("user-input")
    const sendBtn = document.getElementById("send-btn")
    const newChatBtn = document.getElementById("new-chat-btn")
    const chatHistoryContainer = document.getElementById("chat-history")
    const sidebarUsername = document.getElementById("sidebar-username")
    const logoutBtn = document.getElementById("logout-btn")
    const menuToggle = document.getElementById("menu-toggle")
    const sidebar = document.querySelector(".sidebar")
    const nameModal = document.getElementById("name-modal")
    const usernameInput = document.getElementById("username-input")
    const startChatBtn = document.getElementById("start-chat-btn")
    const voiceBtn = document.getElementById("voice-btn")
  
    // State
    let currentChatId = null
    let chats = JSON.parse(localStorage.getItem("chatbot-chats")) || {}
    let username = localStorage.getItem("chatbot-username") || null
  
    if (username) {
      // Set the username in the sidebar
      sidebarUsername.textContent = username
    } else {
      // Default to "User" if no username is found
      sidebarUsername.textContent = "User"
    }
  
    // Initialize
    if (!username) {
      showNameModal()
    } else {
      initializeChat()
    }
  
    // Event Listeners
    sendBtn.addEventListener("click", sendMessage)
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage()
      }
    })
    newChatBtn.addEventListener("click", createNewChat)
    logoutBtn.addEventListener("click", logout)
    menuToggle.addEventListener("click", toggleSidebar)
    startChatBtn.addEventListener("click", startChat)
  
    const chatHistory = document.getElementById("chat-history")
  
    // Load chat names from localStorage
    const loadChatNames = () => {
      const savedChats = JSON.parse(localStorage.getItem("chatNames")) || {}
      const chatItems = chatHistory.querySelectorAll(".chat-history-item")
  
      chatItems.forEach((chatItem, index) => {
        const chatTitle = chatItem.querySelector(".chat-title")
        if (savedChats[`chat-${index}`]) {
          chatTitle.textContent = savedChats[`chat-${index}`]
        }
      })
    }
  
    // Save chat names to localStorage
    const saveChatName = (index, newName) => {
      const savedChats = JSON.parse(localStorage.getItem("chatNames")) || {}
      savedChats[`chat-${index}`] = newName
      localStorage.setItem("chatNames", JSON.stringify(savedChats))
    }
  
    // Add event listener for rename buttons
    chatHistory.addEventListener("click", (event) => {
      if (event.target.closest(".rename-chat-btn")) {
        const chatItem = event.target.closest(".chat-history-item")
        const chatTitle = chatItem.querySelector(".chat-title")
        const chatIndex = Array.from(chatHistory.children).indexOf(chatItem)
        const newName = prompt("Enter a new name for this chat:", chatTitle.textContent)
  
        if (newName && newName.trim()) {
          chatTitle.textContent = newName.trim()
          saveChatName(chatIndex, newName.trim())
        }
      }
    })
  
    // Load chat names on page load
    loadChatNames()
  
    // Functions
    function showNameModal() {
      nameModal.style.display = "flex"
      usernameInput.focus()
    }
  
    function hideNameModal() {
      nameModal.style.display = "none"
    }
  
    function startChat() {
      const name = usernameInput.value.trim()
      if (name) {
        username = name
        localStorage.setItem("chatbot-username", name)
        sidebarUsername.textContent = name
        hideNameModal()
        initializeChat()
      }
    }
  
    function initializeChat() {
      loadChatHistory()
  
      if (Object.keys(chats).length === 0) {
        createNewChat()
      } else {
        const chatIds = Object.keys(chats)
        currentChatId = chatIds[chatIds.length - 1]
        loadChat(currentChatId)
      }
    }
  
    function createNewChat() {
      const chatId = Date.now().toString()
      currentChatId = chatId
  
      chats[chatId] = {
        id: chatId,
        title: `Chat ${Object.keys(chats).length + 1}`,
        messages: [],
        createdAt: new Date().toISOString(),
      }
  
      saveChats()
      addChatToHistory(chatId, chats[chatId].title)
      chatMessages.innerHTML = ""
  
      addMessage("bot", `Hello ${username}! How can I help you today?`)
      addMessageToChat("bot", `Hello ${username}! How can I help you today?`)
    }
  
    function loadChatHistory() {
      chatHistoryContainer.innerHTML = ""
  
      const sortedChats = Object.values(chats).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
  
      sortedChats.forEach((chat) => {
        addChatToHistory(chat.id, chat.title)
      })
    }
  
    function addChatToHistory(chatId, title) {
      const chatItem = document.createElement("div")
      chatItem.className = "chat-history-item"
      if (chatId === currentChatId) {
        chatItem.classList.add("active")
      }
  
      chatItem.innerHTML = `
              <i class="fas fa-comment-alt"></i>
              <span class="chat-title">${title}</span>
              <button class="rename-chat-btn" data-chat-id="${chatId}" title="Rename chat">
                  <i class="fas fa-edit"></i>
              </button>
              <button class="delete-chat-btn" data-chat-id="${chatId}" title="Delete chat">
                  <i class="fas fa-trash"></i>
              </button>
          `
  
      chatItem.addEventListener("click", (e) => {
        // Don't load chat if delete button was clicked
        if (!e.target.closest(".delete-chat-btn")) {
          loadChat(chatId)
        }
      })
  
      // Add delete button event listener
      const deleteBtn = chatItem.querySelector(".delete-chat-btn")
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        deleteChat(chatId)
      })
  
      chatItem.dataset.chatId = chatId
      chatHistoryContainer.appendChild(chatItem)
    }
  
    function deleteChat(chatId) {
      // Confirm before deleting
      if (!confirm("Are you sure you want to delete this chat?")) {
        return
      }
  
      delete chats[chatId]
      saveChats()
  
      // If we deleted the current chat, create a new one
      if (currentChatId === chatId) {
        const remainingChats = Object.keys(chats)
        if (remainingChats.length > 0) {
          currentChatId = remainingChats[remainingChats.length - 1]
          loadChat(currentChatId)
        } else {
          createNewChat()
        }
      }
  
      // Remove from sidebar
      const chatItem = document.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`)
      if (chatItem) {
        chatItem.remove()
      }
    }
  
    function loadChat(chatId) {
      currentChatId = chatId
  
      // Update active state in sidebar
      document.querySelectorAll(".chat-history-item").forEach((item) => {
        item.classList.remove("active")
        if (item.dataset.chatId === chatId) {
          item.classList.add("active")
        }
      })
  
      // Load messages
      chatMessages.innerHTML = ""
      const chat = chats[chatId]
      if (chat && chat.messages) {
        chat.messages.forEach((msg) => {
          addMessage(msg.sender, msg.text, false, msg.timestamp)
        })
      }
  
      scrollToBottom()
    }
  
    function sendMessage() {
      const message = userInput.value.trim()
      if (message) {
        addMessage("user", message)
        addMessageToChat("user", message)
        userInput.value = ""
  
        // Update chat title if first message
        if (chats[currentChatId].messages.length === 1) {
          updateChatTitle(currentChatId, message.substring(0, 30))
        }
  
        // Show typing indicator
        const typingIndicator = addMessage("bot", "...", true)
  
        // Get bot response
        getBotResponse(message)
          .then((response) => {
            chatMessages.removeChild(typingIndicator)
            addMessage("bot", response)
            addMessageToChat("bot", response)
          })
          .catch((error) => {
            console.error("Error:", error)
            chatMessages.removeChild(typingIndicator)
            addMessage("bot", "Sorry, I'm having trouble responding.")
          })
      }
    }
  
    function addMessage(sender, message, isTyping = false, timestamp = null) {
      const messageDiv = document.createElement("div")
      messageDiv.className = `message ${sender}-message`
  
      const avatarDiv = document.createElement("div")
      avatarDiv.className = `avatar ${sender}-avatar`
      avatarDiv.innerHTML = sender === "user" ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'
  
      const contentDiv = document.createElement("div")
      contentDiv.className = "message-content"
      contentDiv.textContent = message
  
      if (!isTyping) {
        const timeDiv = document.createElement("div")
        timeDiv.className = "message-time"
        timeDiv.textContent = timestamp ? formatTime(timestamp) : getCurrentTime()
        contentDiv.appendChild(timeDiv)
      }
  
      messageDiv.appendChild(avatarDiv)
      messageDiv.appendChild(contentDiv)
      chatMessages.appendChild(messageDiv)
      scrollToBottom()
  
      return messageDiv
    }
  
    function addMessageToChat(sender, message) {
      if (!currentChatId || !chats[currentChatId]) return
  
      chats[currentChatId].messages.push({
        sender,
        text: message,
        timestamp: new Date().toISOString(),
      })
  
      saveChats()
    }
  
    function updateChatTitle(chatId, title) {
      if (chats[chatId]) {
        chats[chatId].title = title
        saveChats()
  
        const chatItem = document.querySelector(`.chat-history-item[data-chat-id="${chatId}"] span`)
        if (chatItem) {
          chatItem.textContent = title
        }
      }
    }
  
    async function getBotResponse(message) {
      try {
        const response = await fetch("http://localhost:5000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: message }),
        })
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
  
        const data = await response.json()
        return data.response || "I didn't understand that. Could you rephrase?"
      } catch (error) {
        console.error("Error calling chatbot API:", error)
        return "I'm having trouble connecting to the chatbot service."
      }
    }
  
    function saveChats() {
      localStorage.setItem("chatbot-chats", JSON.stringify(chats))
      if (username) {
        localStorage.setItem("chatbot-username", username)
      }
    }
  
    function logout() {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("chatbot-username")
        localStorage.removeItem("chatbot-chats")
        username = null
        chats = {}
        currentChatId = null
        chatMessages.innerHTML = ""
        chatHistoryContainer.innerHTML = ""
        sidebarUsername.textContent = "User"
        showNameModal()
      }
    }
  
    function toggleSidebar() {
      sidebar.classList.toggle("open")
      const overlay = document.getElementById("sidebar-overlay")
      overlay.classList.toggle("active")
    }
  
    function scrollToBottom() {
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  
    function getCurrentTime() {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  
    function formatTime(isoString) {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  
    // Check if the browser supports the Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"
  
      // Start voice recognition when the microphone button is clicked
      voiceBtn.addEventListener("click", () => {
        recognition.start()
      })
  
      // Handle the recognition result
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        userInput.value = transcript // Set the recognized text in the input field
      }
  
      // Handle recognition errors
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
      }
  
      // Stop recognition when the user stops speaking
      recognition.onend = () => {
        console.log("Speech recognition ended.")
      }
    } else {
      // If the browser does not support the Web Speech API
      voiceBtn.disabled = true
      voiceBtn.title = "Voice input is not supported in this browser."
      console.warn("Web Speech API is not supported in this browser.")
    }
  
    // Add overlay click event to close sidebar
    const sidebarOverlay = document.getElementById("sidebar-overlay")
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open")
      sidebarOverlay.classList.remove("active")
    })
  
    // Add window resize event to hide sidebar on larger screens
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("open")
        sidebarOverlay.classList.remove("active")
      }
    })
  })
  