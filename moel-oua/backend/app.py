import os
from datetime import date
from uuid import UUID
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from peewee import prefetch
from models import (
    db, translate, DEFAULT_LOCALE, LOCALES,
    University, UniversityTranslation, UniversityLocation, City, CityTranslation,
    Diploma, DiplomaTranslation, JobTitle, JobTitleTranslation,
    Program, ProgramTranslation, ProgramRequirement, ProgramJobTitle,
)
from path_finder import find_paths

app = Flask(__name__)
CORS(app, origins=[os.environ["FRONTEND_URL"]])
Limiter(get_remote_address, app=app, default_limits=[os.environ.get("RATE_LIMIT", "60 per minute")])


@app.before_request
def open_db():
    db.connect(reuse_if_open=True)


@app.teardown_request
def close_db(error):
    if not db.is_closed():
        db.close()


def get_locale():
    locale = request.args.get("locale", DEFAULT_LOCALE).upper()
    return locale if locale in LOCALES else DEFAULT_LOCALE


def get_uuid(name):
    try:
        return UUID(request.args.get(name, ""))
    except ValueError:
        return None


def get_number(name, low, high, cast=float):
    """Optional numeric query param: None when absent, ValueError when out of range."""
    raw = request.args.get(name, "").strip()
    if not raw:
        return None
    value = cast(raw)
    if not low <= value <= high:
        raise ValueError(name)
    return value


def get_student():
    year = date.today().year
    return {
        "grade": get_number("grade", 0, 20),
        "birth_year": get_number("birth_year", 1900, year, int),
        "graduation_year": get_number("graduation_year", 1950, year, int),
    }


def number(value):
    return float(value) if value is not None else None


def name_of(translations, locale):
    translation = translate(translations, locale)
    return translation.name if translation else None


def get_diploma_names(locale):
    diplomas = prefetch(Diploma.select(), DiplomaTranslation)
    return {diploma.id: name_of(diploma.translations, locale) or diploma.code for diploma in diplomas}


def job_to_dict(job_title, locale):
    translation = translate(job_title.translations, locale)
    return {
        "id": job_title.id,
        "title": translation.title if translation else None,
        "salary": job_title.salary,
    }


def requirement_to_dict(requirement, diploma_names):
    return {
        "required_diploma": diploma_names.get(requirement.required_diploma_id),
        "min_grade": number(requirement.min_grade),
    }


def program_to_dict(program, locale, diploma_names):
    university = program.university
    translation = translate(university.translations, locale)
    location = university.locations[0] if university.locations else None
    return {
        "id": program.id,
        "prog_name": name_of(program.translations, locale),
        "years_of_study": program.years_of_study,
        "monthly_subscription": number(program.monthly_subscription),
        "max_age": program.max_age,
        "has_concours": program.has_concours,
        "recognition_morocco": program.diploma_recognition_morocco_status,
        "recognition_abroad": program.diploma_recognition_abroad_status,
        "output_diploma": diploma_names.get(program.output_diploma_id),
        "uni_name": translation.name if translation else university.abreviation,
        "uni_desc": translation.description if translation else None,
        "uni_abrv": university.abreviation,
        "uni_type": university.type,
        "uni_image": location.image_url if location else None,
        "uni_website": location.website if location else None,
        "uni_address": location.address if location else None,
        "internat_available": university.internat_available,
        "bourse_available": university.bourse_available,
        "requirements": [requirement_to_dict(r, diploma_names) for r in program.requirements],
        "job_titles": [job_to_dict(j.job_title, locale) for j in program.jobs],
    }


def location_to_dict(location, locale):
    university = location.university
    return {
        "id": location.id,
        "university_id": university.id,
        "name": name_of(university.translations, locale) or university.abreviation,
        "abrv": university.abreviation,
        "type": university.type,
        "city": name_of(location.city.translations, locale),
        "address": location.address,
        "website": location.website,
        "latitude": number(location.latitude),
        "longitude": number(location.longitude),
    }


@app.route("/api/paths")
def get_paths():
    category_id = get_uuid("category_id")
    diploma_id = get_uuid("diploma_id")
    if category_id is None or diploma_id is None:
        return jsonify({"error": "category_id and diploma_id must be valid ids"}), 400

    try:
        student = get_student()
    except ValueError:
        return jsonify({"error": "grade, birth_year and graduation_year must be valid numbers"}), 400

    locale = get_locale()
    paths = find_paths(category_id, diploma_id, student)
    program_ids = {program.id for path in paths for program in path["programs"]}
    programs = prefetch(
        Program.select().where(Program.id.in_(program_ids)),
        ProgramTranslation, ProgramRequirement, ProgramJobTitle, JobTitle, JobTitleTranslation,
        University, UniversityTranslation, UniversityLocation,
    )
    diploma_names = get_diploma_names(locale)
    details = {program.id: program_to_dict(program, locale, diploma_names) for program in programs}
    return jsonify({"paths": [
        {**path, "programs": [details[program.id] for program in path["programs"]]} for path in paths
    ]})


@app.route("/api/universities")
def get_universities():
    locale = get_locale()
    approved = UniversityLocation.select().join(University).where(
        University.is_approved == True,
        UniversityLocation.latitude.is_null(False),
        UniversityLocation.longitude.is_null(False),
    )
    locations = prefetch(approved, University, UniversityTranslation, City, CityTranslation)
    return jsonify({"universities": [location_to_dict(location, locale) for location in locations]})


@app.route("/api/universities/<uuid:university_id>")
def get_university(university_id):
    locale = get_locale()
    university = University.get_or_none(University.id == university_id, University.is_approved == True)
    if university is None:
        return jsonify({"error": "university not found"}), 404

    translation = translate(university.translations, locale)
    locations = prefetch(
        UniversityLocation.select().where(UniversityLocation.university == university),
        University, UniversityTranslation, City, CityTranslation,
    )
    programs = prefetch(
        Program.select().where(Program.university == university, Program.is_approved == True),
        ProgramTranslation, ProgramRequirement, ProgramJobTitle, JobTitle, JobTitleTranslation,
        University, UniversityTranslation, UniversityLocation,
    )
    diploma_names = get_diploma_names(locale)
    return jsonify({"university": {
        "id": university.id,
        "name": translation.name if translation else university.abreviation,
        "description": translation.description if translation else None,
        "abrv": university.abreviation,
        "type": university.type,
        "internat_available": university.internat_available,
        "bourse_available": university.bourse_available,
        "image": next((location.image_url for location in locations if location.image_url), None),
        "locations": [location_to_dict(location, locale) for location in locations],
        "programs": [program_to_dict(program, locale, diploma_names) for program in programs],
    }})
