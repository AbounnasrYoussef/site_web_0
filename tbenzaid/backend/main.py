from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from rag import (
    profiles,
    sessions,
    build_system_prompt,
    call_llm,
    classify_question,
    get_path_context,
    get_profile_from_pdf,
    read_all,
    get_similar_paths,
)




class ProfileRequest(BaseModel):
    user_id: str
    nom: str
    age: str
    bac: str
    moyenne: str
    job: str


class ChatRequest(BaseModel):
    user_id: str
    question: str
    locale: str = "en"
    
    
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/read")
def read():
    read_all()



@app.post("/profile")
def create_profile(req: ProfileRequest):
    profile_text = f"Nom: {req.nom}\nAge: {req.age}\nBac: {req.bac}\nMoyenne bac: {req.moyenne}\nMetier vise: {req.job}"
    profiles[req.user_id] = profile_text
    return profile_text

@app.delete("/chat/{user_id}")
def reset_chat(user_id: str):
    sessions.pop(user_id, None)
    return {"message": "Chat reset successfully"}


@app.post("/chat")
def chat(req: ChatRequest):
    language_map = {
        "en": "English",
        "fr": "French",
        "ar": "Arabic",
    }

    language = language_map.get(req.locale, "English")

    profile_text = get_profile_from_pdf(req.user_id)

    if profile_text is None:
        profile_text = profiles.get(req.user_id)

    if profile_text is None:
        return "profile_not_found"

    if req.user_id not in sessions:
        sessions[req.user_id] = [
            {
                "role": "system",
                "content": build_system_prompt(profile_text)
            }
        ]

    category = classify_question(req.question, profile_text)

    user_message = f"""
    LANGUAGE:
    Respond entirely in {language}.
    The application selected this language.

    USER QUESTION:
    {req.question}
    """
    if category == "OUT_OF_DOMAIN":
        return {
            "answer": {
                "en": "I can only help with education and career guidance in Morocco — universities, schools, programs, admissions, studies, jobs, and career paths.",
                "fr": "Je peux uniquement vous aider concernant l'éducation et l'orientation professionnelle au Maroc — universités, écoles, formations, admissions, études, métiers et parcours professionnels.",
                "ar": "يمكنني مساعدتك فقط في التعليم والتوجيه الدراسي والمهني في المغرب — الجامعات والمدارس والتكوينات والقبول والدراسة والمهن والمسارات المهنية."
            }.get(req.locale, "I can only help with education and career guidance in Morocco.")
        }

    elif category == "MY_PATH":
        path_context = get_path_context(req.user_id, req.question)

        if path_context:
            user_message = f"""
            LANGUAGE:
            Respond entirely in {language}.

            USER'S OWN PATH:
            {path_context}
            STRICT RULE:
            Do NOT add any information from your own knowledge.
            Do NOT invent or recommend other schools, cities, diplomas, certifications, durations, or alternatives.
            You may translate the path into {language}, but you must preserve all its steps and information.

            USER QUESTION:
            {req.question}
            """
    
    elif category == "CAREER_PATH":
        path_context = get_similar_paths(req.question)

        if path_context:
            user_message = f"""
            LANGUAGE:
            Respond entirely in {language}.

            RELEVANT CAREER PATHS:
            {path_context}

            STRICT RULE:
            Do NOT add any information from your own knowledge.
            Do NOT invent or recommend other schools, cities, diplomas, certifications, durations, or alternatives.
            You may translate the path into {language}, but you must preserve all its steps and information.

            USER QUESTION:
            {req.question}
            """

    elif category == "PERSONNEL":
        profile_text = get_profile_from_pdf(req.user_id)

        if profile_text:
            user_message = f"""
            LANGUAGE:
            Respond entirely in {language}.

            USER PROFILE:
            {profile_text}

            USER QUESTION:
            {req.question}
            """

    sessions[req.user_id].append({
        "role": "user",
        "content": user_message
    })

    try:
        answer = call_llm(sessions[req.user_id])
    except Exception as e:
        sessions[req.user_id].pop()
        return {"error": str(e)}

    sessions[req.user_id].append({
        "role": "assistant",
        "content": answer
    })

    return {"answer": answer}