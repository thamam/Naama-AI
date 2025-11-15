/**
 * Enhanced Hebrew Articulation Practice Activity Prompt Template
 * Phase 2.5: Leverages Hebrew linguistic services for age-normed phoneme data
 */

export const generateHebrewArticulationPrompt = (params) => {
  const {
    ageGroup,
    targetSound,
    soundPosition = 'any', // initial, medial, final, any
    itemCount,
    suggestedVocabulary = [],
    phoneticInfo = {},
    nikudLevel = 'full'
  } = params;

  const ageGuidelines = {
    '2-3': 'פשוטות מאוד, הברה אחת או שתיים, מילים מוכרות מהיומיום',
    '3-4': 'מילים פשוטות עד בינוניות, 1-3 הברות, מאוצר המילים היומיומי',
    '4-6': 'מילים מגוונות, 2-4 הברות, יכול לכלול ביטויים קצרים'
  };

  const nikudGuidelines = {
    'full': 'נקד מלא לכל המילים, כולל דגש וניקוד מדויק',
    'partial': 'נקד חלקי - נקד רק מילים מורכבות או מילים שיש בהן אי-בהירות',
    'minimal': 'נקד מינימלי - רק היכן שהכרחי למניעת בלבול',
    'none': 'ללא ניקוד'
  };

  const positionGuidance = {
    'initial': 'בתחילת המילה',
    'medial': 'באמצע המילה',
    'final': 'בסוף המילה',
    'any': 'במיקומים שונים במילה'
  };

  // Build vocabulary suggestions section
  let vocabularySuggestions = '';
  if (suggestedVocabulary.length > 0) {
    const vocabList = suggestedVocabulary.map(v =>
      `- ${v.word} (${v.theme || 'כללי'}, ${v.syllables || '?'} הברות)`
    ).join('\n');

    vocabularySuggestions = `
**מילים מומלצות מבנק המילים (השתמש באלה או דומות להן):**
${vocabList}

הערה: אלה מילים שעברו בדיקה והתאמה לגיל ${ageGroup} ומכילות את הצליל היעד.
`;
  }

  // Build phonetic info section
  let phoneticSection = '';
  if (phoneticInfo.acquisitionAge) {
    phoneticSection = `
**מידע פונטי על הצליל "${targetSound}":**
- גיל רכישה טיפוסי: ${phoneticInfo.acquisitionAge}
- רמת קושי ארטיקולטורית: ${phoneticInfo.articulationDifficulty}/10
- דרך יצירה: ${phoneticInfo.manner || 'לא צוין'}
- מקום יצירה: ${phoneticInfo.place || 'לא צוין'}
${phoneticInfo.commonErrors ? `- טעויות נפוצות: ${phoneticInfo.commonErrors.join(', ')}` : ''}

קח בחשבון מידע זה ביצירת הפעילות.
`;
  }

  return `אתה קלינאית תקשורת מומחית המתמחה בעברית, יוצרת חומרי תרגול ארטיקולציה לילדים בגילאי ${ageGroup} שנים.

צור פעילות תרגול ארטיקולציה המתמקדת בצליל "${targetSound}" ${positionGuidance[soundPosition]}.

**דרישות הפעילות:**
- התאמה לגיל: ${ageGuidelines[ageGroup]}
- מספר מילים: ${itemCount}
- צליל יעד: "${targetSound}"
- מיקום הצליל: ${soundPosition}
- המילים חייבות להיות פונטית מתאימות ומשמשות בדיבור יומיומי
- התקדמות מפשוט למעט יותר מורכב בתוך הסט
${phoneticSection}

**דרישות ניקוד:**
${nikudGuidelines[nikudLevel]}
- חשוב מאוד: שמור על דיוק בניקוד
- הוסף דגש כאשר נדרש (בגדכפת)
- סמן מפיק או דגש קל כנדרש

${vocabularySuggestions}

**פורמט פלט (JSON):**
החזר **אך ורק** אובייקט JSON תקף במבנה המדויק הזה:
{
  "title": "תרגול צליל '${targetSound}'",
  "instructions": "הנחיות מפורטות לקלינאית כיצד לבצע תרגול ארטיקולציה זה. כלול טיפים להצבת הפה והלשון.",
  "targetSound": "${targetSound}",
  "soundPosition": "${soundPosition}",
  "ageGroup": "${ageGroup}",
  "words": [
    {
      "word": "המילה בעברית עם ניקוד מלא",
      "phonetic": "תעתיק פונטי (IPA אם אפשר, או תעתיק עברי)",
      "syllables": מספר_ההברות,
      "syllableBreakdown": "פי-רוק-הב-רות",
      "soundPosition": "initial|medial|final",
      "difficulty": "easy|medium|hard (יחסית לגיל)",
      "visualCue": "תיאור לייצוג חזותי (למשל: תמונה של חתול)",
      "practiceTip": "טיפ ספציפי לתרגול המילה הזו",
      "root": "שורש המילה (אם רלוונטי, למשל: כ-ת-ב)",
      "meaning": "משמעות המילה"
    }
  ],
  "warmUpExercises": [
    "תרגילי התחממות להצבת הפה/לשון לפני התחלה"
  ],
  "tips": "טיפים כלליים לתרגול הצליל הזה עם ילדים בגיל זה",
  "commonMistakes": "טעויות הגייה נפוצות שיש לשים לב אליהן",
  "progressionSuggestions": "כיצד להתקדם ברגע שהילד שולט במילים אלה",
  "culturalContext": "הקשר תרבותי ישראלי רלוונטי אם יש"
}

**חשוב מאוד:**
- החזר **אך ורק** את אובייקט ה-JSON, ללא טקסט נוסף
- המילים חייבות להכיל בפועל את הצליל היעד במיקום המצוין
- כלול ניקוד מדויק בהתאם לרמת הניקוד המבוקשת: ${nikudLevel}
- סדר את המילים מהקלה למעט יותר קשה בטווח המתאים לגיל
- כלול טיפים מעשיים וישימים לקלינאיות
- רמזים חזותיים צריכים לעזור לילדים לקשר את המילה למשמעותה
- התמקד במילים ממערכות מילים ישראליות יומיומיות (בית, משפחה, חיות, אוכל, וכו')

זכור: הפלט חייב להיות JSON תקין בלבד, ללא markdown או טקסט נוסף.`;
};

export default generateHebrewArticulationPrompt;
