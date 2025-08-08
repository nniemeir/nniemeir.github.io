document.addEventListener("DOMContentLoaded", function () {
    const crtFrame = document.querySelector(".crt");
    let topZIndex = 100;

    // Utility: Create a window
    function createWindow({ title, contentHTML, width = "600px", top = "80px", left = "80px" }) {
        const win = document.createElement("div");
        win.className = "window";
        win.style.width = width;
        win.style.top = top;
        win.style.left = left;
        topZIndex = Math.min(topZIndex + 1, 9998);
        win.style.zIndex = topZIndex;

        win.innerHTML = `
            <div class="title-bar">${title}
                <button class="close-btn" title="Close">✖</button>
            </div>
            <div class="content">${contentHTML}</div>
        `;

        crtFrame.appendChild(win);

        // Bring to front
        win.addEventListener("mousedown", () => {
            topZIndex++;
            win.style.zIndex = topZIndex;
        });

        // Close button hides window
        win.querySelector(".close-btn").addEventListener("click", () => {
            win.classList.add("hidden");
        });

        // Make draggable
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

    // Original window setup
    const windowEl = document.querySelector(".window");
    const titleBar = windowEl.querySelector(".title-bar");
    const closeBtn = windowEl.querySelector(".close-btn");

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let currentX = 100;
    let currentY = 100;

    windowEl.addEventListener("mousedown", () => {
        topZIndex++;
        windowEl.style.zIndex = topZIndex;
    });

    titleBar.addEventListener("mousedown", function (e) {
        if (e.target === closeBtn) return;
        isDragging = true;
        offsetX = e.clientX - currentX;
        offsetY = e.clientY - currentY;
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", function (e) {
        if (isDragging) {
            const crtRect = crtFrame.getBoundingClientRect();
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            const windowWidth = windowEl.offsetWidth;
            const windowHeight = windowEl.offsetHeight;

            newX = Math.max(0, Math.min(newX, crtRect.width - windowWidth));
            newY = Math.max(0, Math.min(newY, crtRect.height - windowHeight));

            currentX = newX;
            currentY = newY;

            windowEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        document.body.style.userSelect = "";
    });

    closeBtn.addEventListener("click", function () {
        windowEl.classList.add("hidden");
    });

    // Toggle all windows
    document.getElementById("toggleBtn").addEventListener("click", function () {
        document.querySelectorAll(".window").forEach(win => {
            win.classList.toggle("hidden");
        });
    });

    // File item click opens project window
    document.querySelectorAll(".file-item").forEach(item => {
        const projectDetails = {
            "Cyllenian": "A minimalist HTTPS server with a thorough logging system.",
            "ClowniSH": "A POSIX-like shell implementation that annoys the user by randomly overriding command output and teasing their behavior.",
            "FilmFS": "A FUSE filesystem that logs viewing information to a SQLite database.",
            "Halfway Across": "A text adventure with graphics and sound built in Qt.",
        };

        item.addEventListener("click", function () {
            const projectName = item.querySelector("span").textContent;
            const contentText = projectDetails[projectName] || "No details available.";

            createWindow({
                title: `${projectName}`,
                contentHTML: `
                    <p><strong>${projectName}</strong></p>
                    <p>${contentText}</p>
                `,
                top: "50px",
                left: "50px"
            });
        });
    });

    document.getElementById("blogBtn").addEventListener("click", function () {
        let blogWindow = Array.from(document.querySelectorAll(".window"))
            .find(win => win.querySelector(".title-bar")?.textContent.includes("Blog"));

        if (blogWindow) {
            blogWindow.classList.toggle("hidden");
            topZIndex++;
            blogWindow.style.zIndex = topZIndex;
        } else {
            blogWindow = createWindow({
                title: "Blog",
                contentHTML: `
      <div class="blog-scroll">
    <div class="file-grid">
        <div class="file-item blog-post">
            <img src="assets/blog.png" alt="Post icon">
            <span>LFS</span>
        </div>
    </div>
    </div>
`
                ,
                top: "80px",
                left: "80px"
            });
        }
    });

    document.addEventListener("click", function (e) {
        const blogPost = e.target.closest(".blog-post");
        if (!blogPost) return;

        const postTitle = blogPost.querySelector("span").textContent;
        const fileName = postTitle.toLowerCase().replace(/\s+/g, "-") + ".html";

        fetch(`blog/${fileName}`)
            .then(response => {
                if (!response.ok) throw new Error("HTML file not found" + fileName);
                return response.text();
            })
            .then(htmlContent => {
                createWindow({
                    title: `${postTitle}`,
                    contentHTML: `<div class="post-content">${htmlContent}</div>`,
                    top: "100px",
                    left: "100px"
                });
            })
            .catch(err => {
                createWindow({
                    title: `${postTitle}`,
                    contentHTML: `<p>Error loading post: ${err.message}</p>`,
                    top: "100px",
                    left: "100px"
                });
            });
    });

    document.getElementById("aboutBtn").addEventListener("click", function () {
        let aboutWindow = Array.from(document.querySelectorAll(".window"))
            .find(win => win.querySelector(".title-bar")?.textContent.includes("About Me"));

        if (aboutWindow) {
            aboutWindow.classList.toggle("hidden");
            topZIndex++;
            aboutWindow.style.zIndex = topZIndex;
        } else {
            fetch("about.html")
                .then(response => {
                    if (!response.ok) throw new Error("Could not load about.html");
                    return response.text();
                })
                .then(htmlContent => {
                    createWindow({
                        title: "About Me",
                        contentHTML: `<div class="post-content">${htmlContent}</div>`,
                        top: "120px",
                        left: "120px"
                    });
                })
                .catch(err => {
                    createWindow({
                        title: "About Me",
                        contentHTML: `<p>Error loading About Me: ${err.message}</p>`,
                        top: "120px",
                        left: "120px"
                    });
                });
        }
    });
});