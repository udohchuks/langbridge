
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

// Manually parse .env.local
function loadEnv() {
    try {
        const envPath = path.resolve(".env.local");
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, "utf-8");
            envContent.split("\n").forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ""); // Remove quotes
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.error("Error reading .env.local", e);
    }
}

loadEnv();

async function verifyGemini() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is missing in .env.local");
        return;
    }

    // Handle comma-separated keys if present (as per googleClient.ts logic)
    const keys = apiKey.split(",").map(k => k.trim()).filter(k => k.length > 0);
    const activeKey = keys[0];

    console.log("✅ GEMINI_API_KEY found (first key length: " + activeKey.length + ")");

    const client = new GoogleGenerativeAI(activeKey);
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Listing available models...");
        // @ts-ignore
        if (client.listModels) {
            // @ts-ignore
            const models = await client.listModels();
            console.log("Available models:");
            // @ts-ignore
            for (const m of models) {
                console.log(`- ${m.name}`);
            }
        } else {
            // Fallback if listModels is not on client directly (it might be on a manager)
            // Actually, in 0.21.0+ it's usually via GoogleGenerativeAI instance? No, usually via a specific manager.
            // Let's try to just use 'gemini-pro' as a fallback test.
            console.log("Attempting 'gemini-pro'...");
            const modelPro = client.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello");
            console.log("✅ gemini-pro Response:", (await resultPro.response).text());
        }

    } catch (error: any) {
        console.error("❌ Gemini API Error:", error.message);
    }
}

verifyGemini();
