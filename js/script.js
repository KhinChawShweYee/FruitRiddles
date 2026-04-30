
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

//function goHome
function goHome() {
    window.location.href = "index.html";
}

//logging out
function logout() {
    localStorage.removeItem('fruitsaga_current_session');
    navigateTo('index.html');
}

//navigation function to be used in navbar on clicking "levels"
function navigateTo(page) {
    window.location.href = page;
}

//user login and regsiter
function authAction(type) {
    const u = document.getElementById(type === 'register' ? 'reg-user' : 'log-user').value.trim();
    const p = document.getElementById(type === 'register' ? 'reg-pass' : 'log-pass').value;
    if (!u || !p) return alert("Fill all fields");
    const key = `fruitsaga_${u}`;

    if (type === 'register') {
        if (localStorage.getItem(key)) return alert("User exists");
        localStorage.setItem(key, JSON.stringify({ name: u, pass: p, unlocked: 1, lives: 5, lastLoss: null }));
        alert("Account created!");
    } else {
        const data = JSON.parse(localStorage.getItem(key));
        if (!data || data.pass !== p) return alert("Invalid credentials");
        localStorage.setItem('fruitsaga_current_session', u);
        // localStorage.removeItem("fruitsaga_guest");
        navigateTo('levels.html');
    }
}

function goToPageBasedOnLogin(loggedInTarget, loggedOutTarget) {
    const currentUser = localStorage.getItem('fruitsaga_current_session');
    if (currentUser) {
        window.location.href = loggedInTarget;
    } else {
        window.location.href = loggedOutTarget;
    }
}

//================setting===============================
const settingsModal = document.querySelector('.settings-Modal');

function openSettings() {
    const modal = document.querySelector('.settings-Modal');
    if (!modal) return;

    loadUserData(); // make sure user is loaded

    const nameEl = document.getElementById("playerName");
    const extraEl = document.getElementById("playerExtra");

    if (!nameEl || !extraEl) return;

    if (!user || user.isGuest) {
        // DEFAULT (not logged in)
        nameEl.textContent = "Player_Name";
        extraEl.textContent = "ID: 4545454";
    }
    else {
        // LOGGED-IN USER
        nameEl.textContent = user.name;
        extraEl.textContent = `Lives: ❤️ ${user.lives}`;
    }

    modal.style.display = 'block';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == settingsModal) {
        closeSettings();
    }
}


//function to edit player's name
function enableEdit() {
    const nameText = document.getElementById("playerName");
    const input = document.getElementById("nameInput");

    if (!nameText || !input) return;

    // Show input, hide text
    input.style.display = "block";
    nameText.style.display = "none";

    // Put current name inside input
    input.value = nameText.textContent;

    input.focus();

    // Save when pressing Enter
    input.onkeydown = function (e) {
        if (e.key === "Enter") {
            saveName();
        }
    };

    // Save when clicking outside
    input.onblur = function () {
        saveName();
    };
}


function saveName() {
    const nameText = document.getElementById("playerName");
    const input = document.getElementById("nameInput");

    if (!nameText || !input || !user) return;

    const newName = input.value.trim();
    if (!newName) return;

    const oldName = user.name;

    // ❗ CHECK IF NAME ALREADY EXISTS
    const existingUser = localStorage.getItem(`fruitsaga_${newName}`);

    if (existingUser && newName !== oldName) {
        alert("Name already exists. Please choose another one.");
        input.value = oldName;
        return;
    }

    // ===== UPDATE UI =====
    nameText.textContent = newName;

    // ===== UPDATE USER OBJECT =====
    user.name = newName;

    if (!user.isGuest) {

        // remove old user
        localStorage.removeItem(`fruitsaga_${oldName}`);

        // save new user
        localStorage.setItem(`fruitsaga_${newName}`, JSON.stringify(user));

        // update current session
        localStorage.setItem('fruitsaga_current_session', newName);

    } else {
        localStorage.setItem("fruitsaga_guest", JSON.stringify(user));
    }

    // ===== SWITCH BACK UI =====
    input.style.display = "none";
    nameText.style.display = "inline";
}
//=================End of setting modal===============================


//======================guest mode handling==========================
function continueAsGuest() {
    const modal = document.getElementById('guest-modal');
    modal.style.display = 'flex';
}

