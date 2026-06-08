package turingChatBackend;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ConversationStarterService {

    private final List<String> englishStarters = List.of(

            "Coffee, Tea, or Energy drinks?",
            "Morning person or night owl?",
            "Sweet or salty snacks?",
            "Hot weather or cold weather?",
            "Texting or calling?",

            "Dogs or cats?",
            "Shower in the morning or at night?",
            "Pizza or burgers?",
            "Beach or mountains?",
            "Ice cream or chocolate?",

            "Android or iPhone?",
            "PC or console?",
            "Music loud or quiet?",
            "Books or movies?",

            "Early to everything or always late?",
            "Messy room or super clean room?",

            "Be invisible or be able to fly?",
            "Read minds or teleport?",
            "Have unlimited money or unlimited free time?",
            "Never sleep or never eat again?",

            "Always be too hot or too cold?",
            "Never use phone or never use computer?",

            "Describe your mood in one word.",
            "One word: your personality?",
            "One word: your current energy level?",

            "What’s your go-to comfort food?",
            "What song are you playing on repeat lately?",
            "What’s your favorite emoji?",
            "What’s a random skill you’re weirdly good at?",

            "What’s your guilty pleasure snack?",
            "What’s your favorite way to waste time?",
            "What’s something you recently learned?",
            "What’s your “default” drink?",

            "You get a superpower for a day — what is it?",
            "You can delete one chore forever — which one?",
            "You can only eat one food forever — what is it?",
            "You can time travel once — past or future?",

            "You’re stuck in an elevator — who do you want with you?",
            "You win a free trip — where are you going?"
    );

    private final List<String> hebrewStarters = List.of(

            "קפה, תה או משקאות אנרגיה?",
            "איש של בוקר או של לילה?",
            "חטיפים מתוקים או מלוחים?",
            "מזג אוויר חם או קר?",
            "הודעות או שיחות?",

            "כלבים או חתולים?",
            "מקלחת בבוקר או בלילה?",
            "פיצה או המבורגר?",
            "ים או הרים?",
            "גלידה או שוקולד?",

            "אנדרואיד או אייפון?",
            "מחשב או קונסולה?",
            "מוזיקה חזקה או שקטה?",
            "ספרים או סרטים?",

            "מגיע מוקדם לכל מקום או תמיד באיחור?",
            "חדר מבולגן או מסודר בצורה מושלמת?",

            "להיות בלתי נראה או לדעת לעוף?",
            "לקרוא מחשבות או להשתגר?",
            "כסף ללא הגבלה או זמן פנוי ללא הגבלה?",
            "לא לישון יותר או לא לאכול יותר?",

            "תמיד חם מדי או תמיד קר מדי?",
            "לוותר על הטלפון או על המחשב?",

            "תאר את מצב הרוח שלך במילה אחת.",
            "מילה אחת: האישיות שלך?",
            "מילה אחת: רמת האנרגיה שלך כרגע?",

            "מה אוכל הנחמה האהוב עליך?",
            "איזה שיר מתנגן אצלך בלופ לאחרונה?",
            "מה האימוג'י האהוב עליך?",
            "באיזו מיומנות אקראית אתה טוב באופן מפתיע?",

            "מה החטיף האשם האהוב עליך?",
            "מה הדרך האהובה עליך לבזבז זמן?",
            "מה משהו חדש שלמדת לאחרונה?",
            "מה המשקה ה'ברירת מחדל' שלך?",

            "קיבלת כוח על ליום אחד — איזה כוח?",
            "אפשר למחוק מטלה אחת מהחיים — איזו?",
            "אפשר לאכול רק מאכל אחד לנצח — מה הוא?",
            "אפשר לנסוע בזמן פעם אחת — לעבר או לעתיד?",

            "נתקעת במעלית — את מי היית רוצה איתך?",
            "זכית בטיול חינם — לאן אתה נוסע?"
    );

    private final Random random = new Random();

    private List<String> getStartersForLanguage(String language) {
        return "HEBREW".equalsIgnoreCase(language)
                ? hebrewStarters
                : englishStarters;
    }

    public String getRandomStarter(String language) {
        List<String> starters = getStartersForLanguage(language);
        return starters.get(random.nextInt(starters.size()));
    }

    public List<String> getAllStarters(String language) {
        return getStartersForLanguage(language);
    }
}