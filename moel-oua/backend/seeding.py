import json
import models 

# Explicitly list all models so Peewee creates the schema correctly, 
# even for tables not present in data.json.
ALL_MODELS = [
    models.User,
    models.Category,
    models.CategoryTranslation,
    models.JobTitle,
    models.University,
    models.UniversityTranslation,
    models.Diploma,
    models.DiplomaTranslation,
    models.Program,
    models.ProgramTranslation,
    models.ProgramRequirement,
    models.ProgramJobTitle,
    models.City,
    models.CityTranslation,
    models.Field,
    models.FieldTranslation,
    models.DiplomaField,
    models.UserDiploma,
    models.UserDiplomaField,
    models.UniversityLocation,
    models.Favoris,
    models.UserInterestedCategory,
    models.Notification,
    models.PasswordResetToken,
    models.UserDevice,
    models.RefreshToken,
    models.BlacklistedToken
]

def seed_database():
    models.db.connect()

    with open('./data/data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    instance_map = {}
    
    print("Creating tables...")
    models.db.create_tables(ALL_MODELS, safe=True)
    
    for model_name, records in data.items():
        if hasattr(models, model_name):
            ModelClass = getattr(models, model_name)
            print(f"Clearing and seeding {model_name}...")
            ModelClass.delete().execute()
            
            for row in records:
                ref_id = row.pop('_ref', None)
                for key, value in row.items():
                    if isinstance(value, str) and value in instance_map:
                        row[key] = instance_map[value]
                        
                instance = ModelClass.create(**row)
                if ref_id:
                    instance_map[ref_id] = instance
        else:
            print(f"Warning: Model {model_name} found in JSON but not in models.py")

    models.db.close()
    print("Database seeding complete!")

if __name__ == "__main__":
    seed_database()