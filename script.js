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