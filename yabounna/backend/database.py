from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
from dotenv import load_dotenv
import os 

load_dotenv()

DEV = os.getenv('DEV', True)
if DEV:
    DATABASE_URL = "sqlite:///./kharita.db"
else:
    DATABASE_URL = os.getenv("DATABASE_URL", None)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    abbreviation = Column(String, nullable=False)
    type = Column(String, nullable=False)
    has_dorms = Column(String, nullable=False)
    has_scholarship = Column(String, nullable=False)

    translations = relationship(
        "UniversityTranslation", back_populates="university", cascade="all, delete"
    )
    campuses = relationship(
        "Campus", back_populates="university", cascade="all, delete"
    )


class UniversityTranslation(Base):
    __tablename__ = "university_translations"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    language = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)

    university = relationship("University", back_populates="translations")


class Campus(Base):
    __tablename__ = "campuses"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    city = Column(String, nullable=False)
    maps_link = Column(String, nullable=True)
    website = Column(String, nullable=True)
    image_path = Column(String, nullable=True)

    university = relationship("University", back_populates="campuses")


Base.metadata.create_all(bind=engine)