import re

with open('src/components/admin/AdminPanel.tsx', 'r') as f:
    content = f.read()

import_statement = "import { StudioApiService } from '../../services/api';\nimport { auth } from '../../lib/firebase';"
content = content.replace("import { StudioApiService } from '../../services/api';", import_statement)

use_effect = """
  useEffect(() => {
    // This demonstrates fetching from the secure admin API
    const fetchSecureStats = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch secure admin stats', err);
      }
    };
    fetchSecureStats();
  }, []);
"""

# add after standard hooks
content = content.replace("const [newBannerType, setNewBannerType] = useState<'info' | 'warning' | 'success'>('info');", "const [newBannerType, setNewBannerType] = useState<'info' | 'warning' | 'success'>('info');\n" + use_effect)

# add stats state
content = content.replace("const [usageSavedFeedback, setUsageSavedFeedback] = useState(false);", "const [usageSavedFeedback, setUsageSavedFeedback] = useState(false);\n  const [stats, setStats] = useState({ totalUsers: 1420, activeProjects: 384, aiUsageTokens: 4200000, videosGenerated: 890 });")

content = content.replace("1,420", "{stats.totalUsers.toLocaleString()}")
content = content.replace("384", "{stats.activeProjects.toLocaleString()}")
content = content.replace("4.2M", "{(stats.aiUsageTokens / 1000000).toFixed(1) + 'M'}")
content = content.replace("890", "{stats.videosGenerated.toLocaleString()}")

with open('src/components/admin/AdminPanel.tsx', 'w') as f:
    f.write(content)

