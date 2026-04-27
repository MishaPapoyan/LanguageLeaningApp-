# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('lib/i18n.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Map line numbers (1-based) to new values
line_fixes = {
    914: '  progress_levelLabel: "MAKARDAK",\n',
    915: '  progress_toNextLevel: "Hadjord Makardak",\n',
    916: '  progress_totalXp: "Hamargayin XP",\n',
    917: '  progress_dayStreak: "Orayin Shark",\n',
    918: '  progress_wordsSaved: "Pahpanvats Barrer",\n',
    919: '  progress_weeklyActivity: "Shabatyain Ashkhatanutyn",\n',
    920: '  progress_xpThisWeek: "Shabatin XP",\n',
    942: '  rp_leaderboard: "Herjashkharhagir",\n',
    956: '  settings_lvDisplay: "Makardak {n}",\n',
    958: '  settings_levelDisplay: "Makardak {n}",\n',
    965: '  nav_lvDisplay: "Mkd {n}",\n',
    966: '  nav_levelDisplay: "Makardak {n}",\n',
    967: '  nav_streakDisplay: "{n} or shark",\n',
}

for lineno, new_val in line_fixes.items():
    idx = lineno - 1
    print('line ' + str(lineno) + ': ' + lines[idx].strip()[:50] + ' -> ' + new_val.strip()[:50])
    lines[idx] = new_val

with open('lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Done.')
