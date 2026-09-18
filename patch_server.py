import re

with open('server.ts', 'r') as f:
    content = f.read()

# Replace getGeminiClient
pattern = re.compile(r'function getGeminiClient\(\): GoogleGenAI \| null \{.*?return null;\n  \}', re.DOTALL)
replacement = '''function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('API Key missing or invalid');
  }'''
content = pattern.sub(replacement, content)

# Remove the fallbacks in each route.
# In each block, it currently does:
# const ai = getGeminiClient();
# if (ai) { try { ... } catch {} }
# res.json({ fallback... })
# We want to just wrap the ai calls and if there's an error, it gets caught by the outer catch and returns 500.

with open('server.ts', 'w') as f:
    f.write(content)
