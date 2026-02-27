/**
 * CODEPEDIA CORE LOGIC 2026
 * Handles: Snippet Fetching, Multi-level Search, Visualizers, and Clipboard
 */

// 1. Snippet Loader (Fetch from /snippets/ folder)
async function openLang(evt, filename, targetId) {
    const card = evt.currentTarget.closest('.card');
    const displayBox = document.getElementById(targetId);
    
    // UI Update: Active Button
    card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');

    try {
        displayBox.textContent = "// Loading snippet...";
        // GitHub Pages likes relative paths like this:
        const response = await fetch(`./snippets/${filename}.txt`);
        
        if (!response.ok) throw new Error("File not found");
        
        const codeText = await response.text();
        displayBox.textContent = codeText;
        
    } catch (err) {
        displayBox.textContent = `// Error: Could not find ${filename}.txt in /snippets/`;
        console.error("Snippet Fetch Error:", err);
    }
}

// 2. Global Search Logic (Handles Sections and Cards)
document.addEventListener('input', function(e) {
    if (e.target.id === 'pageSearch' || e.target.id === 'mainSearch') {
        const term = e.target.value.toLowerCase();
        
        // Filter Sections (used in Category pages)
        document.querySelectorAll('section').forEach(section => {
            const h2 = section.querySelector('h2')?.innerText.toLowerCase() || "";
            const p = section.querySelector('p')?.innerText.toLowerCase() || "";
            section.style.display = (h2.includes(term) || p.includes(term)) ? "block" : "none";
        });

        // Filter standalone Cards (used in Home page)
        document.querySelectorAll('.content-card').forEach(card => {
            const text = card.innerText.toLowerCase();
            // FIX: Use 'flex' instead of 'block' to respect the CSS we wrote
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
            explanation.innerHTML = `Checking <strong>${val}</strong>: Since it's < √36 (6), we find its partner ${pair} above 6.`;
        } else if (val === 6) {
            explanation.innerHTML = `<strong>At √36</strong>: Factors meet at 6 × 6! Checking further is redundant.`;
        } else {
            explanation.innerHTML = `Checking <strong>${val}</strong>: Already found ${pair} earlier. $O(\sqrt{n})$ efficiency!`;
        }
    };
}

// 4. NEW & IMPROVED: Copy to Clipboard (No annoying pop-ups)
async function copyCode(targetId) {
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
window.onload = () => {
    // Auto-click the first tab of every card to load default code
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
    });
    console.log("CodePedia Logic Loaded Successfully!");
};
/* --- CHAT ENGINE --- */
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

// Only initialize if we are on the Chat page
if (document.getElementById('chat-window')) {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const msgInput = document.getElementById('msg-input');
    const roomSelect = document.getElementById('room-select');
    const nickInput = document.getElementById('nickname-input');
    const clearBtn = document.getElementById('clear-chat');

    // 1. Setup User Identity
    nickInput.value = localStorage.getItem('cp-nickname') || "Dev-" + Math.floor(Math.random() * 9999);
    nickInput.onchange = () => localStorage.setItem('cp-nickname', nickInput.value);

    // 2. Room Management
    let currentRoom = 'global';
    let messagesRef;

    function connectToRoom(roomName) {
        if (messagesRef) off(messagesRef); // Stop listening to old room
        currentRoom = roomName;
        chatWindow.innerHTML = `<div class="message"><span class="msg-text">Joined ${roomName}...</span></div>`;
        messagesRef = ref(db, 'rooms/' + currentRoom);

        onChildAdded(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if(!data) return;
            displayMessage(data.username, data.text);
        });
    }

    function displayMessage(user, text) {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<span class="msg-user">${user}</span><span class="msg-text">${text}</span>`;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // 3. Events
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

    // 4. Admin Trick
    if (new URLSearchParams(window.location.search).get('admin') === 'true') {
        document.getElementById('admin-panel').style.display = 'flex';
    }

    clearBtn.onclick = () => {
        if(confirm("Clear this group's history?")) set(messagesRef, null).then(() => location.reload());
    };

    // Initial Connect
    connectToRoom('global');
}