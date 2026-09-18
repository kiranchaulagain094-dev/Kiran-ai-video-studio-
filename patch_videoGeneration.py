import re

with open('src/services/videoGeneration.ts', 'r') as f:
    content = f.read()

# Make the error message exactly match the requested one
content = content.replace(
    "'Video generation is currently unavailable. No video-generation provider is configured. Please securely configure VEO_API_KEY or RUNWAY_API_KEY in your .env file.'",
    "'Video generation is currently unavailable because no video-generation provider is configured.'"
)

with open('src/services/videoGeneration.ts', 'w') as f:
    f.write(content)

