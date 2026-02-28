/**
 * CODEPEDIA CORE LOGIC 2026
 * Part 1: Snippet Fetching & Tab Management
 */

// --- 1. Snippet Loader ---
window.openLang = async function(evt, filename, targetId) {
    const card = evt.currentTarget.closest('.card') || evt.currentTarget.closest('.main-wrapper');
    const displayBox = document.getElementById(targetId);
    
    // UI: Tab Active State
    const tabs = card.querySelectorAll('.tab-btn');
    tabs.forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');

    try {
        displayBox.textContent = "// [SYSTEM] Fetching module: " + filename + "...";
        
        const response = await fetch(`./snippets/${filename}.txt`);
        if (!response.ok) throw new Error(`404: ${filename}.txt missing.`);

        const codeText = await response.text();
        displayBox.textContent = codeText;

        // FIX: Tell MathJax to process the newly injected code
        if (window.MathJax) {
            MathJax.typesetPromise([displayBox]);
        }

    } catch (err) {
        displayBox.textContent = `// CRITICAL_ERROR: Unable to mount ${filename}.txt`;
        console.error("Snippet Fetch Error:", err);
    }
}

// --- 2. Unified Search Logic ---
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('search-box')) {
        const term = e.target.value.toLowerCase();
        // Target specific containers to prevent hiding the whole body
        const searchTargets = document.querySelectorAll('section, .content-card, .math-section');
        
        searchTargets.forEach(el => {
            const isMatch = el.innerText.toLowerCase().includes(term);
            el.style.display = isMatch ? "" : "none";
            el.style.opacity = isMatch ? "1" : "0";
        });
    }
});

// --- 3. Math Visualizer: Square Root Efficiency ---
const slider = document.getElementById('mathSlider');
if (slider) {
    slider.oninput = function() {
        const output = document.getElementById('visualizer-output');
        const explanation = document.getElementById('logic-explanation');
        const val = parseInt(this.value);
        const pair = (36 / val).toFixed(1);
        
        output.innerHTML = `<span style="color:var(--accent)">[COMPUTING]</span> Factor Pair: <strong>${val}</strong> × <strong>${pair}</strong>`;
        
        if (val < 6) {
            explanation.innerHTML = `Scanning <strong>${val}</strong>: Partner <span style="color:var(--accent)">${pair}</span> is > √36. Keep going.`;
            output.parentElement.style.boxShadow = "0 0 10px rgba(88, 166, 255, 0.1)";
        } else if (val === 6) {
            explanation.innerHTML = `<span style="color:#afff94">⚡ ROOT REACHED (√36):</span> Factors intersect at 6×6!`;
            output.parentElement.style.boxShadow = "0 0 30px #afff94";
        } else {
            explanation.innerHTML = `Scanning <strong>${val}</strong>: Redundant. Found <span style="color:var(--accent)">${pair}</span> previously. <br><strong>Algorithm Efficiency: \(O(\sqrt{n})\) reached!</strong>`;
            output.parentElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.1)";
        }
    };
}

// --- 4. High-Performance Clipboard API ---
window.copyCode = async function(targetId) {
    const displayBox = document.getElementById(targetId);
    if (!displayBox) return;

    const code = displayBox.innerText || displayBox.textContent;
    const btn = document.querySelector(`button[onclick*="'${targetId}'"]`);
    
    try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ COPIED";
        btn.classList.add('copy-success'); // Reference this in CSS for the glow
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copy-success');
        }, 1500);
    } catch (err) {
        btn.innerText = "⚠️ ERROR";
    }
}

// --- 5. System Boot Sequence ---
window.addEventListener('DOMContentLoaded', () => {
    // Auto-Load First Tabs
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
    });
});
// --- 6. CODEPEDIA DEV ENGINE: Firebase & Connection Logic ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, onValue, off } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIMbWOjtAyx-YOEqAYfPJ5ul_7M2iARIw",
    authDomain: "codepedia-e2bcb.firebaseapp.com",
    projectId: "codepedia-e2bcb",
    databaseURL: "https://codepedia-e2bcb-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- State Management ---
