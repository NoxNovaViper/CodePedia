/**
 * CODEPEDIA EXTRA LOGIC 2026
 * Handles: Firebase Chat
 * Load only on Chat.html
 */

// --- FIREBASE CHAT ---
if (document.getElementById('chat-window')) {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getDatabase, ref, push, onChildAdded, serverTimestamp, query, limitToLast, remove }
        = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

    const firebaseConfig = {
        apiKey: "AIzaSyCIMbWOjtAyx-YOEqAYfPJ5ul_7M2iARIw",
        authDomain: "codepedia-e2bcb.firebaseapp.com",
        projectId: "codepedia-e2bcb",
        storageBucket: "codepedia-e2bcb.firebasestorage.app",
        messagingSenderId: "1003347138801",
        appId: "1:1003347138801:web:b58a0e5595f790d74ff150",
        databaseURL: "https://codepedia-e2bcb-default-rtdb.firebaseio.com"
    };

    const app = initializeApp(firebaseConfig);
    const db  = getDatabase(app);
    const messagesRef = ref(db, 'messages');

    const chatWindow    = document.getElementById('chat-window');
    const msgInput      = document.getElementById('msg-input');
    const sendBtn       = document.getElementById('send-btn');
    const cooldownHint  = document.getElementById('cooldown-hint');
    const adminPanel    = document.getElementById('admin-panel');
    const clearBtn      = document.getElementById('clear-btn');
    const usernameDisplay = document.getElementById('username-display');

    // Persist username across refreshes
    let username = sessionStorage.getItem('cp-username');
    if (!username) {
        username = "Dev-" + Math.floor(Math.random() * 9999);
        sessionStorage.setItem('cp-username', username);
    }
    usernameDisplay.textContent = `You: ${username}`;

    // Show admin panel if ?admin=true in URL
    const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
    if (isAdmin) adminPanel.style.display = 'flex';

    // Admin: clear all messages
    clearBtn.addEventListener('click', () => {
        if (confirm('Delete ALL messages? This cannot be undone.')) {
            remove(messagesRef);
            // Clear the UI too
            chatWindow.innerHTML = `<div class="message system-msg">Chat cleared by admin.</div>`;
        }
    });

    // Spam cooldown
    let lastSent = 0;
    const COOLDOWN_MS = 3000;

    function sendMessage() {
        const now = Date.now();
        const remaining = COOLDOWN_MS - (now - lastSent);
        if (remaining > 0) {
            cooldownHint.textContent = `⏱ Wait ${(remaining / 1000).toFixed(1)}s before sending again.`;
            return;
        }
        const text = msgInput.value.trim();
        if (!text) return;

        push(messagesRef, { username, text, timestamp: serverTimestamp() });
        msgInput.value = "";
        lastSent = Date.now();
        cooldownHint.textContent = "";
    }

    // Send on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send on Enter key
    msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Load last 50 messages
    const recentMessages = query(messagesRef, limitToLast(50));

    onChildAdded(recentMessages, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const messageEl = document.createElement('div');
        messageEl.classList.add('message');

        // Highlight own messages
        if (data.username === username) messageEl.classList.add('own');

        const userEl = document.createElement('div');
        userEl.className = 'msg-user';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = data.username === username ? 'You' : data.username;
        userEl.appendChild(nameSpan);

        if (data.timestamp) {
            const timeEl = document.createElement('span');
            timeEl.className = 'msg-time';
            timeEl.textContent = new Date(data.timestamp).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
            });
            userEl.appendChild(timeEl);
        }

        const textEl = document.createElement('div');
        textEl.className = 'msg-text';
        textEl.textContent = data.text; // Safe — no innerHTML

        messageEl.append(userEl, textEl);
        chatWindow.appendChild(messageEl);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}