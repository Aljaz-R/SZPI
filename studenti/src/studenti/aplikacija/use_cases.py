from __future__ import annotations

from studenti.infrastruktura.repositories import StudentRepository

class StudentiUseCases:
    def __init__(self, repo: StudentRepository):
        self.repo = repo

    def preveri_upravicenost(self, student_id: int, predmet_id: str | None = None) -> dict:
        student = self.repo.get_by_id(student_id)
        if not student:
            return {"allowed": False, "reason": "STUDENT_NE_OBSTAJA"}

       
        if student.status != "AKTIVEN":
            return {"allowed": False, "reason": "NEAKTIVEN_STATUS"}

        return {"allowed": True, "reason": "OK"}
