/**
 * CODEPEDIA EXTRA LOGIC 2026
 * Handles: Firebase Chat
 * Load on Chat.html
 */
// --- FIREBASE CHAT ---
if (document.getElementById('chat-window')) {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getDatabase, ref, push, onChildAdded, serverTimestamp, query, limitToLast }
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

    const chatWindow   = document.getElementById('chat-window');
    const chatForm     = document.getElementById('chat-form');
    const msgInput     = document.getElementById('msg-input');
    const cooldownHint = document.getElementById('cooldown-hint');

    // Persist username across refreshes
    let username = sessionStorage.getItem('cp-username');
    if (!username) {
        username = "Dev-" + Math.floor(Math.random() * 9999);
        sessionStorage.setItem('cp-username', username);
    }

    let lastSent = 0;
    const COOLDOWN_MS = 3000;

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const now = Date.now();
        const remaining = COOLDOWN_MS - (now - lastSent);
        if (remaining > 0) {
            cooldownHint.textContent = `Please wait ${(remaining / 1000).toFixed(1)}s before sending again.`;
            return;
        }
        const text = msgInput.value.trim();
        if (text) {
            push(messagesRef, { username, text, timestamp: serverTimestamp() });
            msgInput.value = "";
            lastSent = Date.now();
            cooldownHint.textContent = "";
        }
    });

    const recentMessages = query(messagesRef, limitToLast(50));

    onChildAdded(recentMessages, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const messageEl = document.createElement('div');
        messageEl.classList.add('message');

        const userEl = document.createElement('span');
        userEl.className = 'msg-user';
        userEl.textContent = data.username;

        const textEl = document.createElement('span');
        textEl.className = 'msg-text';
        textEl.textContent = data.text;

        if (data.timestamp) {
            const timeEl = document.createElement('span');
            timeEl.className = 'msg-time';
            timeEl.textContent = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            userEl.appendChild(timeEl);
        }

        messageEl.append(userEl, textEl);
        chatWindow.appendChild(messageEl);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}