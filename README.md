# 📚 CodePedia 2026
**The Universal Code Encyclopedia for the Big 6 Languages.**

CodePedia is a high-performance, modular web encyclopedia designed for developers to quickly find and compare core algorithms across **Python, JavaScript, C++, Java, C#, and Go.**



## 🚀 Features
* **Multi-Language Tabs:** Seamlessly switch between the "Big 6" languages for any snippet.
* **Live Search:** Filter through categories and algorithms in real-time.
* **Math Visualizer:** Interactive logic tools (like the $O(\sqrt{n})$ Prime Efficiency slider).
* **Zero-Dependency Logic:** Built with pure HTML5, CSS3, and Vanilla JavaScript.
* **GitHub Ready:** Optimized for GitHub Pages with relative path snippet fetching.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (CSS Grid & Flexbox)
* **Logic:** Vanilla JavaScript (ES6+ Async/Fetch API)
* **Styling:** GitHub-inspired Dark Mode (Primer-adjacent aesthetic)

## 📁 Project Structure
```text
├── index.html          # Main portal & Category Grid
├── Math.html           # Mathematics sub-encyclopedia
├── Sorting.html        # Sorting algorithms
├── Strings.html        # String manipulation logic
├── Style.css           # Global theme and layout logic
├── script.js           # Core engine (Search, Fetch, Visualizers)
└── snippets/           # Data folder containing .txt code files
    ├── bubble-py.txt
    ├── fact-js.txt
    └── ...
