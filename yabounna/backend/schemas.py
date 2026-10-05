from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactForm(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=1, max_length=2000)


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    message: str
    created_at: datetime