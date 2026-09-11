from models import (
    db, JobTitle, Diploma, Program, University, 
    Category, User, ProgramJobTitle, ProgramRequirement,
    DiplomaTranslation, UniversityTranslation, ProgramTranslation
)
from flask_admin import Admin
from flask_admin.contrib.peewee import ModelView

class ProgramView(ModelView):
    column_list = ('title', 'university', 'category', 'output_diploma', 'years_of_study', 'is_approved')
    column_searchable_list = ('title',)
    column_filters = ('is_approved',)
    form_excluded_columns = ('created_at', 'updated_at')
    inline_models = (ProgramRequirement, ProgramJobTitle, ProgramTranslation)

class RequirementView(ModelView):
    column_list = ('program', 'required_diploma', 'min_grade')

class DiplomaView(ModelView):
    column_list = ('code', 'diploma_group', 'rank')
    column_searchable_list = ('code',)
    column_filters = ('diploma_group',)
    inline_models = (DiplomaTranslation,)

class UniversityView(ModelView):
    column_list = ('abreviation', 'type', 'is_approved')
    column_searchable_list = ('abreviation',)
    column_filters = ('type', 'is_approved')
    inline_models = (UniversityTranslation,)