const cancelBtn = document.getElementById('guest-cancel');
const continueBtn = document.getElementById('guest-continue');

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        document.getElementById('guest-modal').style.display = 'none';
    });
}

if (continueBtn) {
    continueBtn.addEventListener('click', () => {
        window.location.href = "levels.html";
    });
}


//play as guest
function playAsGuest() {

    // Check if guest already exists
    let savedGuest = localStorage.getItem("fruitsaga_guest");

    if (savedGuest) {
        user = JSON.parse(savedGuest);
    } else {
        user = {
            name: "Guest",
            unlocked: 1,
            lives: 5,
            lastLoss: null,
            isGuest: true
        };

        localStorage.setItem("fruitsaga_guest", JSON.stringify(user));
    }

    window.location.href = "levels.html";
}
//======================end of guest mode handling===========================

//==============================game system==========================================================

window.addEventListener("DOMContentLoaded", () => {
    loadAudioSettings();
    loadUserData();

    const path = window.location.pathname;

    if (path.includes('levels.html')) {
        renderLevelSelection();
        updateLifeUI();
        setInterval(updateLifeUI, 1000);
    }

    if (path.includes('game.html')) {

        startGame();
    };
}
);

//configuration
const fruits = ['🍎', '🍇', '🍊', '🥝', '🫐', '🍍', '🍒'];
const width = 8;
const REFILL_TIME = 20 * 60 * 1000;

const levels = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    moves: 12 + (i * 2),
    target: { icon: fruits[i % fruits.length], count: 10 + (i * 3) },
    complexity: i < 3 ? 5 : i < 6 ? 6 : 7
}));

let gridSquares = [];
let activeLvl, movesRemaining, targetGoal, targetFruit;

//sounds
const crushSound = new Audio("https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3");
const winSound = new Audio("https://orangefreesounds.com/wp-content/uploads/2019/02/Winning-sound-effect-chimes.mp3");
const loseSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

//load user data
function loadUserData() {
    const loggedInUser = localStorage.getItem('fruitsaga_current_session');

    if (loggedInUser) {
        const savedData = localStorage.getItem(`fruitsaga_${loggedInUser}`);
        user = savedData ? JSON.parse(savedData) : null;
    }
    else if (localStorage.getItem("fruitsaga_guest")) {
        user = JSON.parse(localStorage.getItem("fruitsaga_guest"));
    }
    else {
        user = null;
    }
}

//saving user data
function saveUserData() {
    if (!user) return;

    if (user.isGuest) {
        localStorage.setItem("fruitsaga_guest", JSON.stringify(user));
    } else {
        localStorage.setItem(`fruitsaga_${user.name}`, JSON.stringify(user));
    }
}


