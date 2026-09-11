from flask import Flask, request, render_template, jsonify
from path_finder import PathFinder
from flask_admin import Admin
from flask_admin.contrib.peewee import ModelView
from flask_cors import CORS
from models import (
    db, JobTitle, Diploma, Program, University, Category, User, 
    ProgramJobTitle, ProgramRequirement, CategoryTranslation, 
    DiplomaTranslation, UniversityTranslation, ProgramTranslation
)
from admin.admin import ProgramView, RequirementView, DiplomaView, UniversityView
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'testing'

admin = Admin(app, name='Admin')

admin.add_view(ModelView(Category))
admin.add_view(ModelView(JobTitle))
admin.add_view(UniversityView(University))
admin.add_view(DiplomaView(Diploma))
admin.add_view(ModelView(User))
admin.add_view(ProgramView(Program))
admin.add_view(RequirementView(ProgramRequirement))
admin.add_view(ModelView(CategoryTranslation))
admin.add_view(ModelView(DiplomaTranslation))
admin.add_view(ModelView(UniversityTranslation))
admin.add_view(ModelView(ProgramTranslation))

@app.before_request
def before_request():
    db.connect()

@app.teardown_request
def teardown_request(exc):
    if not db.is_closed():
        db.close()


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/categories")
def get_categories():
    locale = request.args.get('locale', 'EN').upper()    
    query = (Category
             .select(Category.id, CategoryTranslation.name)
             .join(CategoryTranslation)
             .where(CategoryTranslation.locale == locale)
             .dicts())
             
    send = [
        {
            "id": str(item["id"]),
            "name": item["name"]
        }
        for item in query
    ]
    return jsonify(send)

@app.route("/api/diplomas")
def get_diplomas():
    locale = request.args.get('locale', 'EN').upper()    
    query = (Diploma
             .select(Diploma.id, DiplomaTranslation.name)
             .join(DiplomaTranslation)
             .where(DiplomaTranslation.locale == locale)
             .dicts())
             
    send = [
        {
            "id": str(item["id"]),
            "name": item["name"]
        }
        for item in query
    ]
    return jsonify(send)

def get_color_pair(program_id):
    NEO_COLORS = [
        {"color1": "#FFD166", "color2": "#06D6A0"},
        {"color1": "#FF9F1C", "color2": "#2EC4B6"},
        {"color1": "#9BF6FF", "color2": "#CAFFBF"},
        {"color1": "#FFADAD", "color2": "#FDFFB6"},
        {"color1": "#BDB2FF", "color2": "#FFC6FF"},
        {"color1": "#A8E6CF", "color2": "#DCEDC1"},
        {"color1": "#FF8B94", "color2": "#FFAAA5"},
        {"color1": "#81D4FA", "color2": "#E1BEE7"},
        {"color1": "#FFE082", "color2": "#80CBC4"},
        {"color1": "#F8A5C2", "color2": "#F190B7"},
        {"color1": "#C5E1A5", "color2": "#FFF59D"},
        {"color1": "#FFAB91", "color2": "#80DEEA"},
    ]
    idx = abs(hash(str(program_id))) % len(NEO_COLORS)
    return NEO_COLORS[idx]


@app.route("/api/job-titles")
def get_job_titles():
    jobs = JobTitle.select(JobTitle.id, JobTitle.title, JobTitle.salary).dicts()
    return jsonify([{"id": str(j["id"]), "title": j["title"], "salary": j["salary"]} for j in jobs])


@app.route("/api/find-paths", methods=["POST"])
def find_path():
   
    data = request.get_json(force=True)
    local_lang = data.get("local", None)
    category_id = data.get("category_id", None)
    starting_diploma_id = data.get("starting_diploma_id", None)
    job_title_id = data.get("job_title_id", None)
    finder = PathFinder()
    paths = finder.find_paths(category_id, starting_diploma_id)
    if isinstance(paths, dict) and "error" in paths:
        return jsonify({'data': []}), 200

    serialized_paths = []
    for path in paths:
        serialized_path = []
        path_job_ids = set()
        for program in path:
            for pjt in program.potential_jobs:
                path_job_ids.add(str(pjt.job_title.id))
        if job_title_id and job_title_id not in path_job_ids:
            continue
        for program in path:
            uni = program.university
            uni_translation = uni.translations.filter(locale='EN').first()
            uni_name = uni_translation.name if uni_translation else uni.abreviation or 'Unknown'
            uni_desc = uni_translation.description if uni_translation and uni_translation.description else ''
            uni_abrv = uni.abreviation or uni_name[:4].upper()
            uni_type = uni.type if hasattr(uni, 'type') else 'PUBLIC'
            colors = get_color_pair(program.id)

            output_dip_name = ''
            if program.output_diploma:
                dt = program.output_diploma.translations.filter(locale='EN').first()
                output_dip_name = dt.name if dt else program.output_diploma.code

            requirements = []
            for req in program.admission_requirements:
                req_dip_name = ''
                if req.required_diploma:
                    rdt = req.required_diploma.translations.filter(locale='EN').first()
                    req_dip_name = rdt.name if rdt else req.required_diploma.code
                requirements.append({
                    "required_diploma": req_dip_name,
                    "min_grade": float(req.min_grade) if req.min_grade else None,
                    "max_years_since_graduation": req.max_years_since_graduation,
                })

            job_titles = [
                {"id": str(pjt.job_title.id), "title": pjt.job_title.title, "salary": pjt.job_title.salary}
                for pjt in program.potential_jobs
            ]

            uni_loc = uni.locations.first() if hasattr(uni, 'locations') else None
            uni_image = uni_loc.image_url if uni_loc and uni_loc.image_url else 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'
            uni_website = uni_loc.website if uni_loc and uni_loc.website else ''
            uni_address = uni_loc.address if uni_loc and uni_loc.address else ''

            serialized_path.append({
                "id": str(program.id),
                "uni_name": uni_name,
                "uni_abrv": uni_abrv,
                "uni_type": uni_type,
                "uni_desc": uni_desc,
                "uni_image": uni_image,
                "uni_website": uni_website,
                "uni_address": uni_address,
                "internat_available": bool(uni.internat_available),
                "bourse_available": bool(uni.bourse_available),
                "prog_name": program.title,
                "years_of_study": program.years_of_study,
                "monthly_subscription": float(program.monthly_subscription) if program.monthly_subscription else 0,
                "max_age": program.max_age,
                "has_concours": bool(program.has_concours),
                "recognition_abroad": program.diploma_recognition_abroad_status or 'UNSPECIFIED',
                "recognition_morocco": program.diploma_recognition_morocco_status or 'UNSPECIFIED',
                "output_diploma": output_dip_name,
                "requirements": requirements,
                "color1": colors["color1"],
                "color2": colors["color2"],
                "job_titles": job_titles,
            })
        serialized_paths.append(serialized_path)
    return jsonify({'data': serialized_paths})

if __name__ == "__main__":

    CORS(app, origins=["http://localhost:3000"])
    app.run(debug=True, port=5001)