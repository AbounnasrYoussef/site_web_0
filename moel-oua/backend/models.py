import os
import uuid
from datetime import datetime
from peewee import *
from dotenv import load_dotenv

load_dotenv()

SQLLITE = os.getenv('DEV', True)
if SQLLITE:
    db = SqliteDatabase('test.db')
else :
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_NAME = os.getenv("POSTGRES_DB", None)
    DB_USER = os.getenv("POSTGRES_USER", None)
    DB_PASS = os.getenv("POSTGRES_PASSWORD", None)
    DB_PORT= os.getenv("PGADMIN", None)
    db = PostgresqlDatabase(
        DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )

class BaseModel(Model):
    class Meta:
        database = db

class CreatedAtModel(BaseModel):
    created_at = DateTimeField(default=datetime.now)

class TimestampedModel(CreatedAtModel):
    updated_at = DateTimeField(default=datetime.now)

# Enums
UNIVERSITY_TYPE = (('PUBLIC', 'PUBLIC'), ('SEMI_PUBLIC', 'SEMI_PUBLIC'), ('PRIVATE', 'PRIVATE'))
DIPLOMA_RECOGNITION = (('RECOGNIZED', 'RECOGNIZED'), ('EVALUATION_REQUIRED', 'EVALUATION_REQUIRED'), ('NOT_RECOGNIZED', 'NOT_RECOGNIZED'))
USER_TYPE = (('SUPERADMIN', 'SUPERADMIN'), ('ADMIN', 'ADMIN'), ('USER', 'USER'))
AUTH_PROVIDER = (('LOCAL', 'LOCAL'), ('GOOGLE', 'GOOGLE'))
LOCALE_TYPE = (('EN', 'EN'), ('FR', 'FR'), ('AR', 'AR'))
NOTIFICATION_CATEGORY = (
    ('USER_ADD_UNIVERSITY', 'USER_ADD_UNIVERSITY'),
    ('USER_ADD_PROGRAM', 'USER_ADD_PROGRAM'),
    ('USER_REPORT_ISSUE', 'USER_REPORT_ISSUE'),
    ('ADMIN_APPROVE_UNIVERSITY', 'ADMIN_APPROVE_UNIVERSITY'),
    ('ADMIN_DECLINE_UNIVERSITY', 'ADMIN_DECLINE_UNIVERSITY'),
    ('ADMIN_APPROVE_PROGRAM', 'ADMIN_APPROVE_PROGRAM'),
    ('ADMIN_DECLINE_PROGRAM', 'ADMIN_DECLINE_PROGRAM')
)

