import json
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import SessionLocal, ContactMessage, University, UniversityTranslation, Campus
import os
from database import DEV

app = FastAPI()


# CORS : autorise le frontend (localhost:3000) à parler au backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ContactForm(BaseModel):
    name: str
    email: str
    message: str


@app.get("/")
def read_root():
    return {"message": "Kharita backend is running"}


@app.post("/contact")
def create_contact_message(form: ContactForm, db: Session = Depends(get_db)):
    new_message = ContactMessage(
        name=form.name,
        email=form.email,
        message=form.message,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {"success": True, "id": new_message.id}


@app.get("/contact")
def get_all_messages(db: Session = Depends(get_db)):
    messages = db.query(ContactMessage).all()
    return messages


@app.post("/universities")
async def create_university(request: Request, db: Session = Depends(get_db)):
    form = await request.form()

    # نقراو البيانات النصية العادية
    abbreviation = form.get("abbreviation")
    university_type = form.get("type")
    has_dorms = form.get("has_dorms")
    has_scholarship = form.get("has_scholarship")

    # نقراو الـ JSON strings و نبدلوهم لـ Python objects
    translations_data = json.loads(form.get("translations"))
    campuses_data = json.loads(form.get("campuses"))

    # نصاوبو الجامعة الأساسية
    new_university = University(
        abbreviation=abbreviation,
        type=university_type,
        has_dorms=has_dorms,
        has_scholarship=has_scholarship,
    )
    db.add(new_university)
    db.flush()  # كيخلينا نحصلو على new_university.id بلا ما نديرو commit نهائي بعد

    # نزيدو الترجمات (English, French, Arabic)
    for language, fields in translations_data.items():
        translation = UniversityTranslation(
            university_id=new_university.id,
            language=language,
            name=fields["name"],
            description=fields["description"],
        )
        db.add(translation)

    # نزيدو les campuses، مع الصور المرتبطة بيهم
    for i, campus_data in enumerate(campuses_data):
        image_file = form.get(f"campus_image_{i}")
        image_path = None
        if DEV:
            image_path = "../../storage/uploads"
        else:
            image_path = "./uploads"
        if image_file and hasattr(image_file, "filename") and image_file.filename:
            image_path = + f"/{image_file.filename}"
            with open(image_path, "wb") as buffer:
                buffer.write(await image_file.read())

        campus = Campus(
            university_id=new_university.id,
            city=campus_data.get("city"),
            maps_link=campus_data.get("mapsLink"),
            website=campus_data.get("website"),
            image_path=image_path,
        )
        db.add(campus)

    db.commit()
    return {"success": True, "id": new_university.id}


@app.get("/universities")
def get_all_universities(db: Session = Depends(get_db)):
    universities = db.query(University).all()
    result = []
    for uni in universities:
        result.append({
            "id": uni.id,
            "abbreviation": uni.abbreviation,
            "type": uni.type,
            "has_dorms": uni.has_dorms,
            "has_scholarship": uni.has_scholarship,
            "translations": [
                {"language": t.language, "name": t.name, "description": t.description}
                for t in uni.translations
            ],
            "campuses": [
                {
                    "city": c.city,
                    "maps_link": c.maps_link,
                    "website": c.website,
                    "image_path": c.image_path,
                }
                for c in uni.campuses
            ],
        })
    return result