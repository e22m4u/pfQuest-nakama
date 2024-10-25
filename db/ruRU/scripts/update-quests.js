const fs = require('fs');

function hasCyrillicCharacters(text) {
    return /[а-яА-ЯёЁ]/.test(text);
}

function parseFirstFile(content) {
    const entries = {};
    const blocks = content.split(/\[\d+\]/);
    let currentIndex = null;

    content.match(/\[\d+\]/g)?.forEach((id, i) => {
        currentIndex = id.match(/\d+/)[0];
        const block = blocks[i + 1];
        if (block) {
            const titleMatch = block.match(/\["T"\]\s*=\s*"([^"]*)"/);
            if (titleMatch) {
                entries[currentIndex] = titleMatch[1];
            }
        }
    });

    return entries;
}

function parseSecondFile(content) {
    const entries = {};
    const matches = content.matchAll(/\[(\d+)\]\s*=\s*{\s*"([^"]*)",/g);

    for (const match of matches) {
        if (hasCyrillicCharacters(match[2])) {
            entries[match[1]] = match[2];
        }
    }

    return entries;
}

function processFiles(firstFilePath, secondFilePath) {
    const firstContent = fs.readFileSync(firstFilePath, 'utf8');
    const secondContent = fs.readFileSync(secondFilePath, 'utf8');

    const firstEntries = parseFirstFile(firstContent);
    const secondEntries = parseSecondFile(secondContent);

    // Create array of all replacements
    const replacements = [];
    Object.entries(secondEntries).forEach(([index, newValue]) => {
        if (firstEntries[index]) {
            replacements.push({
                index,
                oldValue: firstEntries[index],
                newValue
            });
        }
    });

    // Single pass replacement
    let updatedContent = firstContent;
    replacements.forEach(({index, oldValue, newValue}) => {
        const pattern = `\\[${index}]([\\s\\S]*?)\\["T"\\]\\s*=\\s*"${oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`;
        updatedContent = updatedContent.replace(new RegExp(pattern, 'g'), `[${index}]$1["T"] = "${newValue}"`);
    });

    return updatedContent;
}


// Example usage
const firstFilePath = 'quests.lua';
const secondFilePath = 'ruRU.lua';
const result = processFiles(firstFilePath, secondFilePath);

// Write the result to a new file
fs.writeFileSync('items-quests.txt', result);
