import re

with open('src/components/generator/VideoGenerator.tsx', 'r') as f:
    content = f.read()

# Add error state
content = re.sub(
    r'  const \[isGenerating, setIsGenerating\] = useState\(false\);',
    r'  const [isGenerating, setIsGenerating] = useState(false);\n  const [error, setError] = useState<string | null>(null);',
    content
)

# Reset error in handleGenerate
content = re.sub(
    r'    setGeneratedResult\(null\);',
    r'    setGeneratedResult(null);\n    setError(null);',
    content
)

# Catch error
pattern = re.compile(r'      const response = await StudioApiService\.generateVideoPlan\((\{.*?\})\);\n\n      setTimeout\(\(\) => \{\n        clearInterval\(stepInterval\);\n        setCurrentStepIndex\(PROGRESS_STEPS\.length - 1\);\n        setGeneratedResult\(\{\n          \.\.\.response,\n          project: newProject\n        \}\);\n        setIsGenerating\(false\);\n      \}, 1500\);\n    \} catch \(err\) \{\n      console\.error\(err\);\n      clearInterval\(stepInterval\);\n      setIsGenerating\(false\);\n    \}', re.DOTALL)

replacement = r'''      const response = await StudioApiService.generateVideoPlan(\1);
      setTimeout(() => {
        clearInterval(stepInterval);
        setCurrentStepIndex(PROGRESS_STEPS.length - 1);
        setGeneratedResult({
          ...response,
          project: newProject
        });
        setIsGenerating(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate video plan");
      clearInterval(stepInterval);
      setIsGenerating(false);
    }'''

content = pattern.sub(replacement, content)

# Display error
content = re.sub(
    r'      \{/\* Generated Result View \*/\}',
    r'''      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
          <p className="text-rose-400 font-semibold">{error}</p>
          <p className="text-xs text-rose-400/80">Please check your API configuration or try again.</p>
        </div>
      )}
      {/* Generated Result View */}''',
    content
)

with open('src/components/generator/VideoGenerator.tsx', 'w') as f:
    f.write(content)

