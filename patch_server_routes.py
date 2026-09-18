import re

with open('server.ts', 'r') as f:
    content = f.read()

# Replace the inner try/catch and the programmatic fallbacks
# For video-plan:
pattern_video = re.compile(r'    if \(ai\) \{\n      try \{\n(.*?)        return res\.json\(JSON\.parse\(cleaned\)\);\n      \} catch \{\n        // Cinematic production plan generator fallback activates seamlessly\n      \}\n    \}\n    // Programmatic fallback\n    res\.json\(\{.*?\}\);', re.DOTALL)
replacement_video = r'    const ai = getGeminiClient();\n\1        return res.json(JSON.parse(cleaned));'
content = pattern_video.sub(replacement_video, content)

# For shorts-plan:
pattern_shorts = re.compile(r'    if \(ai\) \{\n      try \{\n(.*?)        return res\.json\(JSON\.parse\(cleaned\)\);\n      \} catch \{\n        // High-retention shorts generator fallback activates seamlessly\n      \}\n    \}\n    // Programmatic fallback\n    res\.json\(\{.*?\}\);', re.DOTALL)
replacement_shorts = r'    const ai = getGeminiClient();\n\1        return res.json(JSON.parse(cleaned));'
content = pattern_shorts.sub(replacement_shorts, content)

# For content-assistant:
pattern_content = re.compile(r'    if \(ai\) \{\n      try \{\n(.*?)        return res\.json\(JSON\.parse\(cleaned\)\);\n      \} catch \{\n        // SEO package generator fallback activates seamlessly\n      \}\n    \}\n    // Programmatic fallback\n    res\.json\(\{.*?\}\);', re.DOTALL)
replacement_content = r'    const ai = getGeminiClient();\n\1        return res.json(JSON.parse(cleaned));'
content = pattern_content.sub(replacement_content, content)

# For thumbnail-concept:
pattern_thumbnail = re.compile(r'    if \(ai\) \{\n      try \{\n(.*?)        return res\.json\(JSON\.parse\(cleaned\)\);\n      \} catch \{\n        // High-CTR thumbnail composition generator fallback activates seamlessly\n      \}\n    \}\n    // Programmatic fallback\n    res\.json\(\{.*?\}\);', re.DOTALL)
replacement_thumbnail = r'    const ai = getGeminiClient();\n\1        return res.json(JSON.parse(cleaned));'
content = pattern_thumbnail.sub(replacement_thumbnail, content)

with open('server.ts', 'w') as f:
    f.write(content)
