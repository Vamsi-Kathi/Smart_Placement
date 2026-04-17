import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function testModes() {
  const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-flash-latest', 'gemini-2.5-flash'];
  
  for(let m of models) {
    console.log("Testing:", m);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say hello");
      console.log(`✅ Success for ${m}:`, result.response.text());
      break;
    } catch(err) {
      console.error(`❌ Failed for ${m}:`, err.message);
    }
  }
}

testModes();
