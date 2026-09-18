import re

with open('firestore.rules', 'r') as f:
    content = f.read()

old_isadmin = """    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'kiranchaulagain34@gmail.com' ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }"""

new_isadmin = """    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        exists(/databases/$(database)/documents/admins/$(request.auth.uid))
      );
    }"""

content = content.replace(old_isadmin, new_isadmin)

with open('firestore.rules', 'w') as f:
    f.write(content)

