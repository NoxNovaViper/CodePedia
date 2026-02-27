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
        
        // Fetching from the /snippets/ directory
        const response = await fetch(`./snippets/${filename}.txt`);
        
        if (!response.ok) {
            throw new Error(`404: ${filename}.txt missing.`);
        }

        const codeText = await response.text();
        displayBox.textContent = codeText;

        // OPTIONAL: Auto-run if it's a 'web' snippet
        if (filename.includes('web') || filename.includes('index')) {
            console.log("💡 Web snippet detected. Ready for Live Preview.");
        }

    } catch (err) {
        displayBox.textContent = `// CRITICAL_ERROR: Unable to mount ${filename}.txt\n// Check /snippets/ directory path.`;
        console.error("Snippet Fetch Error:", err);
    }
}
// --- 2. Unified Search Logic (Optimized for 2026) ---
document.addEventListener('input', function(e) {
    if (e.target.id === 'pageSearch' || e.target.id === 'mainSearch' || e.target.classList.contains('search-box')) {
        const term = e.target.value.toLowerCase();
        
        // Search across sections and cards
        const searchTargets = document.querySelectorAll('section, .content-card, .card');
        
        searchTargets.forEach(el => {
            const text = el.innerText.toLowerCase();
            const isMatch = text.includes(term);
            
            if (isMatch) {
                el.style.display = ""; // Returns to CSS default (block/flex/grid)
                el.style.opacity = "1";
            } else {
                el.style.display = "none";
                el.style.opacity = "0";
            }
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
        
        // Calculation: Finding factor pairs for 36
        const pair = (36 / val).toFixed(1);
        
        // Update Output with high-tech formatting
        output.innerHTML = `<span style="color:var(--accent)">[COMPUTING]</span> Factor Pair: <strong>${val}</strong> × <strong>${pair}</strong>`;
        
        // Logic breakdown for O(sqrt(n))
        if (val < 6) {
            explanation.innerHTML = `Scanning <strong>${val}</strong>: Partner <span style="color:var(--accent)">${pair}</span> is > √36. Keep going.`;
            output.parentElement.style.boxShadow = "0 0 10px rgba(88, 166, 255, 0.1)";
        } else if (val === 6) {
            explanation.innerHTML = `<span style="color:#afff94">⚡ ROOT REACHED (√36):</span> Factors intersect at 6×6!`;
            // Trigger a visual "Success" pulse defined in our CSS
            output.parentElement.style.boxShadow = "0 0 30px #afff94";
        } else {
            explanation.innerHTML = `Scanning <strong>${val}</strong>: Redundant. Found <span style="color:var(--accent)">${pair}</span> previously. <br><strong>Algorithm Efficiency: $O(\sqrt{n})$ reached!</strong>`;
            output.parentElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.1)";
        }
    };
}
// --- 4. High-Performance Clipboard API ---
window.copyCode = async function(targetId) {
    const displayBox = document.getElementById(targetId);
    if (!displayBox) return;

    const code = displayBox.innerText || displayBox.textContent;
    // Find the button that triggered this specific copy
    const btn = document.querySelector(`button[onclick*="'${targetId}'"]`);
    
    try {
        await navigator.clipboard.writeText(code);
        
        // Visual Feedback Loop
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ COPIED";
        btn.style.background = "var(--accent)";
        btn.style.color = "#0d1117";
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = "transparent";
            btn.style.color = "var(--accent)";
        }, 1500);

    } catch (err) {
        console.error("Clipboard blocked or failed:", err);
        btn.innerText = "⚠️ ERROR";
    }
}

// --- 5. System Boot Sequence (2026 Logic) ---
window.addEventListener('DOMContentLoaded', () => {
    // A. Check for Admin Permissions via URL
    const isLocalAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
    if (isLocalAdmin) {
        document.body.classList.add('admin-mode');
        console.log("🛠️ SYSTEM_STATUS: ADMIN_OVERRIDE_ACTIVE");
    }

    // B. Auto-Load First Tabs
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) {
            // Force initial fetch for the first tab in every card
            firstBtn.click();
        }
    });

    // C. Global Error Catcher for fetch requests
    window.addEventListener('unhandledrejection', event => {
        console.warn('⚠️ Network or Logic Interrupt:', event.reason);
    });
});
// --- 6. CODEPEDIA DEV ENGINE: Firebase & Connection Logic ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp, set, off, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIMbWOjtAyx-YOEqAYfPJ5ul_7M2iARIw",
    authDomain: "codepedia-e2bcb.firebaseapp.com",
    projectId: "codepedia-e2bcb",
    databaseURL: "https://codepedia-e2bcb-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- State Management ---
let currentRoom = 'global';
let messagesRef;
let myId = localStorage.getItem('cp-userid') || "dev-" + Math.random().toString(36).substring(7);
localStorage.setItem('cp-userid', myId);

// --- UI Elements Hook ---
const chatWindow = document.getElementById('chat-window');
const chatGate = document.getElementById('chat-gate');
const gateNickInput = document.getElementById('gate-nick');

