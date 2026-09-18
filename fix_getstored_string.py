with open('src/services/api.ts', 'r') as f:
    content = f.read()

target = """  private static getStored<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
  }

  private static setStored<T>(key: string, value: T): void {"""

replacement = """  private static getStored<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>(key: string, value: T): void {"""

content = content.replace(target, replacement)

with open('src/services/api.ts', 'w') as f:
    f.write(content)
