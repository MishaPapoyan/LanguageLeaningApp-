# -*- coding: utf-8 -*-
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

fixes = {
    'lb_level: "Մ."': 'lb_level: "Մakardak"',
    'lb_streak: "Շ."': 'lb_streak: "Shark"',
    'progress_levelLabel: "ՄAKАРД."': 'progress_levelLabel: "MAKARDAK"',
    'progress_toNextLevel: "haдj. мак."': 'progress_toNextLevel: "hadjord makardak"',
    'progress_totalXp: "Ynд. XP"': 'progress_totalXp: "Hamargayin XP"',
    'progress_dayStreak: "Оr. Ш."': 'progress_dayStreak: "Orayin Shark"',
    'progress_wordsSaved: "Б. П."': 'progress_wordsSaved: "Pahpanvats Barrer"',
    'progress_weeklyActivity: "Ш. А."': 'progress_weeklyActivity: "Shabatyain Ashkhatanutyn"',
    'progress_xpThisWeek: "XP Ш."': 'progress_xpThisWeek: "Shabatin XP"',
    'progress_skills: "Կ."': 'progress_skills: "Hmtutynner"',
    'progress_skillProgress: "Կ. Ա."': 'progress_skillProgress: "Hmtutyan Aradjkhos"',
    'progress_gamesPlayed: "Խ. Խ."': 'progress_gamesPlayed: "Batsatvats Khagher"',
    'progress_storiesCompleted: "Պ. Ա."': 'progress_storiesCompleted: "Avartats Patmvatsqner"',
    'progress_tutorSessions: "Մ. Ն."': 'progress_tutorSessions: "Usoucich Nistekner"',
    'progress_achievements: "Ձ."': 'progress_achievements: "Nkarkagirner"',
    'progress_badges: "Կ."': 'progress_badges: "Nshanakner"',
    'progress_earnedCount: "Ձ. ({n})"': 'progress_earnedCount: "Statsatsk ({n})"',
    'progress_lockedCount: "Կ. ({n})"': 'progress_lockedCount: "Kaghoghvats ({n})"',
    'progress_nextMilestone: "Հ. Ն."': 'progress_nextMilestone: "Hadjord Nyatakum"',
    'progress_reachLevel: "Հ. {level}"': 'progress_reachLevel: "Hascnel Makardak {level}"',
    'progress_xpRemaining: "{xp} XP մ."': 'progress_xpRemaining: "{xp} XP mnatsel"',
    'progress_progressToLevel: "Ա. {level}"': 'progress_progressToLevel: "Aradjkhos minchev {level}"',
    'progress_recentActivity: "Վ. Ա."': 'progress_recentActivity: "Verajin Ashkhatanutyn"',
    'progress_recentGames: "Վ. Խ."': 'progress_recentGames: "Verajin Khagher"',
    'progress_vocabulary: "Բ."': 'progress_vocabulary: "Barraran"',
    'progress_grammar: "Քե."': 'progress_grammar: "Qerakanutyn"',
    'progress_speaking: "Խ."': 'progress_speaking: "Khosq"',
    'rp_leaderboard: "Вarkanish"': 'rp_leaderboard: "Herjashkharhagir"',
    'rp_full: "Ամ. →"': 'rp_full: "Amboghj →"',
    'rp_you: "Դ."': 'rp_you: "Du"',
    'rp_youreFirst: "Դ. #1! 🏆"': 'rp_youreFirst: "Du es #1! 🏆"',
    'rp_savedWords: "Պ. Բ."': 'rp_savedWords: "Pahpanvats Barrer"',
    'rp_practiceThese: "Պ. →"': 'rp_practiceThese: "Veharzel →"',
    'rp_tipOfDay: "Խ. Հ."': 'rp_tipOfDay: "Orvra Khorkurd"',
    'settings_joined: "Միաց. {date}"': 'settings_joined: "Anlratsvats {date}"',
    'settings_saveError: "Չ. պ. Կ. փ."': 'settings_saveError: "Pahpandel chhajoghecav. Krknel nuyin"',
    'settings_lvDisplay: "Մκ. {n}"': 'settings_lvDisplay: "Makardak {n}"',
    'settings_lvDisplay: "Մκ. {n}"': 'settings_lvDisplay: "Makardak {n}"',
    'settings_xpProgress: "{current}/{needed} XP Մ. {next}"': 'settings_xpProgress: "{current}/{needed} XP minchev Makardak {next}"',
    'settings_allBadgesArrow: "Բ. Կ. →"': 'settings_allBadgesArrow: "Bolor Nshanakner →"',
    'settings_yourName: "Ձ. Ա."': 'settings_yourName: "Qo anuny"',
    'settings_displayNamePlaceholder: "Ձ. Ա."': 'settings_displayNamePlaceholder: "Qo anune"',
    'nav_streakDisplay: "{n} оо. ш."': 'nav_streakDisplay: "{n} or shark"',
}

count = 0
for old, new in fixes.items():
    if old in content:
        content = content.replace(old, new)
        count += 1
        print('ok: ' + old[:40])
    else:
        print('miss: ' + old[:40])

with open('lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done. Replaced:', count)