//updating life
function updateLifeUI() {
    if (!user) return;
    const livesDisplay = document.getElementById('lives-val');
    const timerDisplay = document.getElementById('timer-text');

    if (user.lives < 5 && user.lastLoss) {
        const diff = Date.now() - user.lastLoss;
        const refill = Math.floor(diff / REFILL_TIME);
        if (refill > 0) {
            user.lives = Math.min(5, user.lives + refill);
            user.lastLoss = user.lives < 5 ? (user.lastLoss + (refill * REFILL_TIME)) : null;
            saveUserData();
        }
    }

    if (livesDisplay) livesDisplay.innerText = user.lives;
    if (timerDisplay) {
        if (user.lives < 5) {
            const nextRefill = user.lastLoss + REFILL_TIME;
            const timeLeft = Math.max(0, nextRefill - Date.now());
            const mins = Math.floor(timeLeft / 60000);
            const secs = Math.floor((timeLeft % 60000) / 1000);
            timerDisplay.innerText = `Next Heart: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
        } else {
            timerDisplay.innerText = "Full Energy";
        }
    }
}

//level selection
function renderLevelSelection() {

    if (!user) return;

    const nodes = document.querySelectorAll(".lvl-node");

    nodes.forEach(node => {
        const levelId = parseInt(node.dataset.level);

        node.classList.remove("locked", "unlocked");

        if (levelId <= user.unlocked) {
            node.classList.add("unlocked");

            node.onclick = () => {
                if (user.lives > 0) {

                    const levelData = levels.find(l => l.id === levelId);
                    localStorage.setItem("active_lvl_data", JSON.stringify(levelData));

                    showStoryBeforeGame();

                } else {
                    alert("No lives left!");
                }
            };

        } else {
            node.classList.add("locked");

            node.onclick = () => {
                alert("Level Locked!");
            };
        }
    });
}

function showStoryBeforeGame() {
    sessionStorage.removeItem("fruitsaga_game_state");
    const storyScreen = document.getElementById("story-screen");
    storyScreen.classList.add("active"); // show story
    setupStory();
}

function skipStory() {
    window.location.href = "game.html";
}

//story panels
let currentStoryPanel = 0;
function setupStory() {
    const wrapper = document.getElementById("story-wrapper");
    let data = JSON.parse(localStorage.getItem('active_lvl_data'));

    if (!data && user) {
        data = levels[user.unlocked - 1];
        localStorage.setItem('active_lvl_data', JSON.stringify(data));
    }

    if (!wrapper || !data) return;

    wrapper.innerHTML = '';
    const panels = [
        { emoji: "🌍", title: `Level ${data.id}`, text: "Starting Mission..." },
        { emoji: data.target.icon, title: "Target", text: `Get ${data.target.count} fruits!` }
    ];
    panels.forEach(p => {
        const div = document.createElement("div");
        div.className = "story-panel";
        div.innerHTML = `<div class="story-emoji">${p.emoji}</div><h2>${p.title}</h2><p>${p.text}</p>`;
        wrapper.appendChild(div);
    });
    currentStoryPanel = 0;
    wrapper.style.transform = `translateX(0)`;
}


function nextStoryPanel() {
    currentStoryPanel++;
    const wrapper = document.getElementById("story-wrapper");

    if (currentStoryPanel < wrapper.children.length) {
        wrapper.style.transform = `translateX(-${currentStoryPanel * 100}vw)`;
    } else {
        window.location.href = "game.html";
    }
}


//to save game on refreshing or reloading
function saveGameState() {
    const state = {
        activeLvl,
        movesRemaining,
        targetGoal,
        targetFruit,
        grid: gridSquares.map(sq => sq.innerText)
    };

    sessionStorage.setItem("fruitsaga_game_state", JSON.stringify(state));
}

//to continue game on refreshing or reloading
function loadGameState() {
    const saved = sessionStorage.getItem("fruitsaga_game_state");
    if (!saved) return null;
    return JSON.parse(saved);
}


//game start
function startGame() {

    const savedState = loadGameState();

    const savedLvl = localStorage.getItem('active_lvl_data');
    if (!savedLvl) return navigateTo('levels.html');

    activeLvl = JSON.parse(savedLvl);

    // game persistence if game already exists on refreshing
    if (savedState) {

        movesRemaining = savedState.movesRemaining;
        targetGoal = savedState.targetGoal;
        targetFruit = savedState.targetFruit;

        updateHUD();
        generateBoard(savedState.grid);

    } else {

        // NEW GAME
        movesRemaining = activeLvl.moves;
        targetGoal = activeLvl.target.count;
        targetFruit = activeLvl.target.icon;

        updateHUD();
        generateBoard();
    }
}

function getLevelFruits() {
    let arr = fruits.slice(0, activeLvl.complexity);
    if (!arr.includes(targetFruit)) arr[arr.length - 1] = targetFruit;
    return arr;
}

function generateBoard(savedGrid = null) {
    const grid = document.getElementById('grid');
    if (!grid) return;
    grid.innerHTML = '';
    gridSquares = [];
    const levelFruits = getLevelFruits();
    for (let i = 0; i < 64; i++) {
        const sq = document.createElement('div');
        sq.className = 'square';
        sq.setAttribute('draggable', true);
        sq.id = i;
        // sq.innerText = levelFruits[Math.floor(Math.random() * levelFruits.length)];
        //game persistence on refreshing
        sq.innerText = savedGrid
            ? savedGrid[i]
            : levelFruits[Math.floor(Math.random() * levelFruits.length)];
        grid.appendChild(sq);
        gridSquares.push(sq);
    }
    removeStartingMatches();
    attachDrag();
}

//to make game is not played automatically at start (generating board)
function removeStartingMatches() {
    let hasMatches = true;
    while (hasMatches) {
        hasMatches = detectMatches(false);
        if (hasMatches) instantGravity();
    }
}

//to fix everything immediately before player starts
function instantGravity() {
    let moved = true;
    while (moved) {
        moved = false;
        for (let i = 0; i < 56; i++) {
            if (gridSquares[i + width].innerText === '' && gridSquares[i].innerText !== '') {
                gridSquares[i + width].innerText = gridSquares[i].innerText;
                gridSquares[i].innerText = '';
                moved = true;
            }
        }
        const levelFruits = getLevelFruits();
        for (let i = 0; i < 8; i++) {
            if (gridSquares[i].innerText === '') {
                gridSquares[i].innerText = levelFruits[Math.floor(Math.random() * levelFruits.length)];
                moved = true;
            }
        }
    }
}

let startId, endId;

let touchStartX = 0;
let touchStartY = 0;


function attachDrag() {

    gridSquares.forEach(square => {

        // ===== PC DRAG EVENTS =====
        square.ondragstart = function () {
            startId = parseInt(this.id);
        };

        square.ondragover = e => e.preventDefault();

        square.ondrop = function () {
            endId = parseInt(this.id);
        };

        square.ondragend = () => {
            handleSwap();
        };


        // ===== MOBILE TOUCH EVENTS =====
        square.addEventListener("touchstart", e => {
            startId = parseInt(square.id);
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        square.addEventListener("touchend", e => {

            let touchEndX = e.changedTouches[0].clientX;
            let touchEndY = e.changedTouches[0].clientY;

            let dx = touchEndX - touchStartX;
            let dy = touchEndY - touchStartY;

            // Detect swipe direction
            if (Math.abs(dx) > Math.abs(dy)) {

                if (dx > 30) endId = startId + 1;      // swipe right
                else if (dx < -30) endId = startId - 1; // swipe left

            } else {

                if (dy > 30) endId = startId + width;      // swipe down
                else if (dy < -30) endId = startId - width; // swipe up

            }

            handleSwap();
        });

    });

}


function handleSwap() {

    const valid = [startId - 1, startId + 1, startId - width, startId + width];

    if (valid.includes(endId)) {

        swap(startId, endId);

        if (!detectMatches(true)) {
            setTimeout(() => swap(startId, endId), 200);
        } else {
            movesRemaining--;
            updateHUD();
            saveGameState();
        }
    }
}

function swap(a, b) {
    let t = gridSquares[a].innerText;
    gridSquares[a].innerText = gridSquares[b].innerText;
    gridSquares[b].innerText = t;
}

//detecting if the fruit matches
function detectMatches(fromPlayer) {
    let matched = false;
    let clear = new Set();
    for (let i = 0; i < 64; i++) {
        let f = gridSquares[i].innerText;
        if (!f) continue;
        if (i % width < width - 2 && gridSquares[i + 1].innerText === f && gridSquares[i + 2].innerText === f) {
            [i, i + 1, i + 2].forEach(x => clear.add(x)); matched = true;
        }
        if (i < 48 && gridSquares[i + width].innerText === f && gridSquares[i + width * 2].innerText === f) {
            [i, i + width, i + width * 2].forEach(x => clear.add(x)); matched = true;
        }
    }
    if (matched) {
        playSound(crushSound);
        clear.forEach(i => {
            if (fromPlayer && gridSquares[i].innerText === targetFruit) targetGoal--;
            gridSquares[i].innerText = '';
        });
        updateHUD();
        setTimeout(applyGravity, 200);
    }
    return matched;
}

//after a move
function applyGravity() {
    let moved = false;
    for (let i = 0; i < 56; i++) {
        if (gridSquares[i + width].innerText === '' && gridSquares[i].innerText !== '') {
            gridSquares[i + width].innerText = gridSquares[i].innerText;
            gridSquares[i].innerText = '';
            moved = true;
        }
    }
    const levelFruits = getLevelFruits();
    for (let i = 0; i < 8; i++) {
        if (gridSquares[i].innerText === '') {
            gridSquares[i].innerText = levelFruits[Math.floor(Math.random() * levelFruits.length)];
            moved = true;
        }
    }
    if (moved) setTimeout(applyGravity, 100);
    else if (!detectMatches(true)) evaluate();

    saveGameState();
}

//win or loase
function evaluate() {
    if (targetGoal <= 0) {
        playSound(winSound);
        setTimeout(() => {
            alert("LEVEL COMPLETE! Congrulations");
            if (activeLvl.id === user.unlocked && user.unlocked < 10) user.unlocked++;
            saveUserData();
            navigateTo('levels.html');
        }, 200);
    } else if (movesRemaining <= 0) {
        loseLifeAndExit("Out of moves!");
    }
}

//losing and saving state
function loseLifeAndExit(msg) {
    playSound(loseSound);
    alert(msg);
    user.lives--;
    if (!user.lastLoss) user.lastLoss = Date.now();
    saveUserData();
    navigateTo('levels.html');
}

function exitLevel() {
    if (confirm("Quit and lose a life?")) {
        loseLifeAndExit("Level Abandoned");
    }
}

//to update moves and goals
function updateHUD() {
    const m = document.getElementById('moves-val');
    const g = document.getElementById('goal-val');
    if (m) m.innerText = movesRemaining;
    if (g) g.innerText = `${targetFruit} x ${Math.max(0, targetGoal)}`;
}


//user profile
function renderProfile() {
    loadUserData();

    const guestBlock = document.getElementById("guest-settings");
    const userBlock = document.getElementById("user-settings");
    const usernameSpan = document.getElementById("settings-username");
    const livesSpan = document.getElementById("settings-lives");
    const musicBtn = document.getElementById("music-btn");
    const bgMusic = document.getElementById("bg-music");

    if (!guestBlock || !userBlock) return;

    if (user) {
        guestBlock.classList.remove("active");
        userBlock.classList.add("active");

        usernameSpan.textContent = user.name;
        livesSpan.textContent = user.lives;

    } else {
        userBlock.classList.remove("active");
        guestBlock.classList.add("active");
    }

    // Update music button text
    if (bgMusic) {
        musicBtn.textContent = bgMusic.paused
            ? "Music: Off"
            : "Music: On";
    }
}


//===============sound and music handling==========================
// Toggle music
function toggleMusic() {
    const music = document.getElementById("bg-music");
    const icon = document.getElementById("music-icon");

    if (!music) return;

    if (music.paused) {
        music.play();
        localStorage.setItem("music", "on");

        if (icon) {
            icon.classList.remove("fa-ban");
            icon.classList.add("fa-music");
        }

    } else {
        music.pause();
        localStorage.setItem("music", "off");

        if (icon) {
            icon.classList.remove("fa-music");
            icon.classList.add("fa-ban");
        }
    }
}

function toggleSound() {
    const icon = document.getElementById("sound-icon");

    let current = localStorage.getItem("sound");

    if (current === "off") {
        localStorage.setItem("sound", "on");

        if (icon) {
            icon.classList.remove("fa-volume-off");
            icon.classList.add("fa-volume-high");
        }

    } else {
        localStorage.setItem("sound", "off");

        if (icon) {
            icon.classList.remove("fa-volume-high");
            icon.classList.add("fa-volume-off");
        }
    }
}

function playSound(sound) {
    const soundSetting = localStorage.getItem("sound");

    if (soundSetting === "off") return;

    sound.currentTime = 0;
    sound.play().catch(() => { });
}

function loadAudioSettings() {
    const music = document.getElementById("bg-music");
    const musicIcon = document.getElementById("music-icon");
    const soundIcon = document.getElementById("sound-icon");

    const musicSetting = localStorage.getItem("music");
    const soundSetting = localStorage.getItem("sound");

    //background music
    if (music) {
        if (musicSetting === "off") {
            music.pause();
        } else {
            music.play().catch(() => { });
        }
    }

    if (musicIcon) {
        musicIcon.classList.remove("fa-music", "fa-ban");

        if (musicSetting === "off") {
            musicIcon.classList.add("fa-ban");
        } else {
            musicIcon.classList.add("fa-music");
        }
    }

    //Sound icon for game win,lose,crush sound
    if (soundIcon) {
        soundIcon.classList.remove("fa-volume-high", "fa-volume-off");

        if (soundSetting === "off") {
            soundIcon.classList.add("fa-volume-off");
        } else {
            soundIcon.classList.add("fa-volume-high");
        }
    }
}

