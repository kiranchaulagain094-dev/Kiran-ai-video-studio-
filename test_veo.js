import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI();
async function run() {
  console.log("Starting video generation...");
  try {
    const op = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      source: {
        prompt: 'A futuristic city covered in neon lights at night, 8 seconds'
      },
      config: {
        numberOfVideos: 1
      }
    });
    console.log("Operation started: ", op.name);
    
    let currentOp = op;
    while (!currentOp.done) {
      console.log("Waiting 5s...");
      await new Promise(r => setTimeout(r, 5000));
      currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
    }
    
    console.log("Done!");
    console.log(JSON.stringify(currentOp, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
