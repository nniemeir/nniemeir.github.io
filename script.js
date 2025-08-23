document.addEventListener("DOMContentLoaded", function () {
    const crtFrame = document.querySelector(".crt");
    let topZIndex = 100;

    function createWindow({ title, contentHTML, width = "600px", top = "80px", left = "80px", isPost = false, isProject = false, isBlog = false }) {
        const win = document.createElement("div");
        win.className = "window";

        if (isProject) win.dataset.project = "true";

        if (isBlog) {
            win.dataset.blog = "true";
        }

        win.style.width = width;
        win.style.top = top;
        win.style.left = left;
        topZIndex = Math.min(topZIndex + 1, 9998);
        win.style.zIndex = topZIndex;

        if (isPost) {
            win.style.backgroundColor = "#686E81"; // Soft gray
        }

        if (title === "About Me") {
            win.classList.add("manpage-contents");
            win.style.top = "20px";
            win.style.left = "20px";
            win.style.width = "80%";
            win.style.height = "80%";
            win.style.backgroundColor = "#686E81";
            win.style.border = "2px solid black";
        }


        win.innerHTML = `
            <div class="title-bar">${title}
                <button class="close-btn" title="Close">-</button>
            </div>
            <div class="content">${contentHTML}</div>
        `;

        crtFrame.appendChild(win);

        win.addEventListener("mousedown", () => {
            document.querySelectorAll(".window").forEach(w => {
                w.classList.remove("active-window");
            });
            // 2. give it to this one
            win.classList.add("active-window");
            topZIndex++;
            win.style.zIndex = topZIndex;
        });

        win.querySelector(".close-btn").addEventListener("click", () => {
            win.classList.add("hidden");
        });

        const titleBar = win.querySelector(".title-bar");
        let dragX = 0, dragY = 0;
        let dragging = false;

        titleBar.addEventListener("mousedown", function (e) {
            if (e.target.classList.contains("close-btn")) return;
            dragging = true;
            const rect = win.getBoundingClientRect();
            dragX = e.clientX - rect.left;
            dragY = e.clientY - rect.top;
            document.body.style.userSelect = "none";
        });

        document.addEventListener("mousemove", function (e) {
            if (!dragging) return;

            const crtRect = crtFrame.getBoundingClientRect();
            const winWidth = win.offsetWidth;
            const winHeight = win.offsetHeight;

            let x = e.clientX - crtRect.left - dragX;
            let y = e.clientY - crtRect.top - dragY;

            x = Math.max(0, Math.min(x, crtRect.width - winWidth));
            y = Math.max(0, Math.min(y, crtRect.height - winHeight));

            win.style.left = `${x}px`;
            win.style.top = `${y}px`;
        });

        document.addEventListener("mouseup", function () {
            dragging = false;
            document.body.style.userSelect = "";
        });

        return win;
    }

    createWindow({
        title: "Projects",
        contentHTML: `
    <div class="file-grid">
      <div class="file-item">
        <img src="assets/server.png">
        <span>Cyllenian</span>
      </div>
      <div class="file-item">
        <img src="assets/terminal.png">
        <span>ClowniSH</span>
      </div>
      <div class="file-item">
        <img src="assets/video.png">
        <span>FilmFS</span>
      </div>
      <div class="file-item">
        <img src="assets/game.png">
        <span>Halfway Across</span>
      </div>
    </div>
  `,
        top: "80px",
        left: "80px",
        isProject: true
    });

    document.getElementById("projectBtn")?.addEventListener("click", function () {
        document.querySelectorAll(".window[data-project='true']").forEach(win => {
            if (win.dataset.closed === "true") return;
            win.classList.toggle("hidden");
        });
    });

    document.querySelectorAll(".file-item").forEach(item => {
        item.addEventListener("click", function () {
            const projectName = item.querySelector("span").textContent;
            const fileName = projectName.toLowerCase().replace(/\s+/g, "-") + ".html";

            fetch(`projects/${fileName}`)
                .then(response => {
                    if (!response.ok) throw new Error("HTML file not found: " + fileName);
                    return response.text();
                })
                .then(htmlContent => {
                    createWindow({
                        title: `${projectName}`,
                        contentHTML: `<div class="post-content">${htmlContent}</div>`,
                        top: "50px",
                        left: "50px",
                        isProject: true,
                        isPost: true
                    });
                })
                .catch(err => {
                    createWindow({
                        title: `${projectName}`,
                        contentHTML: `<p>Error loading project: ${err.message}</p>`,
                        top: "50px",
                        left: "50px",
                        isProject: true,
                        isPost: true
                    });
                });
        });
    });

    document.getElementById("blogBtn")?.addEventListener("click", function () {
        const blogWindows = document.querySelectorAll(".window[data-blog='true']");
        if (blogWindows.length > 0) {
            blogWindows.forEach(win => {
                if (win.dataset.closed === "true") return;
                win.classList.toggle("hidden");
                delete win.dataset.closed;
            });
            return;
        }

        createWindow({
            title: "Blog",
            contentHTML: `
            <div class="blog-scroll">
                <div class="file-grid">
                 <div class="file-item blog-post">
                        <img src="assets/blog.png" alt="Post icon">
                        <span class="file-label">Journal</span>
                    </div>
                    <div class="file-item blog-post">
                        <img src="assets/blog.png" alt="Post icon">
                        <span class="file-label">NVDA_Fedora</span>
                    </div>
                    <div class="file-item blog-post">
                        <img src="assets/blog.png" alt="Post icon">
                        <span class="file-label">LFS</span>
                    </div>
            </div>
            </div>
        `,
            top: "80px",
            left: "80px",
            isBlog: true
        });
    });

    document.addEventListener("click", function (e) {
        const blogPost = e.target.closest(".blog-post");
        if (!blogPost) return;

        const postTitle = blogPost.querySelector("span").textContent;
        const fileName = postTitle.toLowerCase().replace(/\s+/g, "-") + ".html";

        fetch(`blog/${fileName}`)
            .then(response => {
                if (!response.ok) throw new Error("HTML file not found: " + fileName);
                return response.text();
            })
            .then(htmlContent => {
                createWindow({
                    title: `${postTitle}`,
                    contentHTML: `<div class="post-content">${htmlContent}</div>`,
                    top: "100px",
                    left: "100px",
                    isBlog: true,
                    isPost: true
                });
            })
            .catch(err => {
                createWindow({
                    title: `${postTitle}`,
                    contentHTML: `<p>Error loading post: ${err.message}</p>`,
                    top: "100px",
                    left: "100px",
                    isBlog: true,
                    isPost: true
                });
            });
    });

    document.getElementById("aboutBtn").addEventListener("click", function () {
        let aboutWindow = Array.from(document.querySelectorAll(".window"))
            .find(win => win.querySelector(".title-bar")?.textContent.includes("About Me"));

        if (aboutWindow) {
            if (aboutWindow.classList.contains("hidden")) {
                aboutWindow.classList.remove("hidden");
                delete aboutWindow.dataset.closed;
            } else {
                aboutWindow.classList.add("hidden");
                aboutWindow.dataset.closed = "true";
            }
            topZIndex++;
            aboutWindow.style.zIndex = topZIndex;
            return;
        }

        fetch("about.html")
            .then(response => {
                if (!response.ok) throw new Error("Could not load about.html");
                return response.text();
            })
            .then(htmlContent => {
                createWindow({
                    title: "About Me",
                    contentHTML: `<div class="manpage">${htmlContent}</div>`,
                    top: "120px",
                    left: "120px"
                });
            })
            .catch(err => {
                createWindow({
                    title: "About Me",
                    contentHTML: `<p>Error loading About Me: ${err.message}</p>`
                });
            });
    });
});
