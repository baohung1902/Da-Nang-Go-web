import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const env = fs.readFileSync(".env", "utf8");
const match = env.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function testModel(modelName) {
  try {
    console.log(`Testing model: ${modelName}`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, how are you?");
    const text = result?.response?.text?.() ?? result?.response?.text ?? "";
    console.log(`Success for ${modelName}:`, text.substring(0, 100));
    return true;
  } catch (err) {
    console.error(`Failed for ${modelName}:`, err.message);
    return false;
  }
}

async function runTests() {
  const models = [
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash"
  ];
  for (const m of models) {
    await testModel(m);
    console.log("-------------------");
  }
}

runTests();
