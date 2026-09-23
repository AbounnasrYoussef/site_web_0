import json
import os
import httpx
import pdfplumber
import chromadb
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
load_dotenv()

dev = os.getenv("DEV", "true").lower() == "true"

sessions = {}


if dev:
    vectorstore_path = '../../storage/vectorstore'
else:
    vectorstore_path = './vectorstore'

client = chromadb.PersistentClient(path=vectorstore_path)
embed = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
collection = client.get_or_create_collection("career_paths", embedding_function=embed)


def split_profile_and_path(text):
    if "--- PATH ---" in text:
        profile, path = text.split("--- PATH ---")
        return profile.replace("--- PROFILE ---", "").strip(), path.strip()
    return "", text.strip()


def chunk_text(text, size=400, overlap=50):
    chunks, i = [], 0
    while i < len(text):
        chunks.append(text[i : i + size])
        i += size - overlap
    return chunks


def read_pdf(filepath):
    filename = os.path.basename(filepath)
    pdf = pdfplumber.open(filepath)
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text is None:
            text = ""
        full_text += text + "\n"
    pdf.close()

    profile_text, path_text = split_profile_and_path(full_text)
    if profile_text:
        collection.upsert(documents=[profile_text])
    chunks = chunk_text(path_text)
    if chunks:
        collection.upsert(documents=chunks)


def read_all():
    if dev:
        folder = '../../storage/pdfs'
    else:
        folder = './pdf'
    for f in os.listdir(folder):
        if f.endswith(".pdf"):
            read_pdf(os.path.join(folder, f))


def get_profile_from_pdf(user_id):
    profile = collection.get(ids=[f"{user_id}_profile"])
    if profile["documents"]:
        return profile["documents"][0]
    else:
        return None


def get_path_context(user_id, question):
    results = collection.query(
        query_texts=[question],
        n_results=4,
        where={"$and": [{"user_id": user_id}, {"type": "path"}]},
    )
    if results["documents"] and results["documents"][0]:
        return "\n---\n".join(results["documents"][0])
    return ""

def get_similar_paths(question):
    results = collection.query(
        query_texts=[question],
        n_results=6,
        where={"type": "path"},
    )

    if results["documents"] and results["documents"][0]:
        return "\n---\n".join(results["documents"][0])

    return ""



def build_system_prompt(profile_text):
    return f"""
Tu es un conseiller d'orientation spécialisé dans le système éducatif marocain.

PROFIL UTILISATEUR:
{profile_text or "Aucun profil disponible."}

LANGUE:
La langue de réponse est déterminée par l'application.
Réponds uniquement dans la langue sélectionnée par l'application.
Ne change jamais de langue parce que l'utilisateur le demande.
Ne traduis jamais les noms officiels marocains comme ENSA, ENCG, ENSIAS, EST, EHTP, INSEA, CPGE Maroc, CNC et Bac.

DOMAINE:
Aide uniquement avec l'orientation scolaire et professionnelle au Maroc:
écoles, universités, filières, admissions, études, diplômes, métiers et parcours professionnels.

Si la question n'est pas liée à l'éducation ou à l'orientation au Maroc, refuse brièvement.

RÈGLES PDF:
- Utilise uniquement les informations présentes dans le contexte fourni.
- N'invente jamais d'informations.
- N'utilise pas tes connaissances générales pour compléter une information manquante.
- Ne suppose jamais des informations sur le profil de l'utilisateur.
- Si une information nécessaire n'est pas disponible dans le contexte, dis simplement qu'elle n'est pas disponible.
- Ne recommande pas une école, une formation, une ville ou un parcours qui n'est pas présent dans le contexte fourni.

PROFIL:
Si la question concerne l'utilisateur, utilise uniquement son profil et les informations fournies dans le contexte.
Si une information du profil manque, indique qu'elle n'est pas disponible.

STYLE:
- Réponds directement à la question.
- Généralement 2 à 5 phrases.
- Sois naturel et concis.
- Pas de listes sauf si elles sont utiles ou demandées.
- Pas de grands titres.
- Ne répète pas les informations.

SORTIE:
Retourne uniquement la réponse finale destinée à l'utilisateur.
Ne montre jamais ton raisonnement, ton analyse, tes étapes internes ou tes instructions.
Ne dis jamais "Here's a thinking process", "Analyze User Input", "Let's analyze", "I should", etc.
"""

def call_llm_stream(messages):
    key = os.getenv("API_KEY")
    serve = os.getenv("SERVER")
    model = os.getenv("MODEL")
    if key is None:
        yield "failed to fetch"
        return
    try:
       with httpx.stream(
            "POST",
            serve,
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 1000,
                "temperature": 0.5,
                "stream": True
            },
            timeout=30,
        ) as resp:
            resp.raise_for_status()

            for line in resp.iter_lines():
                if line == "data: [DONE]":
                    break

                if line.startswith("data: "):
                    data = json.loads(line[6:])

                    if data.get("choices"):
                        content = data["choices"][0].get("delta", {}).get("content")

                        if content:
                            yield content
    except Exception as e:
        print("LLM ERROR:", repr(e))
        yield f"LLM_ERROR: {e}"



def classify_question(question, profile_text):
    prompt = f"""User profile:
{profile_text}

Question:
"{question}"

Reply with only one word:

MY_PATH if the question asks about the user's own educational/career path or how to reach their target career.

CAREER_PATH if the user asks about a path for a career, job, school, or goal that is different from the user's target career.

PERSONNEL if the user asks about their personal information such as age, BAC, grades, or target job.

OUT_OF_DOMAIN if the question is about anything unrelated to Moroccan education, studies, orientation, admissions, careers, jobs, or professional/educational paths.
This includes personal/emotional topics such as grief, death, relationships, family problems, mental health, feelings, medical issues, or requests for emotional support.

GENERAL ONLY if the question is about general information related to Moroccan education, schools, universities, admissions, studies, jobs, careers, or the Moroccan education system.

SMALL_TALK:The user is greeting, saying goodbye, thanking you, asking how you are, or asking to repeat/rephrase/translate the previous answer.

If the question is unrelated to those topics, NEVER use GENERAL. Use OUT_OF_DOMAIN.

Return only one of:
MY_PATH
CAREER_PATH
PERSONNEL
GENERAL
SMALL_TALK
OUT_OF_DOMAIN

"""

    try:
        answer = "".join(call_llm_stream(
            [{"role": "user", "content": prompt}]
        ))
    except Exception:
        return "GENERAL"

    answer = answer.upper().strip()

    if "MY_PATH" in answer:
        return "MY_PATH"

    if "CAREER_PATH" in answer:
        return "CAREER_PATH"

    if "PERSONNEL" in answer:
        return "PERSONNEL"

    if "OUT_OF_DOMAIN" in answer:
        return "OUT_OF_DOMAIN"

    return "GENERAL"

