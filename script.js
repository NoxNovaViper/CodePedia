/**
 * CODEPEDIA CORE LOGIC 2026
 * Handles: Snippet Fetching, Search, Clipboard, Info Drawer
 */

// ============================================================
// 1. INFO DRAWER DATA
// ============================================================
const algoInfo = {
    'bubble': {
        title: 'Bubble Sort',
        how: ['Compare each pair of adjacent elements.','If the left is greater than the right, swap them.','Repeat for the entire array — one pass bubbles the largest to the end.','Each pass can skip the last i elements as they are already sorted.'],
        complexity: { time: 'O(n²)', space: 'O(1)', best: 'O(n)', worst: 'O(n²)' },
        whenToUse: 'Only for very small arrays or nearly-sorted data. Never use in production for large datasets.',
        edgeCases: ['Empty array → return as-is.','Single element → already sorted.','Already sorted array → best case O(n) with early exit.','All identical elements → no swaps needed.'],
        errorPoints: ['Forgetting inner loop boundary shrinks each pass → extra comparisons.','Not implementing early-exit flag → misses O(n) best case.'],
    },
    'quick': {
        title: 'Quick Sort',
        how: ['Pick a pivot element (commonly last or random).','Partition: move elements smaller than pivot left, larger right.','Recursively apply Quick Sort to both halves.','Base case: array of 0 or 1 elements is already sorted.'],
        complexity: { time: 'O(n log n)', space: 'O(log n)', best: 'O(n log n)', worst: 'O(n²)' },
        whenToUse: 'General purpose sorting. Fastest in practice for most real-world data. Preferred over Merge Sort when memory is a constraint.',
        edgeCases: ['Already sorted array with last-element pivot → degrades to O(n²).','All identical elements → degrades without 3-way partition.','Single element or empty array → base case.'],
        errorPoints: ['Poor pivot choice on sorted data → worst case O(n²).','Not handling base case → infinite recursion.','Off-by-one in partition index → incorrect sorting.'],
    },
    'merge': {
        title: 'Merge Sort',
        how: ['Divide array in half recursively until each subarray has one element.','Merge pairs by comparing elements and placing smaller one first.','Continue merging until full sorted array is reconstructed.'],
        complexity: { time: 'O(n log n)', space: 'O(n)', best: 'O(n log n)', worst: 'O(n log n)' },
        whenToUse: 'When stability matters. Great for linked lists. Use when guaranteed O(n log n) is required.',
        edgeCases: ['Odd-length arrays → one half larger by one.','Empty or single element → base case.','All elements equal → runs O(n log n) but no swaps.'],
        errorPoints: ['Forgetting to copy subarrays before merging → overwrites data.','Incorrect mid calculation → unbalanced splits.'],
    },
    'bi_s': {
        title: 'Binary Search',
        how: ['Set low = 0, high = last index.','Calculate mid = low + (high - low) / 2.','If arr[mid] == target → found.','If arr[mid] < target → search right half.','If arr[mid] > target → search left half.','Repeat until low > high → not found.'],
        complexity: { time: 'O(log n)', space: 'O(1)', best: 'O(1)', worst: 'O(log n)' },
        whenToUse: 'Only on sorted arrays. Fast lookups in large static datasets.',
        edgeCases: ['Empty array → return -1.','Target smaller than all → high goes below 0.','Target larger than all → low exceeds high.','Duplicates → returns one valid index, not necessarily first.'],
        errorPoints: ['Running on unsorted array → wrong results silently.','Using (low+high)/2 → integer overflow. Use low+(high-low)/2.','Wrong loop condition (< vs <=) → misses single-element subarrays.'],
    },
    'l_search': {
        title: 'Linear Search',
        how: ['Start at index 0.','Compare each element to the target.','Return index on match.','Return -1 if loop ends without match.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'Small arrays or unsorted data where Binary Search is not applicable.',
        edgeCases: ['Empty array → return -1.','Target at index 0 → O(1) best case.','Duplicates → returns first occurrence.'],
        errorPoints: ['Forgetting to return -1 when not found.','Off-by-one in loop bounds → misses last element.'],
    },
    'prime': {
        title: 'Prime Number Check',
        how: ['Numbers ≤ 1 are not prime.','Check divisibility from 2 up to √n.','Any divisor found → not prime.','No divisor found → prime.'],
        complexity: { time: 'O(√n)', space: 'O(1)', best: 'O(1)', worst: 'O(√n)' },
        whenToUse: 'Checking individual numbers. For bulk checking use Sieve of Eratosthenes.',
        edgeCases: ['0 and 1 → not prime.','2 → smallest prime, only even prime.','Negative numbers → not prime.'],
        errorPoints: ['Not handling n ≤ 1.','Checking to n instead of √n → O(n) instead of O(√n).'],
    },
    'fact': {
        title: 'Factorial',
        how: ['Start with result = 1.','Multiply result by every integer from 2 to n.','Return result.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'Combinatorics, permutations, probability calculations.',
        edgeCases: ['0! = 1 by definition.','Negative input → undefined.','Large n → overflows int quickly, use long/BigInteger.'],
        errorPoints: ['Not handling n=0 → returns 0 instead of 1.','Using int for n>12 → overflow.'],
    },
    'gcd': {
        title: 'Greatest Common Divisor',
        how: ['GCD(a,b) = GCD(b, a%b).','Replace a with b, b with a%b.','Repeat until b = 0.','Return a.'],
        complexity: { time: 'O(log min(a,b))', space: 'O(1)', best: 'O(1)', worst: 'O(log min(a,b))' },
        whenToUse: 'Simplifying fractions, finding LCM, cryptography.',
        edgeCases: ['GCD(0,n) = n.','GCD(0,0) = undefined.','Negative numbers → take absolute values.'],
        errorPoints: ['Not handling zero inputs → division by zero.','Negative inputs → negative GCD result.'],
    },
    'lcm': {
        title: 'Least Common Multiple',
        how: ['LCM(a,b) = |a×b| / GCD(a,b).','Calculate GCD first.','Divide one number by GCD before multiplying to avoid overflow.'],
        complexity: { time: 'O(log min(a,b))', space: 'O(1)', best: 'O(1)', worst: 'O(log min(a,b))' },
        whenToUse: 'Common denominators, scheduling, synchronization.',
        edgeCases: ['LCM(0,n) = 0.','LCM(1,n) = n.','Large numbers → overflow risk.'],
        errorPoints: ['Multiplying before dividing → overflow. Use (a/gcd)*b.'],
    },
    'fibo': {
        title: 'Fibonacci Sequence',
        how: ['Start with a=0, b=1.','Each step: new = a+b, shift a=b, b=new.','Repeat n times.','Return a.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'Iterative Fibonacci. Recursive version is O(2^n) — avoid without memoization.',
        edgeCases: ['F(0)=0, F(1)=1.','Negative n → undefined.','Large n → overflow.'],
        errorPoints: ['Recursive without memoization → O(2^n).','Off-by-one in loop → wrong number.'],
    },
    'pow': {
        title: 'Power / Exponentiation',
        how: ['Start result=1.','Multiply result by base, exp times.','For large exp use binary exponentiation O(log n).'],
        complexity: { time: 'O(exp)', space: 'O(1)', best: 'O(1)', worst: 'O(exp)' },
        whenToUse: 'Small exponents: iterative. Large exponents: binary exponentiation O(log n).',
        edgeCases: ['base^0 = 1 always.','0^0 = usually treated as 1 in CS.','Negative exponent → fractional result.'],
        errorPoints: ['Not initializing result=1 → wrong answer.','Negative exponent treated as positive.'],
    },
    'palindrome': {
        title: 'Palindrome Check',
        how: ['Two pointers: i at start, j at end.','Compare chars at i and j.','Mismatch → not palindrome.','Move i forward, j backward.','Pointers meet → palindrome.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'String validation, symmetry checks.',
        edgeCases: ['Empty string → palindrome by convention.','Single char → always palindrome.','Case: "Racecar" fails unless lowercased.'],
        errorPoints: ['Not lowercasing → case mismatch.','Comparing full reversed string → O(n) space.'],
    },
    'rev': {
        title: 'Reverse String',
        how: ['Two pointers: i at start, j at end.','Swap chars at i and j.','Move i forward, j backward.','Stop when pointers meet.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'In-place string reversal. Building block for palindrome check.',
        edgeCases: ['Empty or single char → return as-is.','Unicode/emoji → multi-byte chars may break simple index reversal.'],
        errorPoints: ['Strings immutable in Java/Python → convert to array first.'],
    },
    'ins': {
        title: 'Insert Element',
        how: ['Shift all elements from target index right by one.','Place new element at target index.','Increment array size.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'Inserting at a specific index. Use linked lists if insertions are frequent.',
        edgeCases: ['Insert at 0 → shift entire array.','Insert at end → no shifting.','Array at capacity → resize or reject.'],
        errorPoints: ['Shifting left → overwrites elements.','Not updating size.','Out of bounds index → crash.'],
    },
    'del': {
        title: 'Delete Element',
        how: ['Shift all elements after target index left by one.','Decrement array size.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'Removing by index. Use filter() in high-level languages for cleaner code.',
        edgeCases: ['Delete last → no shifting.','Delete first → shift entire array.','Empty array → nothing to delete.'],
        errorPoints: ['Not decrementing size → ghost element at end.','Shifting wrong direction → corrupts array.'],
    },
    'arr_rev': {
        title: 'Reverse Array',
        how: ['i=0, j=n-1.','Swap arr[i] and arr[j].','Increment i, decrement j.','Stop when i >= j.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'In-place reversal when memory is constrained.',
        edgeCases: ['Empty or single element → return as-is.','Odd length → middle stays.'],
        errorPoints: ['Using i<=j → swaps middle with itself (harmless).','Creating copy → O(n) space.'],
    },
    'max': {
        title: 'Find Maximum',
        how: ['Set max = first element.','Loop remaining elements.','If current > max → update max.','Return max.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'Unsorted arrays. Sorted arrays → just take last element O(1).',
        edgeCases: ['Empty array → throw error or return null.','All negative → still works.','All equal → returns that value.'],
        errorPoints: ['Initializing max=0 → wrong for all-negative arrays.'],
    },
    'min': {
        title: 'Find Minimum',
        how: ['Set min = first element.','Loop remaining elements.','If current < min → update min.','Return min.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'Unsorted arrays. Sorted arrays → just take first element O(1).',
        edgeCases: ['Empty array → throw error or return null.','All positive → still works.','All equal → returns that value.'],
        errorPoints: ['Initializing min=0 → wrong for all-positive arrays.'],
    },
    'r_fact': {
        title: 'Recursive Factorial',
        how: ['Base case: n==0 or n==1 → return 1.','Recursive: return n * factorial(n-1).','Each call adds stack frame until base case.','Stack unwinds multiplying back up.'],
        complexity: { time: 'O(n)', space: 'O(n)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'Learning recursion. For large n use iterative — recursive uses O(n) stack space.',
        edgeCases: ['n=0 → must return 1.','Negative n → no base case → stack overflow.'],
        errorPoints: ['Missing base case → infinite recursion.','Not validating negative input → crash.'],
    },
    'r_fib': {
        title: 'Recursive Fibonacci',
        how: ['Base: F(0)=0, F(1)=1.','Recursive: return F(n-1) + F(n-2).','Creates binary tree of calls.','Same subproblems solved repeatedly.'],
        complexity: { time: 'O(2^n)', space: 'O(n)', best: 'O(2^n)', worst: 'O(2^n)' },
        whenToUse: 'Learning only. Never in production. Use iterative O(n) or memoized version.',
        edgeCases: ['n=0 → 0. n=1 → 1.','Large n → extremely slow and stack overflow.'],
        errorPoints: ['Missing base cases → infinite recursion.','No memoization → recalculates billions of times.'],
    },
    't_hanoi': {
        title: 'Tower of Hanoi',
        how: ['Move top n-1 disks from source to auxiliary.','Move largest disk from source to destination.','Move n-1 disks from auxiliary to destination.','Base: n=1, just move the disk.'],
        complexity: { time: 'O(2^n)', space: 'O(n)', best: 'O(2^n)', worst: 'O(2^n)' },
        whenToUse: 'Classic recursion problem. Minimum moves = 2^n - 1.',
        edgeCases: ['n=1 → single move.','n=0 → do nothing.','Large n → 2^n moves, very slow.'],
        errorPoints: ['Swapping source and auxiliary → wrong order.','Missing base case → infinite recursion.'],
    },
    'stack_push': {
        title: 'Stack Push',
        how: ['Add new element to the top.','Array stack: append to end.','Linked stack: insert at head.','Increment size.'],
        complexity: { time: 'O(1)', space: 'O(1)', best: 'O(1)', worst: 'O(1)' },
        whenToUse: 'LIFO structure. Undo systems, expression parsing, DFS.',
        edgeCases: ['Fixed-size at capacity → overflow error.'],
        errorPoints: ['Not checking capacity in fixed-size stack.','Pushing to wrong end → breaks LIFO.'],
    },
    'stack_pop': {
        title: 'Stack Pop',
        how: ['Check stack not empty.','Store top element.','Remove it.','Decrement size.','Return stored element.'],
        complexity: { time: 'O(1)', space: 'O(1)', best: 'O(1)', worst: 'O(1)' },
        whenToUse: 'Removing most recently added element. Backtracking, undo/redo.',
        edgeCases: ['Empty stack → underflow, return null or throw.','Single element → stack becomes empty.'],
        errorPoints: ['Not checking empty → crash.','Returning before removing → element stays on stack.'],
    },
    'stack_peek': {
        title: 'Stack Peek',
        how: ['Check stack not empty.','Return top element without removing.'],
        complexity: { time: 'O(1)', space: 'O(1)', best: 'O(1)', worst: 'O(1)' },
        whenToUse: 'Inspect top element without modifying stack.',
        edgeCases: ['Empty stack → return null or throw.'],
        errorPoints: ['Confusing peek with pop → accidentally removes element.'],
    },
    'q_en': {
        title: 'Enqueue',
        how: ['Add new element to the back (rear).','Increment size.'],
        complexity: { time: 'O(1)', space: 'O(1)', best: 'O(1)', worst: 'O(1)' },
        whenToUse: 'FIFO structure. BFS, task scheduling, print queues.',
        edgeCases: ['Fixed-size at capacity → overflow.'],
        errorPoints: ['Adding to front instead of back → breaks FIFO.'],
    },
    'q_de': {
        title: 'Dequeue',
        how: ['Check queue not empty.','Store front element.','Remove from front.','Decrement size.','Return element.'],
        complexity: { time: 'O(1)', space: 'O(1)', best: 'O(1)', worst: 'O(1)' },
        whenToUse: 'Removing oldest element. BFS, task processing.',
        edgeCases: ['Empty queue → underflow.','Single element → queue becomes empty.'],
        errorPoints: ['Removing from back instead of front → breaks FIFO.','Not checking empty → crash.'],
    },
    'll_ins': {
        title: 'Linked List Insert',
        how: ['Create new node.','Traverse to target position.','Set new node next to current next.','Set current next to new node.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'Frequent insertions. Head insertion is O(1) — faster than arrays.',
        edgeCases: ['Insert at head → update head pointer.','Empty list → new node becomes head.'],
        errorPoints: ['Not updating head at position 0.','Losing next reference before linking → broken chain.'],
    },
    'll_del': {
        title: 'Linked List Delete',
        how: ['Find node before target.','Set previous next to target next.','Target is now unreferenced → garbage collected.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'Removing nodes. Head deletion is O(1).',
        edgeCases: ['Delete head → update head to head.next.','Empty list → nothing to delete.','Value not found → do nothing or throw.'],
        errorPoints: ['Not updating head when deleting first node.','Traversing past end → null pointer crash.','C/C++: not freeing memory → memory leak.'],
    },
    'll_search': {
        title: 'Linked List Search',
        how: ['Start at head.','Compare value to target.','Match → return index or node.','Move to next.','End reached → return -1.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(1)', worst: 'O(n)' },
        whenToUse: 'No random access — must traverse from head.',
        edgeCases: ['Empty list → -1.','Target at head → O(1).','Duplicates → first occurrence.'],
        errorPoints: ['Empty list null pointer on first access.','Cyclic list → infinite loop without cycle detection.'],
    },
    'll_trav': {
        title: 'Linked List Traverse',
        how: ['Start at head.','Visit current node value.','Move to next.','Stop when null.'],
        complexity: { time: 'O(n)', space: 'O(1)', best: 'O(n)', worst: 'O(n)' },
        whenToUse: 'Visiting all nodes. Foundation of all linked list operations.',
        edgeCases: ['Empty list → nothing to traverse.','Single node → visit once.','Circular list → infinite loop.'],
        errorPoints: ['Not null-checking before accessing value → crash.','Infinite loop on cyclic list.'],
    },
};

// ============================================================
// 2. INFO DRAWER — BUILD & INJECT
// ============================================================
function buildDrawer() {
    if (document.getElementById('info-drawer')) return;
    const drawer = document.createElement('div');
    drawer.id = 'info-drawer';
    drawer.innerHTML = `
        <div id="info-overlay"></div>
        <div id="info-panel">
            <div id="info-header">
                <span id="info-title">Info</span>
                <button id="info-close" onclick="closeDrawer()">✕</button>
            </div>
            <div id="info-body"></div>
        </div>
    `;
    document.body.appendChild(drawer);

    // Inject drawer styles
    const style = document.createElement('style');
    style.textContent = `
        #info-overlay {
            display: none;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        }
        #info-panel {
            position: fixed; top: 0; right: -420px;
            width: 400px; height: 100vh;
            background: #161b22;
            border-left: 1px solid #30363d;
            z-index: 1000;
            overflow-y: auto;
            transition: right 0.3s ease;
            display: flex; flex-direction: column;
        }
        #info-drawer.open #info-overlay { display: block; }
        #info-drawer.open #info-panel { right: 0; }
        #info-header {
            display: flex; justify-content: space-between; align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #30363d;
            background: #0d1117;
            position: sticky; top: 0; z-index: 1;
        }
        #info-title { font-weight: 700; font-size: 1rem; color: #58a6ff; }
        #info-close {
            background: none; border: 1px solid #30363d;
            color: #c9d1d9; border-radius: 4px;
            padding: 2px 8px; cursor: pointer; font-size: 0.85rem;
        }
        #info-close:hover { background: #30363d; }
        #info-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .info-section h4 {
            font-size: 0.8rem; text-transform: uppercase;
            letter-spacing: 0.5px; color: #58a6ff;
            margin-bottom: 10px;
        }
        .info-section ol, .info-section ul {
            padding-left: 18px; display: flex; flex-direction: column; gap: 6px;
        }
        .info-section li { font-size: 0.87rem; color: #c9d1d9; line-height: 1.5; }
        .info-section p { font-size: 0.87rem; color: #c9d1d9; line-height: 1.5; }
        .complexity-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .cx-item {
            background: #0d1117; border: 1px solid #30363d;
            border-radius: 6px; padding: 8px 12px;
            display: flex; flex-direction: column; gap: 2px;
        }
        .cx-item span { font-size: 0.7rem; color: #5a6478; text-transform: uppercase; }
        .cx-item strong { font-size: 0.85rem; color: #3fb950; font-family: 'Courier New', monospace; }
        .info-btn {
            background: none; border: 1px solid #30363d;
            color: #58a6ff; border-radius: 4px;
            padding: 2px 10px; font-size: 0.72rem;
            cursor: pointer; transition: all 0.2s;
            margin-left: 8px;
        }
        .info-btn:hover { background: rgba(88,166,255,0.1); border-color: #58a6ff; }
        @media (max-width: 500px) {
            #info-panel { width: 100vw; right: -100vw; }
        }
    `;
    document.head.appendChild(style);
}

function openDrawer(key) {
    const info = algoInfo[key];
    if (!info) return;
    document.getElementById('info-title').textContent = info.title;
    document.getElementById('info-body').innerHTML = `
        <div class="info-section">
            <h4>⚙️ How it Works</h4>
            <ol>${info.how.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
        <div class="info-section">
            <h4>📊 Complexity</h4>
            <div class="complexity-grid">
                <div class="cx-item"><span>Time</span><strong>${info.complexity.time}</strong></div>
                <div class="cx-item"><span>Space</span><strong>${info.complexity.space}</strong></div>
                <div class="cx-item"><span>Best</span><strong>${info.complexity.best}</strong></div>
                <div class="cx-item"><span>Worst</span><strong>${info.complexity.worst}</strong></div>
            </div>
        </div>
        <div class="info-section">
            <h4>✅ When to Use</h4>
            <p>${info.whenToUse}</p>
        </div>
        <div class="info-section">
            <h4>⚠️ Edge Cases</h4>
            <ul>${info.edgeCases.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
        <div class="info-section">
            <h4>🐛 Common Errors</h4>
            <ul>${info.errorPoints.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
    `;
    document.getElementById('info-drawer').classList.add('open');
    document.getElementById('info-overlay').onclick = closeDrawer;
}

function closeDrawer() {
    document.getElementById('info-drawer').classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

// ============================================================
// 3. SNIPPET LOADER
// ============================================================
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
        const lang = filename.split('-')[1];
        const langMap = { py: 'python', js: 'javascript', cpp: 'cpp', java: 'java', cs: 'csharp', go: 'go' };
        displayBox.className = `code-display language-${langMap[lang] || 'plaintext'}`;
        delete displayBox.dataset.highlighted;
        displayBox.textContent = code;
        hljs.highlightElement(displayBox);
    } catch (err) {
        displayBox.textContent = `// Error: Could not find ${filename}.txt in /snippets/`;
        console.error("Snippet Fetch Error:", err);
    }
}

// ============================================================
// 4. SEARCH
// ============================================================
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

// ============================================================
// 5. COPY TO CLIPBOARD
// ============================================================
async function copyCode(targetId) {
    const code = document.getElementById(targetId).textContent;
    const btn  = document.querySelector(`button[onclick="copyCode('${targetId}')"]`);
    try {
        await navigator.clipboard.writeText(code);
        const orig = btn.innerText;
        btn.innerText = "Copied!";
        btn.style.borderColor = "var(--accent)";
        setTimeout(() => { btn.innerText = orig; btn.style.borderColor = "var(--border)"; }, 2000);
    } catch { btn.innerText = "Error!"; }
}

// ============================================================
// 6. INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    buildDrawer();
    document.querySelectorAll('.tabs').forEach(tabContainer => {
        const firstBtn = tabContainer.querySelector('.tab-btn');
        if (firstBtn) firstBtn.click();
    });
    console.log("CodePedia Core Loaded.");
});

window.openLang   = openLang;
window.copyCode   = copyCode;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;