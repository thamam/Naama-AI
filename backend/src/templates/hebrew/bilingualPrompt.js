/**
 * Bilingual Hebrew-English Activity Prompt Template
 * Phase 2.5: Translation pairs, code-switching awareness, bilingual vocabulary building
 */

export const generateBilingualPrompt = (params) => {
  const {
    ageGroup,
    itemCount,
    theme,
    activitySubtype = 'translation', // translation, codeSwitch, cognates, culturalConcepts
    primaryLanguage = 'he',
    nikudLevel = 'partial'
  } = params;

  const ageGuidelines = {
    '2-3': '4-5 זוגות תרגום פשוטים, מילים קונקרטיות בסיסיות (בית, אמא, אבא, חתול)',
    '3-4': '6-8 זוגות תרגום, מילים מוכרות וביטויים קצרים, התחלת מודעות לדו-לשוניות',
    '4-6': '8-12 זוגות תרגום, ביטויים, מושגים תרבותיים, משחקי מעבר בין שפות'
  };

  const activityTypeGuidance = {
    'translation': 'זוגות תרגום ישירים - מילה או ביטוי בעברית והאנגלית שלו',
    'codeSwitch': 'מודעות למעבר בין שפות - זיהוי מתי ואיך עוברים בין עברית לאנגלית',
    'cognates': 'מילים דומות בשתי השפות (false friends and true cognates)',
    'culturalConcepts': 'מושגים תרבותיים ישראליים שקשה לתרגם'
  };

  const bilingualGuidance = `
**עקרונות דו-לשוניות בישראל:**
- ילדים ישראלים רבים חשופים גם לעברית וגם לאנגלית
- Code-switching (מעבר בין שפות) הוא תופעה טבעית ובריאה
- מודעות מפורשת לשתי השפות תורמת לשליטה בשתיהן
- מושגים תרבותיים: שבת, חומוס, קיבוץ, וכו' - אין תרגום ישיר

**דוגמאות לזוגות תרגום מצוינים:**
- חיות: חָתוּל - cat, כֶּלֶב - dog, צִפּוֹר - bird
- משפחה: אִמָּא - mother/mom, אַבָּא - father/dad, אָח - brother
- אוכל: לֶחֶם - bread, מַיִם - water, חָלָב - milk
- מושגים ישראליים: שַׁבָּת - Shabbat, חֻמּוּס - hummus, פִיתָּה - pita

**התאמה לגיל:**
- 2-3: מילים קונקרטיות בסיסיות, אובייקטים במגע ישיר
- 3-4: הרחבת אוצר מילים, התחלת מודעות למושגים תרבותיים
- 4-6: ביטויים, משחקי שפה, הבנת הקשר תרבותי
`;

  return `אתה קלינאית תקשורת מומחית המתמחה בהתפתחות דו-לשונית עברית-אנגלית, יוצרת פעילויות דו-לשוניות לילדים ישראלים בגילאי ${ageGroup} שנים.

צור פעילות דו-לשונית עברית-אנגלית המתמקדת ב${activityTypeGuidance[activitySubtype]}.

**דרישות הפעילות:**
- התאמה לגיל: ${ageGuidelines[ageGroup]}
- סוג פעילות: ${activitySubtype}
- מספר זוגות/פריטים: ${itemCount || 'מתאים לגיל'}
${theme ? `- נושא: ${theme}` : ''}
- שפה עיקרית: ${primaryLanguage === 'he' ? 'עברית' : 'English'}
- המילים/ביטויים חייבים להיות רלוונטיים לחיים של ילד ישראלי
- התחשב בהקשר תרבותי ישראלי
${bilingualGuidance}

**דרישות ניקוד:**
- עברית: ניקוד ${nikudLevel} לכל הטקסט העברי
- אנגלית: כתיב תקני

**פורמט פלט (JSON):**
החזר **אך ורק** אובייקט JSON תקין במבנה המדויק הזה:
{
  "title": "Bilingual Hebrew-English Activity / פעילות דו-לשונית עברית-אנגלית",
  "instructions": "Detailed instructions for the clinician in both languages. Include how to present the bilingual aspect effectively. / הנחיות מפורטות לקלינאית בשתי השפות.",
  "ageGroup": "${ageGroup}",
  "activitySubtype": "${activitySubtype}",
  "primaryLanguage": "${primaryLanguage}",
  "translationPairs": [
    {
      "hebrew": "מִילָה בעברית בניקוד",
      "english": "English word or phrase",
      "hebrewPhonetic": "תעתיק פונטי (mi-LA)",
      "englishPhonetic": "phonetic transcription",
      "category": "קטגוריה (animals, food, family, etc.)",
      "difficulty": "easy|medium|hard",
      "culturalNote": "הערה תרבותית אם רלוונטי (למשל: חלה - traditional Jewish bread for Shabbat)",
      "visualCue": "רמז חזותי",
      "exampleHebrew": "משפט לדוגמה בעברית",
      "exampleEnglish": "Example sentence in English",
      "codeSwitchExample": "דוגמה טבעית למעבר בין השפות (אם רלוונטי)"
    }
  ],
  "gameIdeas": [
    "Matching game: Match Hebrew words to English translations / משחק התאמה",
    "Code-switching story: Tell a story switching between languages / סיפור עם מעברים בין שפות",
    "Cultural exploration: Discuss words that don't translate / חקר מושגים תרבותיים"
  ],
  "tips": "Tips for supporting bilingual development at this age. Include information about code-switching being natural and healthy. / טיפים לתמיכה בהתפתחות דו-לשונית.",
  "culturalContext": "Cultural context for Israeli children learning both Hebrew and English. / הקשר תרבותי ישראלי.",
  "progressionSuggestions": "How to advance to more complex bilingual activities / כיצד להתקדם",
  "parentGuidance": "Guidance for parents on supporting bilingualism at home / הנחיות להורים"
}

**חשוב מאוד / IMPORTANT:**
- Return **ONLY** the JSON object, no additional text / החזר **רק** את ה-JSON, ללא טקסט נוסף
- Include content in BOTH languages where appropriate / כלול תוכן בשתי השפות
- Hebrew text must have accurate nikud / טקסט עברי חייב לכלול ניקוד מדויק
- Cultural notes should be authentic to Israeli life / הערות תרבותיות חייבות להיות אותנטיות
- Consider the bilingual reality of Israeli children / התחשב במציאות הדו-לשונית
- Use familiar, concrete examples / השתמש בדוגמאות מוכרות וקונקרטיות
- Visual cues should be culturally relevant / רמזים חזותיים צריכים להיות רלוונטיים תרבותית

Remember: Output must be valid JSON only, no markdown or additional text. / זכור: הפלט חייב להיות JSON תקין בלבד.`;
};

export default generateBilingualPrompt;
