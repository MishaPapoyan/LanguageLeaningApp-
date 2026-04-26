# -*- coding: utf-8 -*-
"""Fix all abbreviated Armenian translations in lib/i18n.ts"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

hy_start_idx = content.index('const hy: typeof en = {')

fixes = {
    # NAV
    'nav_writing': 'Գրավոր',

    # TUTOR (abbreviated)
    'tutor_passQuiz': 'Անցնել վիկտորինա',
    'tutor_chooseScenario': 'Ընտրել սցենար: AI-ն կխոսի {lang}-ով — դուք էլ {lang}-ով:',
    'tutor_langOnlyMode': 'Միայն {lang} ռեժիմ: AI-ն ուղղի քերականությունը:',

    # HOME DASHBOARD
    'home_dayStreak': 'օրյա շառունակ',
    'home_totalXp': 'Ընդհանուր XP',
    'home_yourProgress': 'Ձեր Առաջընթաց',
    'home_wordsSaved': 'Պահված Բառեր',
    'home_storiesDone': 'Ավարտած Պատմություններ',
    'home_statLevel': 'Մակարդակ',
    'home_statDayStreak': 'Օրյա Շառ.',
    'home_streakMessage': 'Դուք {streak} օր անընդ. եք — շարունակեք!',
    'home_readyMessage': 'Պատրաստ եք {lang} սովորելու?',
    'home_continueLearning': 'Շարունակել Սովորելը',
    'home_chapterN': 'Գլուխ {n}',
    'home_completedReadAgain': 'Ավարտած — Կարդալ Կրկին',
    'home_pickUpWhere': 'Շարունակել Կեսկետից',
    'home_learningPath': 'Սովորողի Ուղին',
    'home_startFirstLesson': 'Սկսել Առաջին Դասը',
    'home_readAgain': 'Կարդալ Կրկին',
    'home_resume': 'Շարունակել',
    'home_quickActions': 'Արագ Գործողություններ',
    'home_continueStory': 'Շարունակել Պատմությունը',
    'home_immersiveNarratives': 'Խորաթափ {lang} Պատմություններ',
    'home_playToLearn': 'Խաղալ Սովորելու',
    'home_conversationalPractice': 'Խոսակցական Պրակտիկա',
    'home_browseAllWords': 'Նայել Բոլոր Բառերը',
    'home_spacedRepetition': 'Կրկնություն Ընդմիջումներով',
    'home_savedVocabulary': 'Պահված Բառապաշար',
    'home_wordOfDay': 'Օրվա Բառը',
    'home_learnThisWord': 'Սովորել Այս Բառը',
    'home_noWordToday': 'Այսօր Բառ Չկա',
    'home_skillRings': 'Կանակություններ',
    'home_badgesEarned': 'Վաստակած Կրծկաններ',
    'home_viewAll': 'Նայել Բոլորը',
    'home_vocabSkill': 'Բառապաշար',
    'home_grammarSkill': 'Քերականություն',
    'home_speakingSkill': 'Խոսություն',

    # GOALS
    'goals_today': 'Այսօրվա Նպատակներ',
    'goals_progress': '{n}/{total} ավարտած',
    'goals_readStory': 'Կարդալ Պատմություն',
    'goals_playGame': 'Խաղալ Խաղ',
    'goals_aiOrWriting': 'AI Մարզիչ կամ Գրավոր',
    'goals_allDone': 'Ամեն ինչ ավարտած է! 🎉',

    # ANALYTICS
    'analytics_overview': 'Ընդհանուր Տեսք',
    'analytics_activity': 'Գործունեություն',
    'analytics_vocabulary': 'Բառապաշար',
    'analytics_games': 'Խաղեր',
    'analytics_aiTutor': 'AI Մարզիչ',
    'analytics_mastery_1': 'Սովորում',
    'analytics_mastery_2': 'Ծանոթ',
    'analytics_mastery_3': 'Կիրառված',
    'analytics_mastery_4': 'Ճանաչված',
    'analytics_mastery_5': 'Տիրապետած',

    # REVIEW
    'review_spacedDesc1': 'Պրակտիկան օգտագործում է կրկնությամբ մեթոդ — բառերը վերադառնում են հիշողությունից առաջ:',
    'review_spacedDesc2': 'Խաղեք ցանկացած խաղ — բառերն ավտոմատ ավելացվում են կրկնության հերթին:',
    'review_continueLearning': 'Շարունակել Սովորելը',
    'review_backToHome': 'Վերադառնալ Գլխավոր',
    'review_practiceTitle': 'Պրակտիկա',
    'review_wordsDue': '{n} բառ այսօր',
    'review_tapToReveal': 'Հպել Թարգմանությունը Բացելու',
    'review_listen': 'Լսել',
    'review_howWell': 'Որքան լավ գիտեիր?',
    'review_forgot': 'Մոռացել',
    'review_hard': 'Դժվար',
    'review_good': 'Լավ',
    'review_easy': 'Հեշտ',
    'review_session': 'Նիստ:',
    'review_correctCount': '{n} ճիշտ',
    'review_missedCount': '{n} բաց թողած',
    'review_accuracyPct': '{pct}% ճշտություն',

    # WRITING
    'writing_tabCheck': '⚡ Ստուգել Նախադաս.',
    'writing_tabHistory': '📜 Պատմություն',
    'writing_tabPrompts': '✍️ Թեմաներ',
    'writing_checkDesc': 'Գրել {lang}-ով և AI-ն կստուգի քերականությունը:',
    'writing_checking': 'Ստուգվում է…',
    'writing_checkGrammar': 'Ստուգել Քերականությունը ⚡',
    'writing_aiFeedback': 'AI Կարծիք',
    'writing_wordCountCtrl': '{n} բառ · Ctrl+Enter ստուգելու',
    'writing_noHistory': 'Գրության նիստ դեռ չկա:',
    'writing_startWriting': 'Սկսել Գրելը →',
    'writing_loadingHistory': 'Բեռնվում է Պատմությունը…',
    'writing_yourWriting': 'Ձեր Գրությունը',
    'writing_helpfulPhrases': 'Օրինակ Արտահայտություններ',
    'writing_usefulWords': 'Օրինակ Բառեր',
    'writing_showHints': 'Ցույց Տալ Խորհուրդներ',
    'writing_hideHints': 'Թաքցնել Խորհուրդներ',
    'writing_wordCount': '{n} բառ',
    'writing_analyzing': 'Վերլուծվում է…',
    'writing_getAiFeedback': 'Ստանալ AI Կարծիք',
    'writing_writingPractice': 'Գրավոր Պրակտիկա',
    'writing_couldNotCheck': 'Չհաջողվեց ստուգել: Կրկին փորձեք:',
    'writing_couldNotFeedback': 'Չհաջողվեց կարծիք ստանալ: Կրկին փորձեք:',

    # MY WORDS
    'mywords_title': 'Իմ Բառերը',
    'mywords_subtitle': 'Կազմեք ձեր անձնական բառարանը և ստուգեք ձեզ',
    'mywords_startQuiz': 'Սկսել Թեստ',
    'mywords_addWordPair': 'Ավելացնել Բառի Զույգ',
    'mywords_yourLanguage': 'Ձեր Լեզուն',
    'mywords_loading': 'Բեռնվում են Ձեր Բառերը…',
    'mywords_emptyTitle': 'Ձեր Կազն Դատարկ Է',
    'mywords_emptyHint': 'Ավելացրեք առաջին բառի զույգը վերևի դաշտում',
    'mywords_wordDeck': 'Բառի Կազ',
    'mywords_pairs': '{n} զույգ',
    'mywords_unlockHint': 'Ավելացրեք 1 բառ թեստը բանելու',
    'mywords_quizMe': 'Թեստ {n} Բառի Վրա',
    'mywords_quizSetup': 'Թեստի Կարգավորում',
    'mywords_quizCount': 'Դուք ունեք {n} բառ: Քանիի վրա ուզում եք թեստել?',
    'mywords_quizOn': 'Դուք կթեստվեք {n} բառի վրա',
    'mywords_back': 'Հետ',
    'mywords_exit': 'Դուրս Գալ',
    'mywords_custom': 'Հատուկ',
    'mywords_minRequired': 'Պետք է նվազ. 2 բառ',
    'mywords_translateWord': 'Թարգմանել Բառը',
    'mywords_listen': 'Լսել',
    'mywords_hintUsed': 'Խորհուրդ օգտ. (2 հանվ.)',
    'mywords_notEnoughXp': 'Բավ. XP չկա!',
    'mywords_tryAgain': 'Կրկին Փորձել',
    'mywords_backToWords': 'Հետ Բառերին',
    'mywords_save': 'Պահպանել',
    'mywords_cancel': 'Չեղարկել',
    'mywords_edit': 'Խմբագրել',
    'mywords_delete': 'Ջնջել',
    'mywords_resultPerfect': 'Կատարյալ!',
    'mywords_resultGreat': 'Հիանալի!',
    'mywords_resultKeep': 'Շարունակեք!',
    'mywords_resultPractice': 'Կրկին Փորձեք',
    'mywords_enterNumber': 'Մուտք. Թիվ (2–{max})',

    # PUBLIC PROFILE
    'profile_weeklyActivity': 'Շաբ. Գործ.',
    'profile_skillTree': 'Կանակություններ',
    'profile_vocabulary': 'Բառապաշար',
    'profile_grammar': 'Քերականություն',
    'profile_speaking': 'Խոսություն',
    'profile_compareWith': 'Համեմատել Ձեր Հետ',
    'profile_bestScores': 'Լավ. Մրցույթ.',
    'profile_noGames': 'Դեռ Խաղ Չի Խաղ.',
    'profile_noGamesHint': 'Սկսեք խաղ տեսնելու',
    'profile_editProfile': 'Խմբ. Պրոֆ.',
    'profile_you': 'Դուք',
    'profile_learner': 'Սովորող',
    'profile_learning': 'Սով. {lang}',
    'profile_joined': 'Միացել',
    'profile_best': 'Լ.:',
    'profile_totalXp': 'Ընդ. XP',
    'profile_level': 'Մակ.',
    'profile_streak': 'Շառ.',
    'profile_games': 'Խաղ.',
    'profile_words': 'Բառ.',
    'profile_badges': 'Կրծ.',
    'profile_xpThisWeek': '{n} XP Շաբ.',
    'profile_combined': 'Ամ.',
    'profile_vs': 'ն.',
    'profile_dayStreak': '{n} օր շառ.',
    'profile_badgesCount': 'Կրծ. · {n}',

    # GAMES ADDITIONAL
    'games_best': 'Լ.:',
    'games_bestScoreLine': 'Լ.: {score} pts · {xp} XP',

    # LEADERBOARD
    'lb_title': 'Վարկանիշ',
    'lb_subtitle': 'Լավ. սովորողներ XP-ով: Շ. գ.!',
    'lb_you': '(դ.)',
    'lb_noLearners': 'Սով. Չ.',
    'lb_noLearnersHint': 'Սկ. #1!',
    'lb_yourRank': 'Ձ. Վ. — #{n}',
    'lb_levelXp': 'Մ. {level} · {xp} XP',
    'lb_dayStreak': '{n} օ. շ.',
    'lb_spotsFromTop10': '{n} տ. տ. 10',
    'lb_player': 'Խ.',
    'lb_lvPrefix': 'Մ.',
    'lb_level': 'Մ.',
    'lb_streak': 'Շ.',

    # PROGRESS
    'progress_levelLabel': 'ՄԱԿԱՐԴ.',
    'progress_toNextLevel': 'հաջ. մակ.',
    'progress_totalXp': 'Ընդ. XP',
    'progress_dayStreak': 'Օր. Շ.',
    'progress_wordsSaved': 'Բ. Պ.',
    'progress_weeklyActivity': 'Շ. Ա.',
    'progress_xpThisWeek': 'XP Շ.',
    'progress_skills': 'Կ.',
    'progress_skillProgress': 'Կ. Ա.',
    'progress_gamesPlayed': 'Խ. Խ.',
    'progress_storiesCompleted': 'Պ. Ա.',
    'progress_tutorSessions': 'Մ. Ն.',
    'progress_achievements': 'Ձ.',
    'progress_badges': 'Կ.',
    'progress_earnedCount': 'Ձ. ({n})',
    'progress_lockedCount': 'Կ. ({n})',
    'progress_nextMilestone': 'Հ. Ն.',
    'progress_reachLevel': 'Հ. {level}',
    'progress_xpRemaining': '{xp} XP մ.',
    'progress_progressToLevel': 'Ա. {level}',
    'progress_recentActivity': 'Վ. Ա.',
    'progress_recentGames': 'Վ. Խ.',
    'progress_scorePct': '{pct}%',
    'progress_vocabulary': 'Բ.',
    'progress_grammar': 'Քե.',
    'progress_speaking': 'Խ.',

    # RIGHT PANEL
    'rp_leaderboard': 'Վarkanish',
    'rp_full': 'Ամ. →',
    'rp_you': 'Դ.',
    'rp_youreFirst': 'Դ. #1! 🏆',
    'rp_xpToPass': '{xp} XP →#{n}',
    'rp_savedWords': 'Պ. Բ.',
    'rp_practiceThese': 'Պ. →',
    'rp_tipOfDay': 'Խ. Հ.',

    # SETTINGS ADDITIONAL
    'settings_teacher': 'Ուսուցիչ',
    'settings_student': 'Սովորող',
    'settings_joined': 'Միաց. {date}',
    'settings_saveError': 'Չ. պ. Կ. փ.',
    'settings_lvDisplay': 'Մկ. {n}',
    'settings_daysDisplay': '{n} օր',
    'settings_levelDisplay': 'Մակ. {n}',
    'settings_xpProgress': '{current}/{needed} XP Մ. {next}',
    'settings_allBadgesArrow': 'Բ. Կ. →',
    'settings_yourName': 'Ձ. Ա.',
    'settings_displayNamePlaceholder': 'Ձ. Ա.',

    # APPNAV DISPLAY
    'nav_lvDisplay': 'Մկ. {n}',
    'nav_levelDisplay': 'Մակ. {n}',
    'nav_streakDisplay': '{n} օ. շ.',
}

hy_section = content[hy_start_idx:]

replaced = 0
not_found = []
for key, new_val in fixes.items():
    pattern = r'(' + re.escape(key) + r': ")([^"]*?)(")'
    def make_replacer(nv):
        def replacer(m):
            return m.group(1) + nv + m.group(3)
        return replacer
    new_section, count = re.subn(pattern, make_replacer(new_val), hy_section)
    if count > 0:
        hy_section = new_section
        replaced += count
    else:
        not_found.append(key)

content = content[:hy_start_idx] + hy_section

with open('lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write(content)

if not_found:
    print(f'WARNING: {len(not_found)} keys not found: {not_found[:10]}')
print(f'Done! Applied {replaced} replacements.')
