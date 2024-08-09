const btnEl = document.getElementById("btn");
const quoteEl = document.getElementById("verse");
const verseEl = document.getElementById("location");
const randomApiURL = "https://labs.bible.org/api/?passage=random&type=json";
let attributes = [];
const fishContainer = document.getElementById("fish-container");
const fishImage = 'fish.png'; // Ensure this path is correct
const fishCount = 8; // Adjust the number of fish as needed
const fishSpeedMultiplier = 10; // Speed multiplier to make the fish move 3 times slower
const screenWidthThreshold = 768; // Threshold for smartphones

// Function to create and animate initial fish in random positions
function createInitialFish() {
    if (window.innerWidth < screenWidthThreshold) return; // Do not create fish on smartphones

    for (let i = 0; i < fishCount; i++) {
        const fish = document.createElement("img");
        fish.src = fishImage;
        fish.className = "fish";

        // Randomly decide if the fish is "farther away"
        const isFartherAway = Math.random() > 0.5;
        const randomOpacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        const randomSize = isFartherAway ? Math.random() * 20 + 40 : Math.random() * 20 + 50; // Size between 40-60px or 50-70px

        fish.style.opacity = randomOpacity;
        fish.style.width = `${randomSize}px`;

        fish.style.top = `${Math.random() * 100}vh`;
        fish.style.left = `${Math.random() * 100}vw`; // Start at random position along the x-axis
        fish.style.animationDuration = `${(Math.random() * 10 + 5) * fishSpeedMultiplier}s`; // Random speed, multiplied duration for slower speed

        // Add click event to remove fish when clicked
        fish.addEventListener('click', () => {
            fishContainer.removeChild(fish);
        });

        fishContainer.appendChild(fish);

        // Remove fish after animation ends
        fish.addEventListener('animationend', () => {
            if (fish.parentElement) {
                fishContainer.removeChild(fish);
            }
        });
    }
}

// Function to create and animate fish starting from the left side
function spawnFishFromLeft() {
    if (window.innerWidth < screenWidthThreshold) return; // Do not create fish on smartphones

    const fish = document.createElement("img");
    fish.src = fishImage;
    fish.className = "fish";

    // Randomly decide if the fish is "farther away"
    const isFartherAway = Math.random() > 0.5;
    const randomOpacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
    const randomSize = isFartherAway ? Math.random() * 20 + 40 : Math.random() * 20 + 50; // Size between 40-60px or 50-70px

    fish.style.opacity = randomOpacity;
    fish.style.width = `${randomSize}px`;

    fish.style.top = `${Math.random() * 100}vh`;
    fish.style.left = `-50px`; // Start just off the left side of the screen
    fish.style.animationDuration = `${(Math.random() * 10 + 5) * fishSpeedMultiplier}s`; // Random speed, multiplied duration for slower speed

    // Add click event to remove fish when clicked
    fish.addEventListener('click', () => {
        fishContainer.removeChild(fish);
    });

    fishContainer.appendChild(fish);

    // Remove fish after animation ends
    fish.addEventListener('animationend', () => {
        if (fish.parentElement) {
            fishContainer.removeChild(fish);
        }
    });
}

// Scripture Picker code
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
        : `${data[0].bookname} ${data[0].chapter}:${data[data.length - 1].verse}`;

    quoteEl.innerHTML = verseContent;
    verseEl.innerText = verseLocation;

    // Apply fade-in effect
    quoteEl.classList.add('fade-in');
    verseEl.classList.add('fade-in');

    // Remove the class after the animation is done to allow re-application
    setTimeout(() => {
        quoteEl.classList.remove('fade-in');
        verseEl.classList.remove('fade-in');
    }, 1000); // Match the duration of the fadeIn animation
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

// Initialize fish animation
createInitialFish();
setInterval(spawnFishFromLeft, 5500); // Adjust interval to control how often new fish spawn
