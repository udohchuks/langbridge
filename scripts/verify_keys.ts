
import * as fs from "fs";
import * as path from "path";

function loadEnv() {
    try {
        const envPath = path.resolve(".env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            console.log("Loading .env.local...");
            envContent.split("\n").forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, "");
                    process.env[key] = value;
                }
            });
        } else {
            console.warn("⚠️ .env.local file not found.");
        }
    } catch (e) {
        console.error("Error reading .env.local", e);
    }
}

loadEnv();

const keysToCheck = [
    "GEMINI_API_KEY",
    "COHERE_API_KEY"
];

console.log("--- API Key Verification ---");
let allPresent = true;

keysToCheck.forEach(key => {
    const value = process.env[key];
    if (value && value.length > 0) {
        const masked = value.substring(0, 4) + "..." + value.substring(value.length - 4);
        console.log(`✅ ${key}: Found (${masked})`);
    } else {
        console.error(`❌ ${key}: Missing or empty`);
        allPresent = false;
    }
});

if (allPresent) {
    console.log("\nAll required keys are present.");
} else {
    console.log("\n⚠️ Some keys are missing.");
}
