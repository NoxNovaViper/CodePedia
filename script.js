/**
 * CODEPEDIA CORE LOGIC 2026
 * Handles: Snippet Fetching, Multi-level Search, Visualizers, and Clipboard
 */

// 1. Snippet Loader - Attached to 'window' so HTML can see it
window.openLang = async function(evt, filename, targetId) {
    const card = evt.currentTarget.closest('.card');
    const displayBox = document.getElementById(targetId);
    
    card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');

    try {
        displayBox.textContent = "// Loading snippet...";
        const response = await fetch(`./snippets/${filename}.txt`);
        if (!response.ok) throw new Error("File not found");
        const codeText = await response.text();
        displayBox.textContent = codeText;
    } catch (err) {
        displayBox.textContent = `// Error: Could not find ${filename}.txt in /snippets/`;
        console.error("Snippet Fetch Error:", err);
    }
}

// 2. Global Search Logic (Unified for Home and Category pages)
document.addEventListener('input', function(e) {
    if (e.target.id === 'pageSearch' || e.target.id === 'mainSearch') {
        const term = e.target.value.toLowerCase();
        
        // Filter Sections (Category pages)
        document.querySelectorAll('section').forEach(section => {
            const h2 = section.querySelector('h2')?.innerText.toLowerCase() || "";
            const p = section.querySelector('p')?.innerText.toLowerCase() || "";
            section.style.display = (h2.includes(term) || p.includes(term)) ? "block" : "none";
        });

        // Filter standalone Cards (Home page)
        document.querySelectorAll('.content-card').forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? "flex" : "none";
        });
    }
});

// 3. Math Visualizer Logic
const slider = document.getElementById('mathSlider');
if (slider) {
    slider.oninput = function() {
        const output = document.getElementById('visualizer-output');
        const explanation = document.getElementById('logic-explanation');
        const val = parseInt(this.value);
        const pair = (36 / val).toFixed(1);
        output.innerHTML = `Factor Pair: ${val} × ${pair}`;
        
        if (val < 6) {
            explanation.innerHTML = `Checking <strong>${val}</strong>: Partner ${pair} is above 6.`;
        } else if (val === 6) {
            explanation.innerHTML = `<strong>At √36</strong>: Factors meet at 6 × 6!`;
        } else {
            explanation.innerHTML = `Checking <strong>${val}</strong>: Already found ${pair} earlier. $O(\sqrt{n})$!`;
        }
    };
}

// 4. Copy to Clipboard - Attached to 'window'
window.copyCode = async function(targetId) {
    const code = document.getElementById(targetId).textContent;
    const btn = document.querySelector(`button[onclick="copyCode('${targetId}')"]`);
    
    try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.borderColor = "var(--accent)";
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.borderColor = "var(--border)";
        }, 2000);
    } catch (err) {
        btn.innerText = "Error!";
    }
}

// 5. Initial Setup
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
    });
});

/* --- CHAT ENGINE (Firebase) --- */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, set, off } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIMbWOjtAyx-YOEqAYfPJ5ul_7M2iARIw",
    authDomain: "codepedia-e2bcb.firebaseapp.com",
    projectId: "codepedia-e2bcb",
    storageBucket: "codepedia-e2bcb.firebasestorage.app",
    messagingSenderId: "1003347138801",
    appId: "1:1003347138801:web:b58a0e5595f790d74ff150",
    measurementId: "G-2W6S6DNDV2",
    databaseURL: "https://codepedia-e2bcb-default-rtdb.firebaseio.com"
};

if (document.getElementById('chat-window')) {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const msgInput = document.getElementById('msg-input');
    const roomSelect = document.getElementById('room-select');
    const nickInput = document.getElementById('nickname-input');
    const clearBtn = document.getElementById('clear-chat');

    nickInput.value = localStorage.getItem('cp-nickname') || "Dev-" + Math.floor(Math.random() * 9999);
    nickInput.onchange = () => localStorage.setItem('cp-nickname', nickInput.value);

    let currentRoom = 'global';
    let messagesRef;

    function connectToRoom(roomName) {
        if (messagesRef) off(messagesRef);
        currentRoom = roomName;
        chatWindow.innerHTML = `<div class="message"><span class="msg-text">Joined ${roomName}...</span></div>`;
        messagesRef = ref(db, 'rooms/' + currentRoom);

        onChildAdded(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if(!data) return;
            const div = document.createElement('div');
            div.className = 'message';
            div.innerHTML = `<span class="msg-user">${data.username}</span><span class="msg-text">${data.text}</span>`;
            chatWindow.appendChild(div);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    }

    chatForm.onsubmit = (e) => {
        e.preventDefault();
        if (msgInput.value.trim()) {
            push(messagesRef, {
                username: nickInput.value,
                text: msgInput.value,
                timestamp: serverTimestamp()
            });
            msgInput.value = "";
        }
    };

    roomSelect.onchange = (e) => connectToRoom(e.target.value);
    if (new URLSearchParams(window.location.search).get('admin') === 'true') {
        document.getElementById('admin-panel').style.display = 'flex';
    }
    clearBtn.onclick = () => {
        if(confirm("Clear history?")) set(messagesRef, null).then(() => location.reload());
    };
    connectToRoom('global');
}