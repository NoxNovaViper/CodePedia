/**
 * CODEPEDIA CORE LOGIC 2026
 * Handles: Snippet Fetching, Search, Clipboard
 * Page-specific logic (visualizer, chat) lives in extra.js
 */

// 1. Snippet Loader with Highlight.js
async function openLang(evt, filename, targetId) {
    const card = evt.currentTarget.closest('.card');
    const displayBox = document.getElementById(targetId);

    card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    evt.currentTarget.classList.add('active');

    try {
        displayBox.textContent = "// Loading snippet...";
        const response = await fetch(`./snippets/${filename}.txt`);
        if (!response.ok) throw new Error("File not found");
        const code = await response.text();

        // Set class BEFORE content, delete flag, THEN set content, THEN highlight
        const lang = filename.split('-')[1];
        const langMap = {
            py: 'python', js: 'javascript', cpp: 'cpp',
            java: 'java', cs: 'csharp', go: 'go'
        };
        displayBox.className = `code-display language-${langMap[lang] || 'plaintext'}`;
        delete displayBox.dataset.highlighted;
        displayBox.textContent = code;
        hljs.highlightElement(displayBox);

    } catch (err) {
        displayBox.textContent = `// Error: Could not find ${filename}.txt in /snippets/`;
        console.error("Snippet Fetch Error:", err);
    }
}

// 2. Search Logic
document.addEventListener('input', function(e) {
    if (e.target.id === 'pageSearch' || e.target.id === 'mainSearch') {
        const term = e.target.value.toLowerCase();

        document.querySelectorAll('section').forEach(section => {
            const h2 = section.querySelector('h2')?.innerText.toLowerCase() || "";
            const p  = section.querySelector('p')?.innerText.toLowerCase()  || "";
            section.style.display = (h2.includes(term) || p.includes(term)) ? "block" : "none";
        });

        document.querySelectorAll('.content-card').forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(term) ? "flex" : "none";
        });
    }
});

// 3. Copy to Clipboard
async function copyCode(targetId) {
    const code = document.getElementById(targetId).textContent;
    const btn  = document.querySelector(`button[onclick="copyCode('${targetId}')"]`);
    try {
        await navigator.clipboard.writeText(code);
        const orig = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.borderColor = "var(--accent)";
        setTimeout(() => { btn.innerText = orig; btn.style.borderColor = "var(--border)"; }, 2000);
    } catch {
        btn.innerText = "Error!";
    }
}

// 4. Auto-load first tab on every card
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
    });
    console.log("CodePedia Core Loaded.");
});

// Expose to global scope for inline onclick with type="module"
window.openLang = openLang;
window.copyCode = copyCode;