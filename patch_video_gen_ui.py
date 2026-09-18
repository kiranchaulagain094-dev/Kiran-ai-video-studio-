import re

with open('src/components/generator/VideoGenerator.tsx', 'r') as f:
    content = f.read()

# Replace the handleGenerate function entirely
pattern = re.compile(r'  const handleGenerate = async \(e: React\.FormEvent\) => \{.*?\n  \};\n', re.DOTALL)

replacement = """  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaPrompt.trim()) return;

    setIsGenerating(true);
    setCurrentStepIndex(0);
    setGeneratedResult(null);
    setError(null);

    try {
      const jobStart = await StudioApiService.generateRealVideo({
        name: projectName,
        idea: ideaPrompt,
        type: videoType,
        aspectRatio,
        duration,
        style,
        voice,
        language,
        music
      });

      const interval = setInterval(async () => {
        try {
          const status = await StudioApiService.getRealVideoJobStatus(jobStart.jobId);
          
          if (status.status === 'failed') {
            clearInterval(interval);
            setError(status.error || "Video generation failed.");
            setIsGenerating(false);
          } else if (status.status === 'completed') {
            clearInterval(interval);
            // Handle success
            const newProject: Project = {
              id: status.projectId,
              userId: 'user-1',
              name: projectName || 'Untitled Studio Project',
              type: videoType,
              aspectRatio,
              duration,
              style,
              voice,
              language,
              music,
              ideaPrompt,
              status: 'Completed',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              thumbnailUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
              scenes: status.projectData?.scenes || [],
              script: status.projectData?.fullScript || ''
            };
            StudioApiService.saveProject(newProject);
            onProjectCreated(newProject);
            setGeneratedResult({
              summary: 'Video successfully generated.',
              fullScript: newProject.script,
              scenes: newProject.scenes || [],
              project: newProject
            });
            setIsGenerating(false);
          } else {
            // update progress UI based on status
            const stepMap: Record<string, number> = {
              'queued': 0,
              'generating_script': 1,
              'generating_scenes': 2,
              'generating_audio': 3,
              'combining': 4,
              'rendering': 6
            };
            setCurrentStepIndex(stepMap[status.status] || 0);
          }
        } catch (err: any) {
          clearInterval(interval);
          setError(err.message || "Failed to check job status");
          setIsGenerating(false);
        }
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start video generation");
      setIsGenerating(false);
    }
  };
"""

content = pattern.sub(replacement, content)

with open('src/components/generator/VideoGenerator.tsx', 'w') as f:
    f.write(content)

