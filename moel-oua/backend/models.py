import os
from peewee import (
    Model, UUIDField, CharField, TextField, IntegerField,
    SmallIntegerField, DecimalField, BooleanField, ForeignKeyField,
)
from playhouse.db_url import connect

db = connect(os.environ["DATABASE_URL"])

DEFAULT_LOCALE = "EN"
LOCALES = ("EN", "FR", "AR")


def translate(translations, locale):
    by_locale = {translation.locale: translation for translation in translations}
    return by_locale.get(locale) or by_locale.get(DEFAULT_LOCALE)


class BaseModel(Model):
    id = UUIDField(primary_key=True)

    class Meta:
        database = db


class Category(BaseModel):
    name = CharField()

    class Meta:
        table_name = "categories"


class Diploma(BaseModel):
    code = CharField()
    rank = IntegerField()

    class Meta:
        table_name = "diplomas"


class DiplomaTranslation(BaseModel):
    diploma = ForeignKeyField(Diploma, backref="translations")
    locale = CharField()
    name = CharField()

    class Meta:
        table_name = "diploma_translations"


class City(BaseModel):
    class Meta:
        table_name = "cities"


class CityTranslation(BaseModel):
    city = ForeignKeyField(City, backref="translations")
    locale = CharField()
    name = CharField()

    class Meta:
        table_name = "city_translations"


class University(BaseModel):
    type = CharField()
    is_approved = BooleanField()
    internat_available = BooleanField()
    bourse_available = BooleanField()
    abreviation = TextField(null=True)

    class Meta:
        table_name = "universities"


class UniversityTranslation(BaseModel):
    university = ForeignKeyField(University, backref="translations")
    locale = CharField()
    name = CharField()
    description = TextField(null=True)

    class Meta:
        table_name = "university_translations"


class UniversityLocation(BaseModel):
    university = ForeignKeyField(University, backref="locations")
    city = ForeignKeyField(City, backref="locations")
    address = TextField(null=True)
    website = TextField(null=True)
    longitude = DecimalField(null=True)
    latitude = DecimalField(null=True)
    image_url = TextField(null=True)

    class Meta:
        table_name = "university_locations"


class JobTitle(BaseModel):
    salary = IntegerField()

    class Meta:
        table_name = "job_titles"


class JobTitleTranslation(BaseModel):
    job_title = ForeignKeyField(JobTitle, backref="translations")
    locale = CharField()
    title = TextField()

    class Meta:
        table_name = "job_titles_translations"


class Program(BaseModel):
    university = ForeignKeyField(University, backref="programs")
    category = ForeignKeyField(Category, backref="programs")
    output_diploma = ForeignKeyField(Diploma, backref="programs", null=True)
    years_of_study = SmallIntegerField()
    monthly_subscription = DecimalField(null=True)
    max_age = SmallIntegerField(null=True)
    has_concours = BooleanField()
    diploma_recognition_morocco_status = CharField(null=True)
    diploma_recognition_abroad_status = CharField(null=True)
    is_approved = BooleanField()

    class Meta:
        table_name = "programs"


class ProgramTranslation(BaseModel):
    program = ForeignKeyField(Program, backref="translations")
    locale = CharField()
    name = CharField()

    class Meta:
        table_name = "program_translations"


class ProgramRequirement(BaseModel):
    program = ForeignKeyField(Program, backref="requirements")
    required_diploma = ForeignKeyField(Diploma, backref="required_by", null=True)
    min_grade = DecimalField(null=True)
    max_years_since_graduation = SmallIntegerField(null=True)

    class Meta:
        table_name = "program_requirements"


class ProgramJobTitle(BaseModel):
    program = ForeignKeyField(Program, backref="jobs")
    job_title = ForeignKeyField(JobTitle, backref="programs")

    class Meta:
        table_name = "program_job_titles"
