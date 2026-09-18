import re

with open('src/services/videoGeneration.ts', 'r') as f:
    content = f.read()

# Add a try/catch around the script generation so it doesn't fail the whole job on a 429
script_gen_code = """      const scriptResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: scriptPrompt
      });
      
      const visualPrompt = scriptResponse.text || params.idea;"""

fallback_code = """      let visualPrompt = params.idea;
      try {
        const scriptResponse = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: scriptPrompt
        });
        if (scriptResponse.text) {
          visualPrompt = scriptResponse.text;
        }
      } catch (scriptErr: any) {
        console.log('Script enhancement failed (likely quota), falling back to raw prompt.');
        // Fallback to raw prompt if flash model hits quota
        visualPrompt = params.idea;
      }"""

content = content.replace(script_gen_code, fallback_code)

with open('src/services/videoGeneration.ts', 'w') as f:
    f.write(content)