/**
 * Switch Room Logic
 * Detaches old listeners and attaches to the new Firebase path
 */
window.switchRoom = function(newRoom) {
    if (messagesRef) off(messagesRef); // Stop listening to old room
    
    currentRoom = newRoom;
    chatWindow.innerHTML = `<div class="system-msg">-- Switched to #${newRoom} --</div>`;
    
    messagesRef = ref(db, `messages/${currentRoom}`);
    listenForMessages();
    updateLeaderboard();
};

/**
 * Gate Logic: Joining the Chat
 */
window.joinChat = function() {
    const nick = gateNickInput.value.trim();
    if (nick.length < 2) {
        alert("Nickname too short, Pilot.");
        return;
    }
    
    localStorage.setItem('cp-nickname', nick);
    chatGate.style.opacity = '0';
    setTimeout(() => chatGate.style.display = 'none', 500);
    
    switchRoom('global'); // Initial room load
};

// Check if user already has a nickname
if (localStorage.getItem('cp-nickname')) {
    chatGate.style.display = 'none';
    switchRoom('global');
}
// --- 7. THE NICKNAME GATE (Session Lock) ---
joinChatBtn.onclick = () => {
    const name = gateNickInput.value.trim();
    if (name.length < 2) return alert("Handle too short, Pilot.");
    
    // Sync inputs and storage
    nickInput.value = name;
    localStorage.setItem('cp-nickname', name);
    
    // Visual Unlock: Fade out the blur gate
    chatGate.style.transition = "opacity 0.5s ease";
    chatGate.style.opacity = "0";
    setTimeout(() => { chatGate.style.display = 'none'; }, 500);

    // Broadcast connection to Firebase
    if (messagesRef) {
        push(messagesRef, {
            username: "SYSTEM",
            text: `📡 [RECV] Connection established: ${name}`,
            color: "var(--accent)",
            rank: "BOOT_LOG",
            timestamp: serverTimestamp()
        });
    }
};

// --- 8. IDE LIVE PREVIEW ENGINE (Sandboxed Injection) ---
window.launchPreview = function(codeBase64) {
    const container = document.getElementById('preview-container');
    const iframe = document.getElementById('live-preview');
    
    // CSS Toggle: Slide open the IDE panel
    container.style.display = 'block'; 
    container.classList.add('active');
    
    try {
        // Robust Decode: Handles UTF-8 characters better than atob alone
        const decodedCode = decodeURIComponent(escape(atob(codeBase64)));
        
        const doc = iframe.contentWindow.document;
        doc.open();
        // Injecting into a clean slate
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head><style>body{font-family:sans-serif; margin:20px; color:#333;}</style></head>
                <body>${decodedCode}</body>
            </html>
        `);
        doc.close();

        // Mobile responsiveness: scroll to preview
        if (window.innerWidth < 1150) {
            container.scrollIntoView({ behavior: 'smooth' });
        }

    } catch(e) {
        console.error("IDE_INJECTION_FAILURE:", e);
        alert("Failed to render snippet: Encoding error.");
    }
};

// --- 8. SMART MESSAGE FORMATTING (Code & Media Detection) ---
function formatContent(data) {
    const text = data.text || "";
    
    // A. Image/Meme Detection (regex for URLs or Base64 images)
    const isImage = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i.test(text) || text.startsWith('data:image');
    if (isImage) {
        return `
            <div class="meme-container">
                <img src="${text}" class="chat-meme" onclick="window.open(this.src)" title="Click to enlarge">
            </div>`;
    }

    // B. Code Snippet Detection (Backticks `code`)
    if (text.includes('```') || text.startsWith('`')) {
        const cleanCode = text.replace(/`/g, '');
        
        // Unicode-safe Base64 encoding for the 'Run' button
        const encoded = btoa(unescape(encodeURIComponent(cleanCode))); 
        
        return `
            <div class="code-snippet-msg">
                <code class="chat-code">${cleanCode}</code>
                <button class="run-btn" onclick="launchPreview('${encoded}')">
                    <span class="status-dot"></span> RUN_PREVIEW
                </button>
            </div>`;
    }

    // C. Default Text (Sanitized)
    const div = document.createElement('div');
    div.textContent = text;
    return `<span>${div.innerHTML}</span>`;
}

// --- 9. CHAT ENGINE: Real-Time Listeners ---
function loadChat(rank) {
    // UI: Clear and notify
    chatWindow.innerHTML = `<div class="message" style="opacity:0.6; border-left: 2px solid var(--accent);">[AUTH] Identity verified: ${rank} level access.</div>`;
    
    // Firebase: Listen to the current room
    messagesRef = ref(db, 'rooms/' + currentRoom);

    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if(!data) return;

        const div = document.createElement('div');
        div.className = 'message';
        
        // Use the rank for the badge and color for the name
        div.innerHTML = `
            <span class="rank-badge">${(data.rank || 'dev')}</span> 
            <b style="color:${data.color || 'var(--accent)'}">${data.username}</b>: 
            ${formatContent(data)}
        `;
        
        chatWindow.appendChild(div);
        
        // Intelligent Auto-Scroll Logic
        const distanceToBottom = chatWindow.scrollHeight - chatWindow.scrollTop - chatWindow.clientHeight;
        const scrollThreshold = 200; // Pixels from bottom
        
        if (distanceToBottom < scrollThreshold) {
            chatWindow.scrollTo({
                top: chatWindow.scrollHeight,
                behavior: 'smooth'
            });
        }
    });
}