let currentRoom = 'global';
let messagesRef;
let myId = localStorage.getItem('cp-userid') || "dev-" + Math.random().toString(36).substring(7);
localStorage.setItem('cp-userid', myId);

const chatWindow = document.getElementById('chat-window');
const chatGate = document.getElementById('chat-gate');
const gateNickInput = document.getElementById('gate-nick');

// --- 7. ROOM & GATE LOGIC ---

window.switchRoom = function(newRoom) {
    if (messagesRef) off(messagesRef); // Detach old listeners
    
    currentRoom = newRoom;
    if (chatWindow) {
        chatWindow.innerHTML = `<div class="system-msg">-- Switched to #${newRoom} --</div>`;
    }
    
    messagesRef = ref(db, `messages/${currentRoom}`);
    // Note: Ensure listenForMessages() is defined in your next section
    if (typeof listenForMessages === "function") listenForMessages();
};

window.joinChat = function() {
    const nick = gateNickInput.value.trim();
    if (nick.length < 2) return; // Silent fail or CSS shake effect here
    
    localStorage.setItem('cp-nickname', nick);
    
    // Smooth UI Transition
    chatGate.style.transition = "opacity 0.4s ease, filter 0.4s ease";
    chatGate.style.opacity = '0';
    chatGate.style.filter = 'blur(10px)';
    
    setTimeout(() => {
        chatGate.style.display = 'none';
        switchRoom('global');
        
        // Broadcast arrival
        push(ref(db, `messages/global`), {
            username: "SYSTEM",
            text: `📡 [RECV] Pilot ${nick} has initialized connection.`,
            color: "var(--accent)",
            timestamp: serverTimestamp()
        });
    }, 450);
};

// Auto-Join if session exists
if (localStorage.getItem('cp-nickname') && chatGate) {
    chatGate.style.display = 'none';
    switchRoom('global');
}

// --- 8. IDE LIVE PREVIEW ENGINE (Sandboxed) ---

