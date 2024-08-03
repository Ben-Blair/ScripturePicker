const btnEl = document.getElementById("btn");
const quoteEl = document.getElementById("verse");
const verseEl = document.getElementById("location");
const randomApiURL = "https://labs.bible.org/api/?passage=random&type=json";

const attributes = [
    "love",
    "joy",
    "peace",
    "patience",
    "kindness",
    "goodness",
    "faithfulness",
    "gentleness",
    "self-control",
    "depression",
    "heartbreak",
    "hope",
    "loss",
    "betrayal",
    "comfort"
];

function createToggleButtons() {
    const container = document.getElementById("toggle-container");
    attributes.forEach(attribute => {
        const button = document.createElement("button");
        button.id = attribute;
        button.className = "toggle-button";
        button.textContent = attribute.charAt(0).toUpperCase() + attribute.slice(1);
        
        button.addEventListener("click", () => {
            button.classList.toggle("active");
        });

        container.appendChild(button);
    });
}

function getSelectedThemes() {
    const selectedThemes = [];
    attributes.forEach(attribute => {
        const button = document.getElementById(attribute);
        if (button.classList.contains("active")) {
            selectedThemes.push(attribute);
        }
    });
    return selectedThemes;
}

async function fetchVerseFromTheme(theme) {
    try {
        const response = await fetch(`attributes/${theme}.txt`);
        const text = await response.text();
        const verses = text.split('\n').filter(verse => verse.trim() !== '');
        const randomVerse = verses[Math.floor(Math.random() * verses.length)].trim();
        return randomVerse;
    } catch (error) {
        console.error(`Error fetching verses for theme ${theme}:`, error);
        return null;
    }
}

async function getVerse() {
    btnEl.innerText = "Finding Verse";
    btnEl.disabled = true;
    quoteEl.innerHTML = null;
    verseEl.innerText = null;

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

        let verseContent = '';
        let locations = [];
        let bookName = '';
        let chapter = '';
        let verseStart = '';
        let verseEnd = '';

        data.forEach((verseData, index) => {
            verseContent += `${verseData.text} `;
            if (index === 0) {
                bookName = verseData.bookname;
                chapter = verseData.chapter;
                verseStart = verseData.verse;
            }
            if (index === data.length - 1) {
                verseEnd = verseData.verse;
            }
            locations.push(`${verseData.bookname} ${verseData.chapter}:${verseData.verse}`);
        });

        let verseLocation = '';
        if (verseStart === verseEnd) {
            verseLocation = `${bookName} ${chapter}:${verseStart}`;
        } else {
            verseLocation = `${bookName} ${chapter}:${verseStart}-${verseEnd}`;
        }

        quoteEl.innerHTML = verseContent.trim();
        verseEl.innerText = verseLocation;
    } catch (error) {
        console.error("Error fetching verse from API:", error);
        quoteEl.innerText = "Error fetching verse.";
    }

    btnEl.innerText = "Randomize";
    btnEl.disabled = false;
}

function uncheckAll() {
    attributes.forEach(attribute => {
        const button = document.getElementById(attribute);
        if (button.classList.contains("active")) {
            button.classList.remove("active");
            button.classList.add("fade-out"); // Add class for fade-out effect
        }
    });
    
    // Remove the fade-out class after the transition duration
    setTimeout(() => {
        attributes.forEach(attribute => {
            const button = document.getElementById(attribute);
            button.classList.remove("fade-out");
        });
    }, 500); // 500ms matches the CSS transition duration
}

createToggleButtons();
btnEl.addEventListener("click", getVerse);

const uncheckBtn = document.getElementById("uncheck-btn");
uncheckBtn.addEventListener("click", uncheckAll);

getVerse();