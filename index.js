const btnEl = document.getElementById("btn");
const quoteEl = document.getElementById("verse");
const verseEl = document.getElementById("location");
const apiURL = "https://labs.bible.org/api/?passage=random&type=json";

const attributes = [
    "Love",
    "Joy",
    "Peace",
    "Patience",
    "Kindness",
    "Goodness",
    "Faithfulness",
    "Gentleness",
    "Self-Control",
    "Depression",
    "Heartbreak",
    "Suicide",
    "Loss",
    "Betrayal"
];

function createCheckboxes() {
    const container = document.getElementById("checkbox-container");
    attributes.forEach(attribute => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = attribute.toLowerCase();
        checkbox.name = attribute.toLowerCase();
        checkbox.value = attribute;
        
        const label = document.createElement("label");
        label.htmlFor = attribute.toLowerCase();
        label.textContent = ` ${attribute}`;
        
        const div = document.createElement("div");
        div.className = 'checkbox-item';
        
        div.appendChild(checkbox);
        div.appendChild(label);
        
        container.appendChild(div);
    });
}

async function getVerse() {
    try {
        btnEl.innerText = "Finding Verse";
        btnEl.disabled = true;
        quoteEl.innerHTML = null;
        verseEl.innerText = null;
        const response = await fetch(apiURL);
        const data = await response.json();

        // Log the entire response to understand its structure
        console.log(data);
        const verseContent = data[0].text;
        const bookname = data[0].bookname;
        const chapter = data[0].chapter;
        const verse = data[0].verse;

        // Display the verse content and location
        quoteEl.innerHTML = verseContent;
        document.getElementById("location").innerText = ` ${bookname} ${chapter}:${verse}`;
        btnEl.innerText = "Find Verse";
        btnEl.disabled = false;
    } catch (error) {
        // Handle errors
        console.error("Error fetching verse:", error);
        quoteEl.innerText = "Error";
        document.getElementById("location").innerText = "";
        btnEl.innerText = "Find Verse";
        btnEl.disabled = false;
    }
}

createCheckboxes();
getVerse();

btnEl.addEventListener("click", getVerse);
