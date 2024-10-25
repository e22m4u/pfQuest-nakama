const fs = require('fs');

function hasCyrillicCharacters(text) {
    return /[а-яА-ЯёЁ]/.test(text);
}

function parseFirstFile(content) {
    const entries = {};
    const lines = content.split('\n');

    for (const line of lines) {
        const match = line.match(/\[(\d+)\]\s*=\s*"(.*?)"/);
        if (match) {
            entries[match[1]] = match[2];
        }
    }

    return entries;
}

function parseSecondFile(content) {
    const entries = {};
    const lines = content.split('\n');

    for (const line of lines) {
        // Updated regex pattern to match the new format
        const match = line.match(/\[(\d+)\]\s*=\s*"(.*?)"/);
        if (match && hasCyrillicCharacters(match[2])) {
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

    const lines = firstContent.split('\n');
    const updatedLines = lines.map(line => {
        const match = line.match(/\[(\d+)\]\s*=\s*"(.*?)"/);
        if (match && secondEntries[match[1]]) {
            const index = match[1];
            const oldName = match[2];
            return line.replace(`"${oldName}"`, `"${secondEntries[index]}"`);
        }
        return line;
    });

    return updatedLines.join('\n');
}

// Example usage
const firstFilePath = 'items.lua';
const secondFilePath = 'ruRU.lua';
const result = processFiles(firstFilePath, secondFilePath);

// Write the result to a new file
fs.writeFileSync('items-output.txt', result);