class User(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    first_name = CharField(max_length=255, null=True)
    last_name = CharField(max_length=255, null=True)
    role = CharField(choices=USER_TYPE, default='USER')
    email = CharField(max_length=255, unique=True, null=True)
    year_of_birth = SmallIntegerField(null=True)
    is_dropout = BooleanField(default=False)
    profile_pic = TextField(null=True)
    password_hash = CharField(max_length=255, null=True)
    auth_provider = CharField(choices=AUTH_PROVIDER, default='LOCAL')
    google_id = CharField(max_length=255, null=True)
    is_2fa_enabled = BooleanField(default=False)
    pending_2fa_code = CharField(max_length=255, null=True)
    pending_2fa_expires_at = DateTimeField(null=True)
    pending_2fa_request_count = SmallIntegerField(default=0, null=True)
    pending_2fa_attempts = SmallIntegerField(default=0, null=True)
    pending_2fa_request_reset = DateTimeField(null=True)
    toggle_2fa_attempts = SmallIntegerField(default=0, null=True)
    toggle_2fa_locked_until = DateTimeField(null=True)
    must_change_password = BooleanField(default=False, null=True)
    failed_login_attempts = SmallIntegerField(default=0, null=True)
    locked_until = DateTimeField(null=True)

    class Meta:
        table_name = 'users'

class Category(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    name = CharField(max_length=255, unique=True)
    
    class Meta:
        table_name = 'categories'

class CategoryTranslation(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    category = ForeignKeyField(Category, backref='translations', on_delete='CASCADE')
    locale = CharField(choices=LOCALE_TYPE)
    name = CharField(max_length=255)

    class Meta:
        table_name = 'category_translations'
        indexes = ((('category', 'locale'), True),)

class JobTitle(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    title = TextField(unique=True, null=False)
    salary = IntegerField(null=False)

    class Meta:
        table_name = 'job_titles'

class University(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    type = CharField(choices=UNIVERSITY_TYPE)
    is_approved = BooleanField(default=False)
    internat_available = BooleanField(default=False)
    bourse_available = BooleanField(default=False)
    abreviation = TextField(unique=True, null=True)
    
    class Meta:
        table_name = 'universities'

class UniversityTranslation(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    university = ForeignKeyField(University, backref='translations', on_delete='CASCADE')
    locale = CharField(choices=LOCALE_TYPE)
    name = CharField(max_length=255)
    description = TextField(null=True)

    class Meta:
        table_name = 'university_translations'
        indexes = ((('university', 'locale'), True),)

class Diploma(CreatedAtModel):
    id = UUIDField(default=uuid.uuid4, primary_key=True)
    code = CharField(unique=True, max_length=100)
    diploma_group = CharField(max_length=50)
    rank = IntegerField(default=12)
    
    class Meta:
        table_name = 'diplomas'

class DiplomaTranslation(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    diploma = ForeignKeyField(Diploma, backref='translations', on_delete='CASCADE')
    name = CharField(max_length=255)
    locale = CharField(choices=LOCALE_TYPE)

    class Meta:
        table_name = 'diploma_translations'
        indexes = ((('diploma', 'locale'), True),)

class Program(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    university = ForeignKeyField(University, backref='programs', on_delete='CASCADE')
    category = ForeignKeyField(Category, backref='programs', on_delete='CASCADE')
    output_diploma = ForeignKeyField(Diploma, backref='programs_awarding', null=True, on_delete='CASCADE')
    
    title = CharField(null=False, max_length=255)
    years_of_study = SmallIntegerField()
    monthly_subscription = DecimalField(max_digits=10, decimal_places=2, null=True)
    max_age = SmallIntegerField(null=True)
    has_concours = BooleanField(default=False)
    diploma_recognition_abroad_status = CharField(choices=DIPLOMA_RECOGNITION, null=True)
    diploma_recognition_morocco_status = CharField(choices=DIPLOMA_RECOGNITION, null=True)
    is_approved = BooleanField(default=False)
    
    class Meta:
        table_name = 'programs'

class ProgramTranslation(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    program = ForeignKeyField(Program, backref='translations', on_delete='CASCADE')
    locale = CharField(choices=LOCALE_TYPE)
    name = CharField(max_length=255)

    class Meta:
        table_name = 'program_translations'
        indexes = ((('program', 'locale'), True),)

class ProgramRequirement(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    program = ForeignKeyField(Program, backref='admission_requirements', on_delete='CASCADE')
    required_diploma = ForeignKeyField(Diploma, backref='required_by_programs', null=True, on_delete='CASCADE')
    min_grade = DecimalField(max_digits=4, decimal_places=2, null=True)
    max_years_since_graduation = SmallIntegerField(null=True)
    requirement_group = SmallIntegerField(default=1)
    
    class Meta:
        table_name = 'program_requirements'
        indexes = ((('program', 'required_diploma'), True),)

class ProgramJobTitle(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    program = ForeignKeyField(Program, backref='potential_jobs', on_delete='CASCADE')
    job_title = ForeignKeyField(JobTitle, backref='qualifying_programs', on_delete='CASCADE')

    class Meta:
        table_name = 'program_job_titles'
        indexes = ((('program', 'job_title'), True),)

class City(CreatedAtModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)

    class Meta:
        table_name = 'cities'

class CityTranslation(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    city = ForeignKeyField(City, backref='translations', on_delete='CASCADE')
    locale = CharField(choices=LOCALE_TYPE)
    name = CharField(max_length=255)
    region = CharField(max_length=255, null=True)

    class Meta:
        table_name = 'city_translations'
        indexes = ((('city', 'locale'), True),)

class Field(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)

    class Meta:
        table_name = 'fields'

class FieldTranslation(BaseModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    field = ForeignKeyField(Field, backref='translations', on_delete='CASCADE')
    locale = CharField(choices=LOCALE_TYPE)
    name = CharField(max_length=255)

    class Meta:
        table_name = 'field_translations'
        indexes = ((('field', 'locale'), True),)

class DiplomaField(BaseModel):
    diploma = ForeignKeyField(Diploma, backref='fields', on_delete='CASCADE')
    field = ForeignKeyField(Field, backref='diplomas', on_delete='CASCADE')

    class Meta:
        table_name = 'diploma_fields'
        primary_key = CompositeKey('diploma', 'field')

class UserDiploma(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user = ForeignKeyField(User, backref='academic_history', unique=True, on_delete='CASCADE')
    diploma = ForeignKeyField(Diploma, backref='awarded_to_users', on_delete='CASCADE')
    general_grade = DecimalField(max_digits=4, decimal_places=2, null=True)
    obtained_year = SmallIntegerField(null=True)

    class Meta:
        table_name = 'user_diplomas'

class UserDiplomaField(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user_diploma = ForeignKeyField(UserDiploma, backref='field_grades', on_delete='CASCADE')
    field = ForeignKeyField(Field, backref='user_grades', on_delete='RESTRICT')
    value = DecimalField(max_digits=4, decimal_places=2, null=True)

    class Meta:
        table_name = 'user_diploma_fields'
        indexes = ((('user_diploma', 'field'), True),)

class UniversityLocation(TimestampedModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    university = ForeignKeyField(University, backref='locations', on_delete='CASCADE')
    city = ForeignKeyField(City, backref='universities', on_delete='RESTRICT')
    address = TextField(null=True)
    website = TextField(null=True)
    longitude = DecimalField(max_digits=9, decimal_places=6, null=True)
    latitude = DecimalField(max_digits=9, decimal_places=6, null=True)
    image_url = TextField(null=True)

    class Meta:
        table_name = 'university_locations'
        indexes = ((('university', 'city'), True),)

class Favoris(CreatedAtModel):
    user = ForeignKeyField(User, backref='favorites', on_delete='CASCADE')
    university = ForeignKeyField(University, backref='favorited_by', on_delete='CASCADE')

    class Meta:
        table_name = 'favoris'
        primary_key = CompositeKey('user', 'university')

class UserInterestedCategory(BaseModel):
    user = ForeignKeyField(User, backref='interested_categories', on_delete='CASCADE')
    category = ForeignKeyField(Category, backref='interested_users', on_delete='CASCADE')

    class Meta:
        table_name = 'user_interested_categories'
        primary_key = CompositeKey('user', 'category')

class Notification(CreatedAtModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    receiver = ForeignKeyField(User, backref='notifications', on_delete='CASCADE')
    sender = ForeignKeyField(User, backref='sent_notifications', null=True, on_delete='SET NULL')
    category = CharField(choices=NOTIFICATION_CATEGORY)
    title = CharField(max_length=255)
    message = TextField(null=True)
    admin_message = TextField(null=True)
    is_read = BooleanField(default=False)
    is_actioned = BooleanField(default=False)
    action_url = TextField(null=True)

    class Meta:
        table_name = 'notifications'

class PasswordResetToken(CreatedAtModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user = ForeignKeyField(User, backref='password_reset_tokens', on_delete='CASCADE')
    token_hash = CharField(max_length=64)
    expires_at = DateTimeField()
    used_at = DateTimeField(null=True)
    attempts = IntegerField(default=0)

    class Meta:
        table_name = 'password_reset_tokens'

class UserDevice(CreatedAtModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user = ForeignKeyField(User, backref='devices', on_delete='CASCADE')
    device_id = CharField(max_length=255)
    device_name = CharField(max_length=255, null=True)
    device_identifier_hash = TextField(unique=True, null=True)
    user_agent = TextField(null=True)
    ip_address = CharField(max_length=45, null=True) # Peewee handles INET as text typically
    last_used_at = DateTimeField(default=datetime.now)
    is_trusted = BooleanField(default=False)
    trusted_until = DateTimeField(null=True)

    class Meta:
        table_name = 'user_devices'

class RefreshToken(CreatedAtModel):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user = ForeignKeyField(User, backref='refresh_tokens', on_delete='CASCADE')
    token_hash = TextField()
    device = ForeignKeyField(UserDevice, backref='refresh_tokens', null=True, on_delete='SET NULL')
    expires_at = DateTimeField()
    revoked_at = DateTimeField(null=True)

    class Meta:
        table_name = 'refresh_tokens'

class BlacklistedToken(CreatedAtModel):
    token = TextField(primary_key=True)
    user = ForeignKeyField(User, backref='blacklisted_tokens', on_delete='CASCADE')
    expires_at = DateTimeField()

    class Meta:
        table_name = 'blacklisted_tokens'