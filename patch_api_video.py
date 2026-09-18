with open('src/services/api.ts', 'r') as f:
    content = f.read()

new_method = """  static async generateRealVideo(params: any): Promise<{ jobId: string }> {
    const res = await fetch('/api/video/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Video generation failed to start');
    }
    return await res.json();
  }

  static async getRealVideoJobStatus(jobId: string): Promise<any> {
    const res = await fetch(`/api/video/jobs/${jobId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch job status');
    }
    return await res.json();
  }
"""

if "generateRealVideo" not in content:
    content = content.replace("static async generateVideoPlan", new_method + "\n  static async generateVideoPlan")

with open('src/services/api.ts', 'w') as f:
    f.write(content)
