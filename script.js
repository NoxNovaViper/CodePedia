/**
 * CODEPEDIA CORE LOGIC 2026
 * Part 1: Snippet Fetching & Tab Management
 */

// --- 1. Snippet Loader ---
window.openLang = async function(evt, filename, targetId) {
    const card = evt.currentTarget.closest('.card') || evt.currentTarget.closest('.main-wrapper');
    const displayBox = document.getElementById(targetId);
    
    // UI: Update Tab State
    const tabs = card.querySelectorAll('.tab-btn');
    tabs.forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');

    try {
        displayBox.textContent = `// Loading ${filename}.txt...`;
        
        const response = await fetch(`./snippets/${filename}.txt`);
        if (!response.ok) throw new Error(`File not found: ${filename}.txt`);

        const codeText = await response.text();
        displayBox.textContent = codeText;

        // Refresh MathJax formatting if present
        if (window.MathJax) {
            MathJax.typesetPromise([displayBox]);
        }

    } catch (err) {
        displayBox.textContent = `// Error: Could not load the ${filename} snippet.`;
        console.error("Fetch Error:", err);
    }
}

// --- 2. Optimized Search Logic ---
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('search-box')) {
        const term = e.target.value.toLowerCase();
        // Target specific category and math sections
        const searchTargets = document.querySelectorAll('section, .content-card, .math-section');
        
        searchTargets.forEach(el => {
            const isMatch = el.innerText.toLowerCase().includes(term);
            el.style.display = isMatch ? "" : "none";
            el.style.opacity = isMatch ? "1" : "0";
        });
    }
});

// --- 3. Math Visualizer: Square Root Logic ---
const slider = document.getElementById('mathSlider');
if (slider) {
    slider.oninput = function() {
        const output = document.getElementById('visualizer-output');
        const explanation = document.getElementById('logic-explanation');
        const val = parseInt(this.value);
        const pair = (36 / val).toFixed(1);
        
        output.innerHTML = `Factor Pair: <strong>${val}</strong> × <strong>${pair}</strong>`;
        
        if (val < 6) {
            explanation.innerHTML = `Checking <strong>${val}</strong>: Partner <span style="color:var(--accent)">${pair}</span> is higher than √36.`;
            output.parentElement.style.boxShadow = "0 0 10px rgba(0, 212, 255, 0.1)";
        } else if (val === 6) {
            explanation.innerHTML = `<span style="color:#afff94">Goal Reached (√36):</span> Factors meet at 6×6!`;
            output.parentElement.style.boxShadow = "0 0 30px #afff94";
        } else {
            explanation.innerHTML = `Checking <strong>${val}</strong>: Redundant. Found <span style="color:var(--accent)">${pair}</span> earlier. <br><strong>Logic: \(O(\sqrt{n})\) search complete.</strong>`;
            output.parentElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.1)";
        }
    };
}

// --- 4. Clipboard API ---
window.copyCode = async function(targetId) {
    const displayBox = document.getElementById(targetId);
    const btn = document.querySelector(`button[onclick*="'${targetId}'"]`);
    if (!displayBox || !btn) return;

    try {
        await navigator.clipboard.writeText(displayBox.innerText);
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ Copied";
        btn.classList.add('copy-success');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copy-success');
        }, 1500);
    } catch (err) {
        btn.innerText = "⚠️ Error";
    }
}

