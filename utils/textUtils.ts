/**
 * A unique marker to represent a paragraph break.
 * This allows the UI to reconstruct paragraphs while the playback engine can skip it.
 * Using a visually distinct but non-standard character sequence to avoid collisions with book content.
 */
export const PARAGRAPH_BREAK_MARKER = '§P§';

const splitSingleParagraphIntoSentences = (paragraphText: string): string[] => {
    if (!paragraphText) return [];

    // This logic is preserved from the original implementation to handle abbreviations etc.
    // In a single paragraph, all newlines are treated as spaces.
    const cleanedText = paragraphText
        .replace(/(\r\n|\r|\n)/g, ' ')
        .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '')
        .replace(/\s+/g, ' ');

    // Fix: Explicitly type `potentialSentences` to prevent TypeScript from inferring `never[]` for an empty array.
    const potentialSentences: string[] = cleanedText.match(/[^.!?]+([.!?]|$)/g) || [];
    
    const combinedSentences: string[] = [];
    let tempSentence = '';

    potentialSentences.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart.length === 0) return;

        tempSentence = tempSentence ? `${tempSentence} ${trimmedPart}` : trimmedPart;

        const isShort = tempSentence.split(/\s+/).length < 3;
        const endsWithAbbreviationLikePeriod = trimmedPart.endsWith('.');
        const endsWithDefinitivePunctuation = /[!?]$/.test(trimmedPart);

        if (endsWithDefinitivePunctuation || !isShort || !endsWithAbbreviationLikePeriod) {
            combinedSentences.push(tempSentence);
            tempSentence = '';
        }
    });

    if (tempSentence.trim().length > 0) {
        combinedSentences.push(tempSentence);
    }
    
    return combinedSentences.filter(sentence => /[a-zA-Z]/.test(sentence.trim())).map(s => s.trim());
}

/**
 * Splits a block of text into an array of sentences, preserving paragraph breaks.
 * Paragraphs (indicated by two or more newlines) are separated by a special marker.
 * @param text The input string to split.
 * @returns An array of strings, where each string is a sentence or a paragraph break marker.
 */
export const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];

    // Split text into paragraphs based on two or more newlines.
    const paragraphs = text.split(/(\r\n|\r|\n){2,}/);
    const allSentences: string[] = [];

    paragraphs.forEach((p) => {
        const trimmedParagraph = p.trim();
        if (trimmedParagraph.length > 0) {
            const sentencesInParagraph = splitSingleParagraphIntoSentences(trimmedParagraph);
            if (sentencesInParagraph.length > 0) {
                // Add sentences from the current paragraph.
                allSentences.push(...sentencesInParagraph);
                // Add a marker to signify the end of a paragraph.
                allSentences.push(PARAGRAPH_BREAK_MARKER);
            }
        }
    });

    // Remove the last marker if it exists, as it's not separating two paragraphs.
    if (allSentences.length > 0 && allSentences[allSentences.length - 1] === PARAGRAPH_BREAK_MARKER) {
        allSentences.pop();
    }
    
    return allSentences;
};

/**
 * Counts the number of words in a string.
 * @param text The input string.
 * @returns The number of words.
 */
export const countWords = (text: string): number => {
    if (!text) return 0;
    // Simple split on whitespace. Good enough for an estimation.
    return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Formats a duration in seconds into a HH:MM:SS or MM:SS string.
 * @param totalSeconds The total seconds to format.
 * @returns A formatted time string.
 */
export const formatTime = (totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) {
        return '00:00';
    }
    
    const absoluteSeconds = Math.floor(totalSeconds);

    const hours = Math.floor(absoluteSeconds / 3600);
    const minutes = Math.floor((absoluteSeconds % 3600) / 60);
    const seconds = absoluteSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    
    return `${paddedMinutes}:${paddedSeconds}`;
};