/**
 * CODEPEDIA CORE LOGIC 2026
 * Handles: Snippet Fetching, Multi-level Search, Visualizers, Clipboard, and Live Chat
 */

// --- 1. Snippet Loader ---
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

// --- 2. Unified Search Logic ---
document.addEventListener('input', function(e) {
    if (e.target.id === 'pageSearch' || e.target.id === 'mainSearch') {
        const term = e.target.value.toLowerCase();
        
        document.querySelectorAll('section').forEach(section => {
            const h2 = section.querySelector('h2')?.innerText.toLowerCase() || "";
            const p = section.querySelector('p')?.innerText.toLowerCase() || "";
            section.style.display = (h2.includes(term) || p.includes(term)) ? "block" : "none";
        });

        document.querySelectorAll('.content-card').forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? "flex" : "none";
        });
    }
});

// --- 3. Math Visualizer ---
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

// --- 4. Copy to Clipboard ---
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

// --- 5. Initial Setup ---
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
    });
});
// --- 6. CODEPEDIA DEV ENGINE (Bubbles, IDE Preview & Admin Logic) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, set, off, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- UI Elements ---
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const roomSelect = document.getElementById('room-select');
const nickInput = document.getElementById('nickname-input');
const userColor = document.getElementById('user-color');
const chatGate = document.getElementById('chat-gate');
const gateNickInput = document.getElementById('gate-nick');
const joinChatBtn = document.getElementById('join-chat-btn');
const clearBtn = document.getElementById('clear-chat');
const leaderboardList = document.getElementById('leaderboard-list');

let currentRoom = 'global';
let messagesRef;
let myId = localStorage.getItem('cp-userid') || "dev-" + Math.random().toString(36).substring(7);
localStorage.setItem('cp-userid', myId);

// --- 1. THE NICKNAME GATE ---
joinChatBtn.onclick = () => {
    const name = gateNickInput.value.trim();
    if (name.length < 2) return alert("Handle too short!");
    
    nickInput.value = name;
    localStorage.setItem('cp-nickname', name);
    chatGate.style.display = 'none'; // Unlock UI
    
    if (messagesRef) {
        push(messagesRef, {
            username: "SYSTEM",
            text: `📡 ${name} initialized a connection.`,
            color: "var(--accent)",
            rank: "sys",
            timestamp: serverTimestamp()
        });
    }
};

// Auto-fill gate if returning user
if(localStorage.getItem('cp-nickname')) {
    gateNickInput.value = localStorage.getItem('cp-nickname');
}

// --- 2. IDE LIVE PREVIEW ENGINE ---
window.launchPreview = function(codeBase64) {
    const container = document.getElementById('preview-container');
    const iframe = document.getElementById('live-preview');
    container.style.display = 'block'; // Expand IDE Panel
    
    try {
        const decodedCode = atob(codeBase64); // Decode the code safely
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(decodedCode);
        doc.close();
    } catch(e) {
        console.error("IDE injection error:", e);
    }
};

// --- 3. SMART MESSAGE FORMATTING ---
function formatContent(data) {
    const text = data.text || "";
    
    // Check for Images/Memes
    const isImage = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(text) || text.startsWith('data:image');
    if (isImage) return `<img src="${text}" class="chat-meme" onclick="window.open(this.src)">`;

    // Check for Code Snippets (Detects backticks `code`)
    if (text.includes('```') || text.startsWith('`')) {
        const cleanCode = text.replace(/`/g, '');
        const encoded = btoa(cleanCode); // Safely pass string to HTML attribute
        return `
            <div class="code-snippet-msg">
                <code class="chat-code">${cleanCode}</code>
                <button class="run-btn" onclick="launchPreview('${encoded}')">▶ RUN_PREVIEW</button>
            </div>`;
    }

    return `<span>${text}</span>`;
}

// --- 4. CHAT CORE & AUTO-SCROLL ---
function loadChat(rank) {
    chatWindow.innerHTML = `<div class="message" style="opacity:0.5; border-left: 2px solid var(--accent);">[SESSION] Joined ${currentRoom} as ${rank}</div>`;
    messagesRef = ref(db, 'rooms/' + currentRoom);

    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if(!data) return;

        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<small>[${(data.rank || 'dev').toUpperCase()}]</small> <b style="color:${data.color}">${data.username}</b>: ${formatContent(data)}`;
        
        chatWindow.appendChild(div);
        
        // Auto-Scroll Logic
        const threshold = 150;
        const isAtBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight < threshold;
        if (isAtBottom) chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}

// --- 5. ADMIN & BUBBLE LOGIC ---
clearBtn.onclick = () => {
    const myToken = localStorage.getItem(`leader_${currentRoom}`);
    
    // STRICT ADMIN CHECK
    if (!myToken) {
        return alert("🚫 ACCESS DENIED: Only the Root Creator can wipe history.");
    }
    
    if (confirm("⚠️ WIPE HISTORY: This will clear the console for all users. Proceed?")) {
        set(ref(db, 'rooms/' + currentRoom), null);
        chatWindow.innerHTML = `<div class="message" style="opacity:0.5;">🧹 Console history wiped by Creator.</div>`;
    }
};

function connectToRoom(roomName) {
    if (messagesRef) off(messagesRef);
    currentRoom = roomName;
    const myToken = localStorage.getItem(`leader_${currentRoom}`);
    loadChat(myToken ? "creator" : "dev");
}

// Start system
connectToRoom('global');
roomSelect.onchange = (e) => connectToRoom(e.target.value);

// Send Message logic
chatForm.onsubmit = (e) => {
    e.preventDefault();
    if (!msgInput.value.trim()) return;
    
    push(messagesRef, {
        username: nickInput.value || "Anonymous",
        text: msgInput.value,
        color: userColor.value,
        rank: localStorage.getItem(`leader_${currentRoom}`) ? "creator" : "dev",
        userId: myId,
        timestamp: serverTimestamp()
    });
    msgInput.value = "";
};
function initLeaderboard() {
    onValue(ref(db, 'members'), (snapshot) => {
        if (!leaderboardList || !snapshot.exists()) return;
        leaderboardList.innerHTML = "";
        let rankings = [];
        snapshot.forEach(bubble => {
            rankings.push({ id: bubble.key, count: Object.keys(bubble.val()).length });
        });
        rankings.sort((a, b) => b.count - a.count).slice(0, 5).forEach((item, i) => {
            onValue(ref(db, `bubbles/${item.id}/name`), (snap) => {
                const div = document.createElement('div');
                div.className = 'clan-rank';
                div.innerHTML = `<span>${i==0?'🥇':(i+1)} <b>${snap.val()||item.id}</b></span> <small>${item.count} Devs</small>`;
                leaderboardList.appendChild(div);
            });
        });
    });
}
// Call scrollToBottom() every time a new message is appended to the UI