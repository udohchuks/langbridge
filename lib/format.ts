/**
 * Formats a title string by:
 * 1. Removing "(Mock)" or "Mock" (case insensitive)
 * 2. Removing underscores and hyphens
 * 3. Handling camelCase or concatenated words by trying to split them (basic heuristic)
 * 4. Capitalizing each word (Title Case)
 */
export function formatTitle(text: string): string {
    if (!text) return "";

    // 1. Remove "Mock" variations
    let cleaned = text.replace(/\(Mock\)/gi, "").replace(/Mock/gi, "").trim();

    // 2. Remove "Practice" prefix if present (common in this app)
    cleaned = cleaned.replace(/^Practice\s+/i, "");

    // 3. Replace underscores and hyphens with spaces
    cleaned = cleaned.replace(/[_-]/g, " ");

    // 4. Handle known concatenated words (specific fixes for this app)
    // Basic heuristic: insert space before capital letters if not at start
    // This turns "GreetingElders" -> "Greeting Elders"
    // And "Greetingelders" -> unfortunately stays, but we can fix specific known ones or rely on spacing
    // Since "Greetingelders" is all lowercase/mixed without internal caps, we might need a dictionary or just accept it if we can't detect it.
    // However, the user specifically mentioned "Greetingelders", suggesting it might have been "Greeting_elders" originally or just a bad data string.

    // Attempt to split camelCase
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');

    // specific fix for "Greetingelders" if it appears literally like that
    if (cleaned.toLowerCase() === "greetingelders") {
        cleaned = "Greeting Elders";
    }
    if (cleaned.toLowerCase() === "familydinner") {
        cleaned = "Family Dinner";
    }

    // 5. Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // 6. Title Case
    return cleaned.split(" ").map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(" ");
}
