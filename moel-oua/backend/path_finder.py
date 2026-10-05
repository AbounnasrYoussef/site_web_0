from collections import defaultdict
from datetime import date
from models import Program, ProgramRequirement, Diploma

MAX_PATH_LENGTH = 8
MAX_PATHS = 300


def find_paths(category_id, diploma_id, student):
    ranks = {diploma.id: diploma.rank for diploma in Diploma.select()}
    if diploma_id not in ranks:
        return []
    user_rank = ranks[diploma_id]

    programs = list(Program.select().where(Program.is_approved == True))
    feeders = defaultdict(list)
    for program in programs:
        feeders[program.output_diploma_id].append(program)

    requirements = defaultdict(list)
    for requirement in ProgramRequirement.select():
        requirements[requirement.program_id].append(requirement)

    def is_met(requirement):
        return requirement.required_diploma_id is None or ranks[requirement.required_diploma_id] <= user_rank

    def paths_to(program, path):
        if len(path) > MAX_PATH_LENGTH:
            return []
        if not requirements[program.id]:
            return [path]

        paths = []
        for requirement in requirements[program.id]:
            if is_met(requirement):
                paths.append(path)
                continue
            for feeder in feeders[requirement.required_diploma_id]:
                if feeder not in path:
                    paths += paths_to(feeder, [feeder] + path)
        return paths

    found = {}
    for program in programs:
        if program.category_id != category_id:
            continue
        if ranks.get(program.output_diploma_id, user_rank + 1) <= user_rank:
            continue
        for path in paths_to(program, [program]):
            found[tuple(step.id for step in path)] = path
        if len(found) >= MAX_PATHS:
            break

    results = [evaluate(path, requirements, is_met, student) for path in found.values()]
    results.sort(key=lambda result: (not result["eligible"], result["total_years"], result["concours_count"]))
    return results[:MAX_PATHS]


def evaluate(path, requirements, is_met, student):
    """Checks every step of a path against what we know about the student.

    A check is {"type", ..., "ok"} where ok is True (passes), False (blocks the
    student) or None (can't be decided: missing data, or a grade they don't have yet).
    """
    current_age = date.today().year - student["birth_year"] if student["birth_year"] else None
    years_before = 0
    steps = []
    for i, program in enumerate(path):
        if i == 0:
            entry = [r for r in requirements[program.id] if is_met(r)]
        else:
            entry = [r for r in requirements[program.id] if r.required_diploma_id == path[i - 1].output_diploma_id]
        checks = grade_checks(entry, student, first_step=i == 0)
        if program.max_age is not None and current_age is not None:
            age = current_age + years_before
            checks.append({"type": "age", "max": program.max_age, "actual": age, "ok": age <= program.max_age})
        if i == 0:
            checks += graduation_checks(entry, student)
        steps.append(checks)
        years_before += program.years_of_study

    return {
        "programs": path,
        "checks": steps,
        "eligible": not any(check["ok"] is False for checks in steps for check in checks),
        "total_years": years_before,
        "concours_count": sum(program.has_concours for program in path),
    }


def grade_checks(entry, student, first_step):
    grades = [r.min_grade for r in entry]
    if not grades or None in grades:
        return []
    required = float(min(grades))
    if not first_step:
        return [{"type": "future_grade", "required": required, "ok": None}]
    grade = student["grade"]
    return [{"type": "grade", "required": required, "actual": grade, "ok": None if grade is None else grade >= required}]


def graduation_checks(entry, student):
    limits = [r.max_years_since_graduation for r in entry]
    if not limits or None in limits:
        return []
    allowed = max(limits)
    if student["graduation_year"] is None:
        return [{"type": "graduation", "max": allowed, "actual": None, "ok": None}]
    since = date.today().year - student["graduation_year"]
    return [{"type": "graduation", "max": allowed, "actual": since, "ok": since <= allowed}]
