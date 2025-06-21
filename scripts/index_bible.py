import json
from sentence_transformers import SentenceTransformer
import os

# Load Bible text
with open("scripts/arabic_bible.json", "r", encoding="utf-8") as f:
    verses = json.load(f)

# Load multilingual model
model = SentenceTransformer("distiluse-base-multilingual-cased-v1")

# Build vector index
index = []
for entry in verses:
    text = entry["text"]
    embedding = model.encode(text).tolist()
    index.append({
        "book": entry["book"],
        "chapter": entry["chapter"],
        "verse": entry["verse"],
        "text": text,
        "embedding": embedding
    })

# Ensure public folder exists
os.makedirs("public", exist_ok=True)

# Save to /public
with open("public/bible_index.json", "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False, indent=2)

print("✅ bible_index.json created in /public")
