with open('server.ts', 'r') as f:
    content = f.read()

import_statement = "import { VideoGenerationService } from './src/server/videoService';\n"
if "VideoGenerationService" not in content:
    content = content.replace("import path from 'path';", "import path from 'path';\n" + import_statement)

endpoints = """
// Video Generation Job Endpoints
app.post('/api/video/jobs', async (req, res) => {
  try {
    const job = await VideoGenerationService.startJob(req.body);
    res.json(job);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/video/jobs/:id', async (req, res) => {
  try {
    const status = await VideoGenerationService.getJobStatus(req.params.id);
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

"""

if "/api/video/jobs" not in content:
    content = content.replace("app.post('/api/ai/video-plan', async (req, res) => {", endpoints + "app.post('/api/ai/video-plan', async (req, res) => {")

with open('server.ts', 'w') as f:
    f.write(content)
