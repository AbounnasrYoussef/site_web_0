from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import ContactMessage, SessionLocal, engine
from schemas import ContactForm, ContactMessageOut

app = FastAPI(title="Kharita - yabounna backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Kharita backend is running"}


@app.get("/health/db")
def check_db():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"database": "connected"}


@app.post("/contact", status_code=201)
def create_contact(form: ContactForm, db: Session = Depends(get_db)):
    new_message = ContactMessage(
        name=form.name,
        email=form.email,
        message=form.message,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {"id": new_message.id, "status": "received"}


@app.get("/contact", response_model=list[ContactMessageOut])
def list_contacts(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()