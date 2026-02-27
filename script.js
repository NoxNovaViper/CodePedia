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
// --- 6. CODEPEDIA DEV ENGINE (Bubbles, Code Snips & Leaderboard) ---
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

if (document.getElementById('chat-window')) {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
    // UI Elements
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const msgInput = document.getElementById('msg-input');
    const roomSelect = document.getElementById('room-select');
    const nickInput = document.getElementById('nickname-input');
    const createBubbleBtn = document.getElementById('create-bubble');
    const userColor = document.getElementById('user-color');
    const reqPanel = document.getElementById('request-panel');
    const reqList = document.getElementById('request-list');
    const joinBar = document.getElementById('join-bar');
    const askJoinBtn = document.getElementById('ask-join-btn');
    const leaderboardList = document.getElementById('leaderboard-list');
    const clearBtn = document.getElementById('clear-chat');
    const uploadBtn = document.getElementById('upload-btn'); 
    const fileInput = document.getElementById('file-input'); 

    // GATE Elements
    const chatGate = document.getElementById('chat-gate');
    const gateNickInput = document.getElementById('gate-nick');
    const joinChatBtn = document.getElementById('join-chat-btn');

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
        chatGate.style.display = 'none'; // Reveal chat
        
        // Notify connection
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

    if(localStorage.getItem('cp-nickname')) {
        gateNickInput.value = localStorage.getItem('cp-nickname');
    }

    function formatCode(text) {
        return text.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');
    }

    // --- BUBBLE LEADERBOARD ---
    function initLeaderboard() {
        onValue(ref(db, 'members'), (snapshot) => {
            if (!leaderboardList || !snapshot.exists()) return;
            leaderboardList.innerHTML = "";
            let rankings = [];
            snapshot.forEach((bubble) => {
                const memberCount = Object.keys(bubble.val()).length;
                rankings.push({ id: bubble.key, count: memberCount });
            });
            rankings.sort((a, b) => b.count - a.count);
            rankings.slice(0, 5).forEach((item, i) => {
                onValue(ref(db, `bubbles/${item.id}/name`), (nameSnap) => {
                    const bubbleName = nameSnap.val() || item.id;
                    const div = document.createElement('div');
                    div.className = `clan-rank ${i === 0 ? 'top-clan-glow' : ''}`;
                    const icon = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🫧";
                    div.innerHTML = `<span>${icon} <b>${bubbleName}</b></span><span style="color:var(--accent)">${item.count} Devs</span>`;
                    leaderboardList.appendChild(div);
                });
            });
        });
    }

    // --- CONNECTION LOGIC ---
    function connectToRoom(roomName) {
        if (messagesRef) off(messagesRef);
        currentRoom = roomName;
        joinBar.style.display = 'none';
        chatForm.style.display = 'flex';
        reqPanel.style.display = 'none';
        chatWindow.innerHTML = "";

        onValue(ref(db, `bubbles/${currentRoom}`), (snap) => {
            const data = snap.val();
            const isPrivate = data?.private || false;
            const myToken = localStorage.getItem(`leader_${currentRoom}`);

            onValue(ref(db, `blacklist/${currentRoom}/${myId}`), (banSnap) => {
                if (banSnap.exists()) {
                    chatWindow.innerHTML = `<div class="message" style="color:#ff4444;">🚫 Access Denied: Blacklisted.</div>`;
                    chatForm.style.display = 'none';
                } else if (isPrivate && !myToken) {
                    onValue(ref(db, `members/${currentRoom}/${myId}`), (memSnap) => {
                        if (memSnap.exists()) loadChat(myToken ? "creator" : "member");
                        else {
                            chatWindow.innerHTML = `<div class="message">🔒 Private Dev Bubble.</div>`;
                            chatForm.style.display = 'none';
                            joinBar.style.display = 'block';
                        }
                    });
                } else {
                    loadChat(myToken ? "creator" : "guest");
                }
            });
        });
    }

    function loadChat(rank) {
        chatWindow.innerHTML = `<div class="message" style="border-left: 4px solid var(--accent); opacity:0.7;">Entered ${currentRoom} as ${rank.toUpperCase()}</div>`;
        messagesRef = ref(db, 'rooms/' + currentRoom);
        
        if (rank === "creator") {
            reqPanel.style.display = 'block';
            listenForRequests();
        }

        onChildAdded(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if(!data) return;
            const div = document.createElement('div');
            div.className = 'message';
            
            const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
            const isBase64 = data.text && data.text.startsWith('data:image');
            
            let content = (imageRegex.test(data.text) || isBase64) 
                ? `<div class="meme-container"><img src="${data.text}" class="chat-meme" onclick="window.open(this.src)"></div>`
                : formatCode(data.text);

            div.innerHTML = `<small>[${(data.rank || 'dev').toUpperCase()}]</small> <b style="color:${data.color}">${data.username}</b>: <span>${content}</span>`;
            chatWindow.appendChild(div);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    }

    // --- INPUT & UPLOADS ---
    if (uploadBtn && fileInput) {
        uploadBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file || file.size > 1000000) return alert("File too large (Max 1MB)");
            const reader = new FileReader();
            reader.onload = (event) => pushMessage(event.target.result);
            reader.readAsDataURL(file);
        };
    }

    function pushMessage(val) {
        const myToken = localStorage.getItem(`leader_${currentRoom}`);
        push(messagesRef, {
            username: nickInput.value || "Anonymous",
            text: val,
            color: userColor.value,
            rank: myToken ? "creator" : "dev",
            userId: myId,
            timestamp: serverTimestamp()
        });
        msgInput.value = "";
    }

    chatForm.onsubmit = (e) => {
        e.preventDefault();
        const text = msgInput.value.trim();
        if (text) pushMessage(text);
    };

    // --- BUBBLE MGMT ---
    askJoinBtn.onclick = () => {
        set(ref(db, `requests/${currentRoom}/${myId}`), { name: nickInput.value, id: myId });
        alert("Request sent!");
    };

    window.acceptMember = (id, name) => {
        set(ref(db, `members/${currentRoom}/${id}`), { name: name });
        remove(ref(db, `requests/${currentRoom}/${id}`));
    };

    function listenForRequests() {
        onValue(ref(db, `requests/${currentRoom}`), (snap) => {
            reqList.innerHTML = "";
            snap.forEach(child => {
                const req = child.val();
                const div = document.createElement('div');
                div.className = 'req-item';
                div.innerHTML = `<span>${req.name}</span> <button class="copy-btn" onclick="acceptMember('${req.id}', '${req.name}')">Add</button>`;
                reqList.appendChild(div);
            });
        });
    }

    createBubbleBtn.onclick = () => {
        const name = prompt("Bubble Name:");
        if (name) {
            const isPrivate = confirm("Invite-Only Bubble?");
            const key = name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
            const token = Math.random().toString(36).substring(2);
            set(ref(db, 'bubbles/' + key), { name: name, private: isPrivate, creatorToken: token });
            localStorage.setItem(`leader_${key}`, token);
            alert("Bubble Initialized!");
        }
    };

    // --- FIXED: ADMIN-ONLY CLEAR HISTORY ---
    clearBtn.onclick = () => {
        const myToken = localStorage.getItem(`leader_${currentRoom}`);
        
        // Strictly check for the presence of the leader token
        if (!myToken) {
            return alert("🚫 Unauthorized: Only the Bubble Creator can wipe console history.");
        }
        
        if (confirm("⚠️ WIPE HISTORY: Are you sure? This cannot be undone.")) {
            set(ref(db, 'rooms/' + currentRoom), null)
                .then(() => {
                    chatWindow.innerHTML = `<div class="message" style="opacity:0.5;">🧹 Console history wiped by Creator.</div>`;
                });
        }
    };

    initLeaderboard();
    connectToRoom('global');
    roomSelect.onchange = (e) => connectToRoom(e.target.value);
}