import re
import sys

f = sys.argv[1]
with open(f, 'r', encoding='utf-8') as fh:
    c = fh.read()

# Map of mojibake -> correct character
replacements = {
    '\u00c3\u00a1': '\u00e1',  # á
    '\u00c3\u00a9': '\u00e9',  # é
    '\u00c3\u00ad': '\u00ed',  # í
    '\u00c3\u00b3': '\u00f3',  # ó
    '\u00c3\u00ba': '\u00fa',  # ú
    '\u00c3\u00b1': '\u00f1',  # ñ
    '\u00c3\u009a': '\u00da',  # Ú
    '\u00c3\u00bc': '\u00fc',  # ü
    '\u00e2\u20ac\u201c': '\u2014',  # — (em dash)
    '\u00e2\u20ac\u201d': '\u2014',  # — (em dash variant)
    '\u00e2\u20ac\u2122': '\u2019',  # ' (right single quote)
    '\u00e2\u20ac\u0093': '\u2013',  # – (en dash)
    '\u00c2\u00bf': '\u00bf',  # ¿
}

for old, new in replacements.items():
    c = c.replace(old, new)

# Fix broken emoji sequences
emoji_fixes = {
    '\u00e2\u0161\u00a0\u00ef\u00b8\u008f': '\u26a0\ufe0f',  # ⚠️
    '\u00e2\u0153\u0085': '\u2705',  # ✅
    '\u00e2\u0152\u0152': '\u274c',  # ❌
    '\u00f0\u0178\u201c\u0098': '\U0001f4d8',  # 📘
}
for old, new in emoji_fixes.items():
    c = c.replace(old, new)

with open(f, 'w', encoding='utf-8') as fh:
    fh.write(c)

remaining = len(re.findall(r'\u00c3[\u0080-\u00bf]', c))
print(f'Done. Remaining broken sequences: {remaining}')
