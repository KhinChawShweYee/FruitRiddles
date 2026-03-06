
console.log("hello");


//navbar toggle
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');
if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
        navbarToggle.classList.toggle('active');
        navbarMenu.classList.toggle('active');
    });
}

// Sign in and log in
function toggleAuthForms() {
    const loginArea = document.getElementById('login-area');
    const registerArea = document.getElementById('register-area');

    if (!loginArea || !registerArea) return;

    if (loginArea.style.display === "none") {
        loginArea.style.display = "block";
        registerArea.style.display = "none";
    } else {
        loginArea.style.display = "none";
        registerArea.style.display = "block";
    }
}


function goHome() {
    window.location.href = "index.html";
}


const settingsModal = document.querySelector('.settings-Modal');

function openSettings() {
    settingsModal.style.display = 'block';
    console.log("hi");
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == settingsModal) {
        closeSettings();
    }
}

const toggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("evil"); 

    if (document.body.classList.contains("evil")) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun"); 
       
    } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
        localStorage.setItem("theme", "light");
    }
});



function continueAsGuest() {
    const modal = document.getElementById('guest-modal');
    modal.style.display = 'flex'; 
}

document.getElementById('guest-cancel').addEventListener('click', () => {
    document.getElementById('guest-modal').style.display = 'none';
});


document.getElementById('guest-continue').addEventListener('click', () => {
    window.location.href = "levels.html";
});
