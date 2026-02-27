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

// --- 6. CHAT ENGINE (Firebase) ---
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
    const bubbleList = document.getElementById('bubble-list');
    const createBubbleBtn = document.getElementById('create-bubble');
    const userColor = document.getElementById('user-color');
    
    let currentRoom = 'global';
    let messagesRef;
    let sessionLocked = false;

    // Set Initial Nickname
    nickInput.value = localStorage.getItem('cp-nickname') || "Dev-" + Math.floor(Math.random() * 9999);

    function connectToRoom(roomName) {
        if (messagesRef) off(messagesRef);
        currentRoom = roomName;
        chatWindow.innerHTML = `<div class="message" style="border-left-color: #555;"><span class="msg-text">Joined ${roomName}...</span></div>`;
        messagesRef = ref(db, 'rooms/' + currentRoom);

        onChildAdded(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if(!data) return;
            
            const div = document.createElement('div');
            div.className = 'message';
            const nameStyle = data.color ? `style="color: ${data.color}"` : "";
            div.innerHTML = `<span class="msg-user" ${nameStyle}>${data.username}</span><span class="msg-text">${data.text}</span>`;
            chatWindow.appendChild(div);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    }

    // Handle Sending Messages & Session Locking
    chatForm.onsubmit = (e) => {
        e.preventDefault();
        const nick = nickInput.value.trim();
        const text = msgInput.value.trim();

        if (nick && text) {
            if (!sessionLocked) {
                nickInput.disabled = true;
                userColor.disabled = true;
                localStorage.setItem('cp-nickname', nick);
                sessionLocked = true;
            }

            push(messagesRef, {
                username: nick,
                text: text,
                color: userColor.value,
                timestamp: serverTimestamp()
            });
            msgInput.value = "";
        }
    };

    // Bubble Creation Logic
    createBubbleBtn.onclick = () => {
        const bubbleName = prompt("Enter a name for your Personal Bubble:");
        if (bubbleName) {
            const cleanKey = bubbleName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
            set(ref(db, 'bubbles/' + cleanKey), { name: bubbleName });
        }
    };

    // Listen for Bubbles (Global list)
    onChildAdded(ref(db, 'bubbles'), (snapshot) => {
        const bubble = snapshot.val();
        const option = document.createElement('option');
        option.value = snapshot.key;
        option.innerText = "🫧 " + bubble.name;
        bubbleList.appendChild(option);
    });

    roomSelect.onchange = (e) => connectToRoom(e.target.value);

    // Admin Controls
    if (new URLSearchParams(window.location.search).get('admin') === 'true') {
        document.getElementById('admin-panel').style.display = 'flex';
    }
    clearBtn.onclick = () => {
        if(confirm("Clear history for this room?")) set(messagesRef, null).then(() => location.reload());
    };

    connectToRoom('global');
}
// --- 6. CODEPEDIA DEV ENGINE (Bubbles, Code Snips & Leaderboard) ---
if (document.getElementById('chat-window')) {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
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

    let currentRoom = 'global';
    let messagesRef;
    let myId = localStorage.getItem('cp-userid') || "dev-" + Math.random().toString(36).substring(7);
    localStorage.setItem('cp-userid', myId);

    // --- 1. CODE FORMATTING FUNCTION ---
    function formatCode(text) {
        // Detects `text` and wraps it in a styled code tag
        return text.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');
    }

    // --- 2. LEADERBOARD SYSTEM ---
    function updateLeaderboard() {
        onValue(ref(db, 'members'), (snapshot) => {
            if (!leaderboardList) return;
            leaderboardList.innerHTML = "";
            let rankings = [];

            snapshot.forEach((room) => {
                const memberCount = Object.keys(room.val()).length;
                onValue(ref(db, `bubbles/${room.key}/name`), (nameSnap) => {
                    rankings.push({ name: nameSnap.val() || room.key, count: memberCount });
                });
            });

            setTimeout(() => {
                rankings.sort((a, b) => b.count - a.count);
                rankings.slice(0, 5).forEach((item, i) => {
                    const div = document.createElement('div');
                    div.className = `clan-rank ${i === 0 ? 'top-clan-glow' : ''}`;
                    div.innerHTML = `<span>${i==0?'🥇':i==1?'🥈':i==2?'🥉':'💻'} ${item.name}</span> <b>${item.count} Members</b>`;
                    leaderboardList.appendChild(div);
                });
            }, 200);
        });
    }

    // --- 3. ROOM CONNECTION LOGIC ---
    function connectToRoom(roomName) {
        if (messagesRef) off(messagesRef);
        currentRoom = roomName;
        
        joinBar.style.display = 'none';
        chatForm.style.display = 'flex';
        reqPanel.style.display = 'none';
        chatWindow.innerHTML = "";

        const roomMetaRef = ref(db, `bubbles/${currentRoom}`);
        onValue(roomMetaRef, (snap) => {
            const roomData = snap.val();
            const isPrivate = roomData?.private || false;
            const myToken = localStorage.getItem(`leader_${currentRoom}`);

            onValue(ref(db, `blacklist/${currentRoom}/${myId}`), (banSnap) => {
                if (banSnap.exists()) {
                    chatWindow.innerHTML = `<div class="message" style="color:#ff4444;">🚫 Access Denied: You are blacklisted from this bubble.</div>`;
                    chatForm.style.display = 'none';
                    return;
                }

                if (isPrivate && !myToken) {
                    onValue(ref(db, `members/${currentRoom}/${myId}`), (memSnap) => {
                        if (memSnap.exists()) loadChat(myToken ? "leader" : "member");
                        else {
                            chatWindow.innerHTML = `<div class="message">🔒 This is a private dev bubble.</div>`;
                            chatForm.style.display = 'none';
                            joinBar.style.display = 'block';
                        }
                    });
                } else {
                    loadChat(myToken ? "leader" : "member");
                }
            });
        });
    }

    function loadChat(rank) {
        chatWindow.innerHTML = `<div class="message" style="border-left: 4px solid var(--accent); opacity:0.7;">Connected to ${currentRoom} as ${rank.toUpperCase()}</div>`;
        messagesRef = ref(db, 'rooms/' + currentRoom);
        
        if (rank === "leader") {
            reqPanel.style.display = 'block';
            listenForRequests();
        }

        onChildAdded(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const div = document.createElement('div');
            div.className = 'message';
            const nameStyle = `style="color:${data.color}"`;
            
            // Apply code formatting to the text
            const cleanText = formatCode(data.text);
            
            div.innerHTML = `<small>[${data.rank.toUpperCase()}]</small> <b ${nameStyle}>${data.username}</b>: <span>${cleanText}</span>`;
            chatWindow.appendChild(div);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
    }

    // --- 4. MESSAGE & COMMAND SUBMISSION ---
    chatForm.onsubmit = (e) => {
        e.preventDefault();
        const text = msgInput.value.trim();
        const myToken = localStorage.getItem(`leader_${currentRoom}`);

        if (text.startsWith('/') && myToken) {
            const [cmd, targetName, targetId] = text.split(' ');
            if (cmd === '/kick' && targetId) {
                set(ref(db, `blacklist/${currentRoom}/${targetId}`), true);
                remove(ref(db, `members/${currentRoom}/${targetId}`));
                push(messagesRef, { username: "SYSTEM", text: `👢 ${targetName} kicked from bubble.`, color: "#ff4444", rank: "system" });
            }
            msgInput.value = ""; return;
        }

        push(messagesRef, {
            username: nickInput.value,
            text: text,
            color: userColor.value,
            rank: myToken ? "leader" : "member",
            userId: myId,
            timestamp: serverTimestamp()
        });
        msgInput.value = "";
    }

    // --- 5. INITIALIZATION & UTILS ---
    askJoinBtn.onclick = () => {
        set(ref(db, `requests/${currentRoom}/${myId}`), { name: nickInput.value, id: myId });
        alert("Request sent to bubble leader!");
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
                div.innerHTML = `<span>${req.name}</span> <button class="copy-btn" onclick="acceptMember('${req.id}', '${req.name}')">Accept</button>`;
                reqList.appendChild(div);
            });
        });
    }

    createBubbleBtn.onclick = () => {
        const name = prompt("Enter Bubble Name:");
        if (name) {
            const isPrivate = confirm("Make this bubble Private (Invite Only)?");
            const key = name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
            const token = Math.random().toString(36).substring(2);
            set(ref(db, 'bubbles/' + key), { name: name, private: isPrivate, leaderToken: token });
            localStorage.setItem(`leader_${key}`, token);
            alert("Bubble Created!");
        }
    };

    onChildAdded(ref(db, 'bubbles'), (snap) => {
        const b = snap.val();
        const option = document.createElement('option');
        option.value = snap.key;
        option.innerHTML = `🫧 ${b.name} ${b.private ? '🔒' : ''}`;
        document.getElementById('bubble-list').appendChild(option);
    });

    updateLeaderboard();
    connectToRoom('global');
    roomSelect.onchange = (e) => connectToRoom(e.target.value);
}
// --- 7. CLAN LEADERBOARD LOGIC ---
function initLeaderboard(db) {
    const leaderboardList = document.getElementById('leaderboard-list');
    
    onValue(ref(db, 'members'), (snapshot) => {
        if (!snapshot.exists()) return;
        
        let rankings = [];
        snapshot.forEach((clan) => {
            const memberCount = Object.keys(clan.val()).length;
            rankings.push({ id: clan.key, count: memberCount });
        });

        // Sort by member count (Highest first)
        rankings.sort((a, b) => b.count - a.count);

        leaderboardList.innerHTML = "";
        rankings.slice(0, 5).forEach((clan, index) => {
            // Get clan name from bubbles node
            onValue(ref(db, `bubbles/${clan.id}/name`), (nameSnap) => {
                const clanName = nameSnap.val() || clan.id;
                const div = document.createElement('div');
                div.className = `clan-rank ${index === 0 ? 'top-clan-glow' : ''}`;
                
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "⚔️";
                
                div.innerHTML = `
                    <span>${medal} <b>${clanName}</b></span>
                    <span style="color:var(--accent)">${clan.count} Members</span>
                `;
                leaderboardList.appendChild(div);
            });
        });
    });
}

// Make sure to call initLeaderboard(db) inside your chat window check!