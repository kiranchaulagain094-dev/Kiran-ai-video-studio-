import re

with open('src/services/api.ts', 'r') as f:
    content = f.read()

# Replace generateVideoPlan
pattern = re.compile(r'  static async generateVideoPlan.*?try \{.*?const res = await fetch\(\'/api/ai/video-plan\'.*?if \(!res\.ok\) throw new Error\(\'Server request failed\'\);.*?return await res\.json\(\);.*?\} catch \{.*?return \{.*?\};.*?\}  \}', re.DOTALL)
replacement = '''  static async generateVideoPlan(params: {
    name: string;
    idea: string;
    style: string;
    videoType: string;
    aspectRatio: string;
    duration: string;
  }): Promise<{ summary: string; fullScript: string; scenes: VideoScene[]; project: Project }> {
    const res = await fetch('/api/ai/video-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Server request failed. Is API Key configured?');
    }
    return await res.json();
  }'''
content = pattern.sub(replacement, content)

# Replace generateShortsPlan
pattern2 = re.compile(r'  static async generateShortsPlan.*?try \{.*?const res = await fetch\(\'/api/ai/shorts-plan\'.*?if \(!res\.ok\) throw new Error\(\'Shorts plan generation failed\'\);.*?return await res\.json\(\);.*?\} catch \{.*?return \{.*?\};.*?\}  \}', re.DOTALL)
replacement2 = '''  static async generateShortsPlan(params: {
    topic: string;
    hook?: string;
    script?: string;
    visualStyle?: string;
    voice?: string;
    music?: string;
    captionStyle?: string;
  }): Promise<ShortsGenerationPlan> {
    const res = await fetch('/api/ai/shorts-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Shorts plan generation failed. Is API Key configured?');
    }
    return await res.json();
  }'''
content = pattern2.sub(replacement2, content)

# Replace generateContentAssistant
pattern3 = re.compile(r'  static async generateContentAssistant.*?try \{.*?const res = await fetch\(\'/api/ai/content-assistant\'.*?if \(!res\.ok\) throw new Error\(\'Content generation failed\'\);.*?return await res\.json\(\);.*?\} catch \{.*?return \{.*?\};.*?\}  \}', re.DOTALL)
replacement3 = '''  static async generateContentAssistant(params: {
    prompt: string;
    videoType?: string;
    targetAudience?: string;
    language?: string;
    mainKeyword?: string;
  }): Promise<AIContentPack> {
    const res = await fetch('/api/ai/content-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Content generation failed. Is API Key configured?');
    }
    return await res.json();
  }'''
content = pattern3.sub(replacement3, content)

# Replace generateThumbnailConcept
pattern4 = re.compile(r'  static async generateThumbnailConcept.*?try \{.*?const res = await fetch\(\'/api/ai/thumbnail-concept\'.*?if \(!res\.ok\) throw new Error\(\'Thumbnail concept failed\'\);.*?return await res\.json\(\);.*?\} catch \{.*?return \{.*?\};.*?\}  \}', re.DOTALL)
replacement4 = '''  static async generateThumbnailConcept(params: {
    idea: string;
    title?: string;
    style?: string;
    aspectRatio?: '16:9' | '9:16';
  }): Promise<ThumbnailConcept> {
    const res = await fetch('/api/ai/thumbnail-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Thumbnail concept failed. Is API Key configured?');
    }
    return await res.json();
  }'''
content = pattern4.sub(replacement4, content)

with open('src/services/api.ts', 'w') as f:
    f.write(content)
