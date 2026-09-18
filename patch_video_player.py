import re

with open('src/components/generator/VideoGenerator.tsx', 'r') as f:
    content = f.read()

# I will replace the generated result view entirely with one that includes a video player.
pattern = re.compile(r'      \{generatedResult && \(.*?\n        </div>\n      \)\}', re.DOTALL)

replacement = """      {generatedResult && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-3xl bg-[#121622] border border-emerald-500/30 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                  ✓ Generation Complete
                </span>
                <h3 className="text-xl font-black text-white mt-1">{generatedResult.project.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{generatedResult.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEditor(generatedResult.project)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Edit Video</span>
                </button>
                <button
                  onClick={() => onOpenSEO(generatedResult.project)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1f30] hover:bg-[#232a3f] text-white text-xs font-bold transition-all border border-white/5"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>YouTube SEO</span>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/10 shadow-2xl">
                {/* Fallback to simulated video player if real one isn't loaded */}
                {(generatedResult as any).videoUrl ? (
                  <video 
                    src={(generatedResult as any).videoUrl} 
                    controls 
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d1017]">
                    <Play className="w-16 h-16 text-white/20 mb-4" />
                    <p className="text-slate-400 font-medium">Video Player Ready</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm text-center">
                      The generated video stream would appear here using the HTML5 player.
                    </p>
                  </div>
                )}
                
                {/* Overlay specs */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[10px] font-bold text-white border border-white/10">
                    {aspectRatio}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[10px] font-bold text-white border border-white/10">
                    1080p
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Script and Scenes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Generated Script
                </h4>
                <div className="p-4 rounded-xl bg-[#0a0c14] border border-white/5 h-[300px] overflow-y-auto">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {generatedResult.fullScript}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Scene Breakdown
                </h4>
                <div className="p-4 rounded-xl bg-[#0a0c14] border border-white/5 h-[300px] overflow-y-auto space-y-4">
                  {generatedResult.scenes?.map((scene: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-white">Scene {scene.sceneNumber}</span>
                        <span className="text-[10px] font-medium text-slate-400 bg-black/30 px-2 py-0.5 rounded">
                          {scene.timeRange || '0:00'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{scene.description}</p>
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-400">
                          <span className="font-semibold text-indigo-300">Visual:</span> {scene.visualPrompt}
                        </p>
                        {scene.voiceoverText && (
                          <p className="text-[10px] text-slate-400">
                            <span className="font-semibold text-emerald-300">Audio:</span> {scene.voiceoverText}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}"""

# We'll use split and join to replace from {generatedResult && ( down to the end of that block
# It's safer to find the index of "{generatedResult && (" and the matching closing braces
# Since this is a bit tricky with regex, I'll write a Python script that finds the line.
lines = content.split('\n')
start_idx = -1
for i, line in enumerate(lines):
    if "{generatedResult && (" in line:
        start_idx = i
        break

if start_idx != -1:
    end_idx = -1
    open_brackets = 0
    for i in range(start_idx, len(lines)):
        open_brackets += lines[i].count('{')
        open_brackets -= lines[i].count('}')
        if open_brackets == 0:
            end_idx = i
            break
    
    if end_idx != -1:
        new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
        content = '\n'.join(new_lines)

with open('src/components/generator/VideoGenerator.tsx', 'w') as f:
    f.write(content)