window.launchPreview = function(codeBase64) {
    const container = document.getElementById('preview-container');
    const iframe = document.getElementById('live-preview');
    
    if (!container || !iframe) return;

    container.style.display = 'block'; 
    container.classList.add('active');
    
    try {
        // Safe decoding for 2026 standards
        const decodedCode = decodeURIComponent(escape(atob(codeBase64)));
        
        const blob = new Blob([`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', sans-serif; padding: 20px; color: #fff; background: #0d1117; }
                    /* Inject local styles for preview consistency */
                </style>
            </head>
            <body>
                ${decodedCode}
                <script>
                    // Prevent preview from redirecting the parent window
                    window.onbeforeunload = function() { return false; };
                <\/script>
            </body>
            </html>
        `], { type: 'text/html' });

        // Using Blob URL is more secure and bypasses some iframe "write" restrictions
        iframe.src = URL.createObjectURL(blob);

        if (window.innerWidth < 1150) {
            container.scrollIntoView({ behavior: 'smooth' });
        }

    } catch(e) {
        console.error("IDE_PREVIEW_ERR:", e);
    }
};
// --- 8. SMART MESSAGE FORMATTING (Refined) ---
function formatContent(data) {
    const text = data.text || "";
    
    // A. Image/Meme Detection
    const isImage = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(text) || text.startsWith('data:image');
    if (isImage) {
        return `
            <div class="meme-container">
                <img src="${text}" class="chat-meme" loading="lazy" onclick="window.open(this.src)" title="Expand View">
            </div>`;
    }

    // B. Code Snippet Detection (Improved)
    if (text.includes('```') || text.startsWith('`')) {
        const cleanCode = text.replace(/`/g, '').trim();
        
        // Use a robust Base64 utility for 2026 compatibility
        const encoded = btoa(unescape(encodeURIComponent(cleanCode))); 
        
        return `
            <div class="code-snippet-msg">
                <div class="code-tag">CODE_SNIPPET</div>
                <code class="chat-code">${cleanCode}</code>
                <button class="run-btn" onclick="launchPreview('${encoded}')">
                    <span class="status-dot"></span> EXECUTE_LIVE
                </button>
            </div>`;
    }

    // C. Default Text (Sanitized via Temp Element)
    const sanitizer = document.createElement('div');
    sanitizer.textContent = text;
    return `<span class="msg-body">${sanitizer.innerHTML}</span>`;
}

// --- 9. CHAT ENGINE (Optimized Listeners) ---
function loadChat(rank) {
    chatWindow.innerHTML = `<div class="message system-init">[AUTH] Identity: ${rank} | Connection: Stable</div>`;
    
    messagesRef = ref(db, 'rooms/' + currentRoom);

    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if(!data) return;

        const div = document.createElement('div');
        div.className = `message ${data.username === "SYSTEM" ? 'system-log' : ''}`;
        
        div.innerHTML = `
            <span class="rank-badge" data-rank="${data.rank || 'dev'}">${(data.rank || 'dev').toUpperCase()}</span> 
            <b class="user-name" style="color:${data.color || 'var(--accent)'}">${data.username}</b> 
            <span class="timestamp">${new Date(data.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <div class="msg-content">${formatContent(data)}</div>
        `;
        
        chatWindow.appendChild(div);
        
        // Intelligent Auto-Scroll
        const isUserAtBottom = chatWindow.scrollHeight - chatWindow.scrollTop <= chatWindow.clientHeight + 200;
        if (isUserAtBottom) {
            chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
        }
    });
}
// --- 11. MESSAGE DISPATCH (Refined with Rate Limiting) ---
let lastMessageTime = 0;

chatForm.onsubmit = (e) => {
    e.preventDefault();
    const now = Date.now();
    const rawText = msgInput.value.trim();
    
    // Anti-Spam: 500ms cooldown
    if (now - lastMessageTime < 500) return; 
    if (!rawText || !messagesRef) return;
    
    const payload = {
        username: nickInput.value || localStorage.getItem('cp-nickname') || "Anonymous",
        text: rawText,
        color: userColor.value || "#58a6ff",
        rank: localStorage.getItem(`leader_${currentRoom}`) ? "creator" : "dev",
        userId: myId,
        timestamp: serverTimestamp()
    };
    
    push(messagesRef, payload);
    
    lastMessageTime = now;
    msgInput.value = "";
    msgInput.focus();
};

// --- 12. LEADERBOARD ENGINE (Parallel Optimized) ---
window.initLeaderboard = function() {
    const membersRef = ref(db, 'members');
    
    onValue(membersRef, async (snapshot) => {
        if (!leaderboardList) return;
        if (!snapshot.exists()) {
            leaderboardList.innerHTML = "<div class='auth-note'>No active clans detected.</div>";
            return;
        }

        let rankings = [];
        snapshot.forEach(clanSnapshot => {
            rankings.push({ 
                id: clanSnapshot.key, 
                count: Object.keys(clanSnapshot.val()).length 
            });
        });

        rankings.sort((a, b) => b.count - a.count);
        const topFive = rankings.slice(0, 5);

        // UI Prep
        leaderboardList.innerHTML = "<div class='system-msg'>[RECALCULATING_RANKS...]</div>";
        
        // PRO TIP: Parallel fetch to prevent loop blocking
        const clanPromises = topFive.map(async (item, index) => {
            const nameSnap = await get(ref(db, `bubbles/${item.id}/name`));
            const clanName = nameSnap.val() || `Sector-${item.id.substring(0, 4)}`;
            const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️'];
            
            return `
                <div class="member-item">
                    <span>
                        <span style="margin-right:8px">${medals[index] || index + 1}</span>
                        <b style="color:var(--accent)">${clanName}</b>
                    </span>
                    <span class="rank-badge">${item.count} DEVS</span>
                </div>
            `;
        });

        const htmlResults = await Promise.all(clanPromises);
        leaderboardList.innerHTML = htmlResults.join('');
    });
};