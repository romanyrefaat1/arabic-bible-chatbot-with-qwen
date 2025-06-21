import json

with open("scripts/arabic_bible_original.json", "r", encoding="utf-8-sig") as f:
    data = json.load(f)

output = []

book_map = {
    "gn": "التكوين",
    "ex": "الخروج",
    "lv": "اللاويين",
    "nm": "العدد",
    "dt": "التثنية",
    "js": "يشوع",
    "jd": "القضاة",
    "ru": "راعوث",
    "1sa": "صموئيل الأول",
    "2sa": "صموئيل الثاني",
    "1ki": "الملوك الأول",
    "2ki": "الملوك الثاني",
    "1ch": "أخبار الأيام الأول",
    "2ch": "أخبار الأيام الثاني",
    "ezr": "عزرا",
    "ne": "نحميا",
    "et": "أستير",
    "jb": "أيوب",
    "ps": "المزامير",
    "pr": "الأمثال",
    "ec": "الجامعة",
    "so": "نشيد الأنشاد",
    "is": "إشعياء",
    "je": "إرميا",
    "la": "مراثي إرميا",
    "ez": "حزقيال",
    "da": "دانيال",
    "ho": "هوشع",
    "jl": "يوئيل",
    "am": "عاموس",
    "ob": "عوبديا",
    "jo": "يونان",
    "mic": "ميخا",
    "na": "ناحوم",
    "hk": "حبقوق",
    "zp": "صفنيا",
    "hg": "حجي",
    "zc": "زكريا",
    "ml": "ملاخي",
    "mt": "متى",
    "mr": "مرقس",
    "lk": "لوقا",
    "jn": "يوحنا",
    "ac": "أعمال الرسل",
    "ro": "رومية",
    "1co": "كورنثوس الأولى",
    "2co": "كورنثوس الثانية",
    "ga": "غلاطية",
    "ep": "أفسس",
    "php": "فيلبي",
    "co": "كولوسي",
    "1th": "تسالونيكي الأولى",
    "2th": "تسالونيكي الثانية",
    "1ti": "تيموثاوس الأولى",
    "2ti": "تيموثاوس الثانية",
    "tt": "تيطس",
    "phm": "فليمون",
    "heb": "العبرانيين",
    "jas": "يعقوب",
    "1pe": "بطرس الأولى",
    "2pe": "بطرس الثانية",
    "1jn": "يوحنا الأولى",
    "2jn": "يوحنا الثانية",
    "3jn": "يوحنا الثالثة",
    "jud": "يهوذا",
    "re": "رؤيا يوحنا"
}

for book_entry in data:
    abbrev = book_entry["abbrev"]
    book_name = book_map.get(abbrev, abbrev)
    for chapter_idx, chapter in enumerate(book_entry["chapters"], start=1):
        for verse_idx, verse_text in enumerate(chapter, start=1):
            output.append({
                "book": book_name,
                "chapter": chapter_idx,
                "verse": verse_idx,
                "text": verse_text
            })

with open("scripts/arabic_bible.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Converted arabic_bible.json saved.")
