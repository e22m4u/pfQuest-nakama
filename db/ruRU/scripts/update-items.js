const fs = require('fs');

function hasCyrillicCharacters(text) {
    return /[а-яА-ЯёЁ]/.test(text);
}

function parseFirstFile(content) {
    const entries = {};
    const lines = content.split('\n');

    for (const line of lines) {
        const match = line.match(/\[(\d+)\]\s*=\s*"((?:[^"\\]|\\.|\\")*)"/);
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
        const match = line.match(/\[(\d+)\]\s*=\s*"((?:[^"\\]|\\.|\\")*)"/);
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
        const match = line.match(/\[(\d+)\]\s*=\s*"((?:[^"\\]|\\.|\\")*)"/);
        if (match && secondEntries[match[1]]) {
            const index = match[1];
            const oldValue = match[2];
            const newValue = secondEntries[index];
            return line.replace(`"${oldValue}"`, `"${newValue}"`);
        }
        return line;
    });

    return updatedLines.join('\n');
}

const firstFilePath = 'items.lua';
const secondFilePath = 'TBC/lookupItems/ruRU.lua';
const result = processFiles(firstFilePath, secondFilePath);

fs.writeFileSync('items-output.txt', result);
