from collections import defaultdict
from models import Program, ProgramRequirement, Diploma

MAX_PATH_DEPTH = 8


class PathFinder:

    def find_paths(self, category_id, starting_diploma_id):
        programs = self.get_approved_programs()
        programs_awarding_diploma = self.map_programs_by_output_diploma(programs)

        starting_rank = self.get_starting_rank(starting_diploma_id)
        target_programs = self.find_target_programs(programs, category_id, starting_rank)

        if not target_programs:
            return self.error("Cant Find a Program On The Selected Category")

        all_paths = []
        for target in target_programs:
            all_paths.extend(self.trace_back(
                target,
                starting_rank,
                [target],
                {target.id},
                programs_awarding_diploma,
            ))
        return all_paths

    def get_starting_rank(self, starting_diploma_id):
        if not starting_diploma_id:
            return None
        starting_diploma = Diploma.get_or_none(Diploma.id == str(starting_diploma_id))
        return starting_diploma.rank if starting_diploma else None

    def get_approved_programs(self):
        return list(
            Program.select().where(Program.is_approved == True)
            .prefetch(ProgramRequirement)
        )

    def map_programs_by_output_diploma(self, programs):
        by_output_diploma = defaultdict(list)
        for program in programs:
            if program.output_diploma:
                by_output_diploma[str(program.output_diploma.id)].append(program)
        return by_output_diploma

    def find_target_programs(self, programs, category_id, starting_rank):
        matches = []
        for program in programs:
            if not program.category or str(program.category.id) != str(category_id):
                continue
            if self.already_surpassed(program, starting_rank):
                continue
            matches.append(program)
        return matches

    def already_surpassed(self, program, starting_rank):
        if starting_rank is None or program.output_diploma is None:
            return False
        return program.output_diploma.rank <= starting_rank

    def error(self, text=None):
        return {"error": text or "Path Error"}

    def requirement_already_met(self, required_diploma, starting_rank):
        if required_diploma is None:
            return True
        if starting_rank is None:
            return False
        return required_diploma.rank <= starting_rank

    def trace_back(self, program, starting_rank, path_so_far, visited, programs_awarding_diploma):
        if len(path_so_far) > MAX_PATH_DEPTH:
            return []

        requirements = list(program.admission_requirements)
        if not requirements:
            return [list(path_so_far)]

        found_paths = []
        for requirement in requirements:
            required_diploma = requirement.required_diploma

            if self.requirement_already_met(required_diploma, starting_rank):
                found_paths.append(list(path_so_far))
                continue

            required_diploma_id = str(required_diploma.id)
            for feeder_program in programs_awarding_diploma.get(required_diploma_id, []):
                if feeder_program.id in visited:
                    continue
                found_paths.extend(self.trace_back(
                    feeder_program,
                    starting_rank,
                    [feeder_program] + path_so_far,
                    visited | {feeder_program.id},
                    programs_awarding_diploma,
                ))

        return found_paths