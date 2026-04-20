// ===== THEME SYSTEM =====

// apply saved theme immediately
function applyTheme() {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "evil") {
        document.body.classList.add("evil");
    } else {
        document.body.classList.remove("evil");
    }
}

// update icon based on theme
function updateThemeIcon() {
    const icon = document.getElementById("theme-icon");
    if (!icon) return;

    if (document.body.classList.contains("evil")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
    } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
    }
}

// toggle theme
function toggleTheme() {
    document.body.classList.toggle("evil");

    if (document.body.classList.contains("evil")) {
        localStorage.setItem("theme", "evil");
    } else {
        localStorage.setItem("theme", "light");
    }

    updateThemeIcon();
}

// initialize safely
document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    updateThemeIcon();

    const btn = document.getElementById("theme-toggle");
    if (btn) {
        btn.addEventListener("click", toggleTheme);
    }
});