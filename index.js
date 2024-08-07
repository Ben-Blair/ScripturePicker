const btnEl = document.getElementById("btn");
const quoteEl = document.getElementById("verse");
const verseEl = document.getElementById("location");
const randomApiURL = "https://labs.bible.org/api/?passage=random&type=json";
let attributes = [];

async function fetchAttributes() {
    try {
        const response = await fetch('attributeList.txt');
        const text = await response.text();
        attributes = text.split('\n').map(attr => attr.trim()).filter(attr => attr);
        createToggleButtons();
    } catch (error) {
        console.error('Error fetching attributes:', error);
    }
}

function createToggleButtons() {
    const container = document.getElementById("toggle-container");
    container.innerHTML = '';
    attributes.forEach(attribute => {
        const button = document.createElement("button");
        button.id = attribute;
        button.className = "toggle-button";
        button.textContent = capitalize(attribute);
        button.addEventListener("click", () => button.classList.toggle("active"));
        button.addEventListener("mouseenter", () => button.classList.toggle("hover", button.classList.contains("active")));
        button.addEventListener("mouseleave", () => button.classList.remove("hover"));
        container.appendChild(button);
    });
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSelectedThemes() {
    return attributes.filter(attribute => document.getElementById(attribute).classList.contains("active"));
}

async function fetchVerseFromTheme(theme) {
    try {
        const response = await fetch(`attributes/${theme}.txt`);
        const text = await response.text();
        const verses = text.split('\n').filter(verse => verse.trim());
        return verses[Math.floor(Math.random() * verses.length)].trim();
    } catch (error) {
        console.error(`Error fetching verses for theme ${theme}:`, error);
        return null;
    }
}

async function getVerse() {
    toggleButtonState(true);
    clearContent();

    const selectedThemes = getSelectedThemes();
    let apiURL = randomApiURL;

    if (selectedThemes.length > 0) {
        const randomTheme = selectedThemes[Math.floor(Math.random() * selectedThemes.length)];
        const verseReference = await fetchVerseFromTheme(randomTheme);
        if (verseReference) {
            apiURL = `https://labs.bible.org/api/?passage=${encodeURIComponent(verseReference)}&type=json`;
        }
    }

    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        updateContent(data);
    } catch (error) {
        console.error("Error fetching verse from API:", error);
        quoteEl.innerText = "Error fetching verse.";
    }

    toggleButtonState(false);
}

function toggleButtonState(disabled) {
    btnEl.innerText = disabled ? "Finding Verse" : "Randomize";
    btnEl.disabled = disabled;
}

function clearContent() {
    quoteEl.innerHTML = '';
    verseEl.innerText = '';
}

function updateContent(data) {
    const verseContent = data.map(verseData => verseData.text).join(' ').trim();
    const verseLocation = data.length === 1
        ? `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`
        : `${data[0].bookname} ${data[0].chapter}:${data[0].verse}-${data[data.length - 1].verse}`;
    quoteEl.innerHTML = verseContent;
    verseEl.innerText = verseLocation;
}

function uncheckAll() {
    attributes.forEach(attribute => {
        const button = document.getElementById(attribute);
        if (button.classList.contains("active")) {
            button.classList.remove("active", "fade-out");
        }
    });
}

fetchAttributes();
btnEl.addEventListener("click", getVerse);
document.getElementById("uncheck-btn").addEventListener("click", uncheckAll);
getVerse();