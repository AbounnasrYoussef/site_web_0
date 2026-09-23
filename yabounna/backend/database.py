import os
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")


engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

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
    has_dorms = Column(Boolean, nullable=False)
    has_scholarship = Column(Boolean, nullable=False)

    translations = relationship(
        "UniversityTranslation",
        back_populates="university",
        cascade="all, delete-orphan",
    )

    campuses = relationship(
        "Campus",
        back_populates="university",
        cascade="all, delete-orphan",
    )


class UniversityTranslation(Base):
    __tablename__ = "university_translations"

    id = Column(Integer, primary_key=True, index=True)

    university_id = Column(
        Integer,
        ForeignKey("universities.id"),
        nullable=False,
    )

    language = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)

    university = relationship(
        "University",
        back_populates="translations",
    )


class Campus(Base):
    __tablename__ = "campuses"

    id = Column(Integer, primary_key=True, index=True)

    university_id = Column(
        Integer,
        ForeignKey("universities.id"),
        nullable=False,
    )

    city = Column(String, nullable=False)
    maps_link = Column(String, nullable=True)
    website = Column(String, nullable=True)
    image_path = Column(String, nullable=True)

    university = relationship(
        "University",
        back_populates="campuses",
    )


Base.metadata.create_all(bind=engine)