import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

# Fix getStored
pattern = re.compile(r'    try \{\n      const item = localStorage\.getItem\(key\);\n      return item \? JSON\.parse\(item\) : fallback;\n  \}\n  private static setStored<T>', re.DOTALL)
replacement = r'''    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>'''

content = pattern.sub(replacement, content)

with open('src/services/api.ts', 'w') as f:
    f.write(content)