/**
 * Part 2: Firebase & Real-time Collaboration
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, onValue, off, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIMbWOjtAyx-YOEqAYfPJ5ul_7M2iARIw",
    authDomain: "codepedia-e2bcb.firebaseapp.com",
    projectId: "codepedia-e2bcb",
    databaseURL: "https://codepedia-e2bcb-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// State Management
let currentRoom = 'global';
let messagesRef;
let myId = localStorage.getItem('cp-userid') || `user-${Math.random().toString(36).substring(7)}`;
localStorage.setItem('cp-userid', myId);

const chatWindow = document.getElementById('chat-window');
const chatGate = document.getElementById('chat-gate');
const gateNickInput = document.getElementById('gate-nick');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');

// --- 5. Room & Session Logic ---
window.switchRoom = function(newRoom) {
    if (messagesRef) off(messagesRef);
    currentRoom = newRoom;
    if (chatWindow) chatWindow.innerHTML = `<div class="system-msg">-- Switched to #${newRoom} --</div>`;
    loadChat();
};

window.joinChat = function() {
    const nick = gateNickInput.value.trim();
    if (nick.length < 2) return;
    
    localStorage.setItem('cp-nickname', nick);
    chatGate.style.opacity = '0';
    
    setTimeout(() => {
        chatGate.style.display = 'none';
        switchRoom('global');
        
        push(ref(db, `rooms/global`), {
            username: "SYSTEM",
            text: `${nick} has joined the chat.`,
            color: "var(--accent)",
            timestamp: serverTimestamp()
        });
    }, 450);
};

// --- 6. Live Preview Engine ---
window.launchPreview = function(codeBase64) {
    const container = document.getElementById('preview-container');
    const iframe = document.getElementById('live-preview');
    if (!container || !iframe) return;

    container.style.display = 'block'; 
    try {
        const decodedCode = decodeURIComponent(escape(atob(codeBase64)));
        const blob = new Blob([`
            <html><body style="background:#0d1117; color:#fff; font-family:sans-serif; padding:20px;">
                ${decodedCode}
            </body></html>
        `], { type: 'text/html' });
        iframe.src = URL.createObjectURL(blob);
    } catch(e) {
        console.error("Preview Error:", e);
    }
};

// --- 7. Chat Formatting & Loading ---
function formatContent(data) {
    const text = data.text || "";
    
    // Image Handling
    if (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(text)) {
        return `<img src="${text}" class="chat-meme" onclick="window.open(this.src)">`;
    }

    // Code Handling
    if (text.includes('```') || text.startsWith('`')) {
        const cleanCode = text.replace(/`/g, '').trim();
        const encoded = btoa(unescape(encodeURIComponent(cleanCode))); 
        return `
            <div class="code-snippet-msg">
                <code class="chat-code">${cleanCode}</code>
                <button class="run-btn" onclick="launchPreview('${encoded}')">Run Preview</button>
            </div>`;
    }

    const sanitizer = document.createElement('div');
    sanitizer.textContent = text;
    return `<span class="msg-body">${sanitizer.innerHTML}</span>`;
}

function loadChat() {
    messagesRef = ref(db, 'rooms/' + currentRoom);
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if(!data || !chatWindow) return;

        const div = document.createElement('div');
        div.className = `message ${data.username === "SYSTEM" ? 'system-log' : ''}`;
        div.innerHTML = `
            <b style="color:${data.color || 'var(--accent)'}">${data.username}</b> 
            <span class="timestamp">${new Date(data.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            <div class="msg-content">${formatContent(data)}</div>
        `;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });
}

// --- 8. Message Dispatch & Leaders ---
if (chatForm) {
    chatForm.onsubmit = (e) => {
        e.preventDefault();
        const rawText = msgInput.value.trim();
        if (!rawText || !messagesRef) return;
        
        push(messagesRef, {
            username: localStorage.getItem('cp-nickname') || "Anonymous",
            text: rawText,
            color: document.getElementById('user-color')?.value || "#00d4ff",
            timestamp: serverTimestamp()
        });
        msgInput.value = "";
    };
}

window.initLeaderboard = function() {
    const leaderboardList = document.getElementById('leaderboard-list');
    onValue(ref(db, 'members'), async (snapshot) => {
        if (!leaderboardList || !snapshot.exists()) return;
        
        let rankings = [];
        snapshot.forEach(snap => rankings.push({ id: snap.key, count: Object.keys(snap.val()).length }));
        rankings.sort((a, b) => b.count - a.count);

        const html = await Promise.all(rankings.slice(0, 5).map(async (item, i) => {
            const nameSnap = await get(ref(db, `bubbles/${item.id}/name`));
            return `<div class="member-item">
                <span>${['🥇','🥈','🥉','🏅','🎖️'][i]} <b>${nameSnap.val() || 'Room'}</b></span>
                <span class="rank-badge">${item.count} Users</span>
            </div>`;
        }));
        leaderboardList.innerHTML = html.join('');
    });
};

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('cp-nickname') && chatGate) {
        chatGate.style.display = 'none';
        switchRoom('global');
    }
    document.querySelectorAll('.tabs').forEach(tc => tc.querySelector('.tab-btn')?.click());
});