import re

with open('src/components/common/Sidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace("currentUser?.role === 'admin'", "currentUser?.role === 'Admin'")
content = content.replace("currentRoute === 'admin'", "currentRoute === 'admin-portal'")
content = content.replace("onNavigate('admin')", "onNavigate('admin-portal')")

with open('src/components/common/Sidebar.tsx', 'w') as f:
    f.write(content)

