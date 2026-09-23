import json
import os
import uuid

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import (
    Base,
    Campus,
    ContactMessage,
    SessionLocal,
    University,
    UniversityTranslation,
    engine,
)


app = FastAPI(
    title="Kharita Backend",
    version="1.0.0",
)


# -------------------------------------------------------------------
# DATABASE
# -------------------------------------------------------------------

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# UPLOADS
# -------------------------------------------------------------------

UPLOAD_DIR = "/usr/src/app/uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------------------------------------------------
# SCHEMAS
# -------------------------------------------------------------------

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str


# -------------------------------------------------------------------
# ROOT
# -------------------------------------------------------------------

@app.get("/")
def read_root():
    return {
        "message": "Kharita backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# -------------------------------------------------------------------
# CONTACT
# -------------------------------------------------------------------

@app.post("/contact")
def create_contact_message(
    form: ContactForm,
    db: Session = Depends(get_db),
):
    new_message = ContactMessage(
        name=form.name,
        email=form.email,
        message=form.message,
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {
        "success": True,
        "id": new_message.id,
    }


@app.get("/contact")
def get_all_messages(
    db: Session = Depends(get_db),
):
    messages = db.query(ContactMessage).all()

    return messages


# -------------------------------------------------------------------
# UNIVERSITIES
# -------------------------------------------------------------------

@app.post("/universities")
async def create_university(
    request: Request,
    db: Session = Depends(get_db),
):
    form = await request.form()

    abbreviation = form.get("abbreviation")
    university_type = form.get("type")
    has_dorms = form.get("has_dorms")
    has_scholarship = form.get("has_scholarship")

    translations_raw = form.get("translations")
    campuses_raw = form.get("campuses")

    if not translations_raw:
        raise HTTPException(
            status_code=400,
            detail="translations is required",
        )

    if not campuses_raw:
        raise HTTPException(
            status_code=400,
            detail="campuses is required",
        )

    try:
        translations_data = json.loads(str(translations_raw))
        campuses_data = json.loads(str(campuses_raw))
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON in translations or campuses",
        )

    # Convert boolean values coming from FormData
    has_dorms_value = str(has_dorms).lower() == "true"
    has_scholarship_value = (
        str(has_scholarship).lower() == "true"
    )

    new_university = University(
        abbreviation=str(abbreviation),
        type=str(university_type),
        has_dorms=has_dorms_value,
        has_scholarship=has_scholarship_value,
    )

    db.add(new_university)
    db.flush()

    # ---------------------------------------------------------------
    # TRANSLATIONS
    # ---------------------------------------------------------------

    for language, fields in translations_data.items():
        translation = UniversityTranslation(
            university_id=new_university.id,
            language=language,
            name=fields["name"],
            description=fields["description"],
        )

        db.add(translation)

    # ---------------------------------------------------------------
    # CAMPUSES
    # ---------------------------------------------------------------

    for index, campus_data in enumerate(campuses_data):
        image_file = form.get(f"campus_image_{index}")

        image_path = None

        if (
            isinstance(image_file, UploadFile)
            and image_file.filename
        ):
            extension = os.path.splitext(
                image_file.filename
            )[1]

            filename = f"{uuid.uuid4()}{extension}"

            full_path = os.path.join(
                UPLOAD_DIR,
                filename,
            )

            with open(full_path, "wb") as buffer:
                buffer.write(
                    await image_file.read()
                )

            image_path = f"/uploads/{filename}"

        campus = Campus(
            university_id=new_university.id,
            city=campus_data.get("city"),
            maps_link=campus_data.get("mapsLink"),
            website=campus_data.get("website"),
            image_path=image_path,
        )

        db.add(campus)

    db.commit()

    return {
        "success": True,
        "id": new_university.id,
    }


# -------------------------------------------------------------------
# GET UNIVERSITIES
# -------------------------------------------------------------------

@app.get("/universities")
def get_all_universities(
    db: Session = Depends(get_db),
):
    universities = db.query(University).all()

    result = []

    for university in universities:
        result.append(
            {
                "id": university.id,
                "abbreviation": university.abbreviation,
                "type": university.type,
                "has_dorms": university.has_dorms,
                "has_scholarship": university.has_scholarship,
                "translations": [
                    {
                        "language": translation.language,
                        "name": translation.name,
                        "description": translation.description,
                    }
                    for translation in university.translations
                ],
                "campuses": [
                    {
                        "city": campus.city,
                        "maps_link": campus.maps_link,
                        "website": campus.website,
                        "image_path": campus.image_path,
                    }
                    for campus in university.campuses
                ],
            }
        )

    return result