// --- 10. ADMIN & ROOM MANAGEMENT ---
clearBtn.onclick = () => {
    const myToken = localStorage.getItem(`leader_${currentRoom}`);
    
    // STRICT ADMIN CHECK: Verify local token exists
    if (!myToken) {
        return alert("🚫 ACCESS_DENIED: Root Creator credentials not found for this sector.");
    }
    
    if (confirm("⚠️ CRITICAL: Wipe all logs for #" + currentRoom + "? This cannot be undone.")) {
        // Firebase 'set to null' deletes the entire node
        set(ref(db, 'rooms/' + currentRoom), null)
            .then(() => {
                chatWindow.innerHTML = `<div class="message" style="color:var(--accent)">[SYSTEM] Log history purged by Authority.</div>`;
            })
            .catch((err) => {
                alert("Wipe failed: Permission denied by Database Rules.");
                console.error(err);
            });
    }
};

/**
 * ROOM SWITCHER: Handles room transitions and permission levels
 */
window.connectToRoom = function(roomName) {
    // 1. Clean up previous listeners
    if (messagesRef) off(messagesRef);
    
    currentRoom = roomName;
    
    // 2. Check Permissions for this specific room
    const myToken = localStorage.getItem(`leader_${currentRoom}`);
    const rank = myToken ? "CREATOR" : "DEV";
    
    // 3. Toggle Admin UI based on token
    if (myToken) {
        document.body.classList.add('admin-mode');
    } else {
        document.body.classList.remove('admin-mode');
    }
    
    // 4. Reboot Chat Stream
    loadChat(rank);
};

// Listen for Room Selector changes
if (roomSelect) {
    roomSelect.onchange = (e) => connectToRoom(e.target.value);
}

/**
 * MESSAGE DISPATCH: Send data to Firebase
 */
chatForm.onsubmit = (e) => {
    e.preventDefault();
    const rawText = msgInput.value.trim();
    
    if (!rawText || !messagesRef) return;
    
    // Prepare Data Packet
    const payload = {
        username: nickInput.value || "Anonymous",
        text: rawText,
        color: userColor.value || "#58a6ff",
        rank: localStorage.getItem(`leader_${currentRoom}`) ? "creator" : "dev",
        userId: myId,
        timestamp: serverTimestamp()
    };
    
    // Push to Firebase
    push(messagesRef, payload);
    
    // UI: Clear and Refocus
    msgInput.value = "";
    msgInput.focus();
};

// INITIAL BOOT: Default to global
connectToRoom('global');
/**
 * LEADERBOARD ENGINE: Ranks clans by member density
 */
window.initLeaderboard = function() {
    const membersRef = ref(db, 'members');
    
    // Listen for any changes in the membership tree
    onValue(membersRef, async (snapshot) => {
        if (!leaderboardList) return;
        
        if (!snapshot.exists()) {
            leaderboardList.innerHTML = "<div class='auth-note'>No active clans detected.</div>";
            return;
        }

        let rankings = [];
        snapshot.forEach(clanSnapshot => {
            // Rank based on number of child nodes (members)
            rankings.push({ 
                id: clanSnapshot.key, 
                count: Object.keys(clanSnapshot.val()).length 
            });
        });

        // Sort by member count (Highest first) and take Top 5
        rankings.sort((a, b) => b.count - a.count);
        const topFive = rankings.slice(0, 5);

        // Clear and rebuild UI
        leaderboardList.innerHTML = "";
        
        for (let [index, item] of topFive.entries()) {
            // Fetch the clan name once
            const nameSnap = await get(ref(db, `bubbles/${item.id}/name`));
            const clanName = nameSnap.val() || `Sector-${item.id.substring(0, 4)}`;

            const div = document.createElement('div');
            div.className = 'member-item'; // Using your sidebar CSS class
            
            const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️'];
            const rankIcon = medals[index] || (index + 1);

            div.innerHTML = `
                <span>
                    <span style="margin-right:8px">${rankIcon}</span>
                    <b style="color:var(--accent)">${clanName}</b>
                </span>
                <span class="rank-badge">${item.count} DEVS</span>
            `;
            
            leaderboardList.appendChild(div);
        }
    });
};

// --- AUTO-SCROLL UTILITY ---
/**
 * Ensures the chat window snaps to the latest log entry
 */
window.scrollToBottom = function() {
    if (!chatWindow) return;
    chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: 'smooth'
    });
};