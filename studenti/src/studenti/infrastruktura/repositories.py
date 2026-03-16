from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select

from studenti.infrastruktura.models import StudentModel
from studenti.domena.entities import Student

class StudentRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, vpisna: str, ime: str, priimek: str, status: str = "AKTIVEN") -> Student:
        obj = StudentModel(vpisna=vpisna, ime=ime, priimek=priimek, status=status)
        self.session.add(obj)
        self.session.commit()
        self.session.refresh(obj)
        return Student(id=obj.id, vpisna=obj.vpisna, ime=obj.ime, priimek=obj.priimek, status=obj.status)

    def get_by_id(self, student_id: int) -> Student | None:
        obj = self.session.get(StudentModel, student_id)
        if not obj:
            return None
        return Student(id=obj.id, vpisna=obj.vpisna, ime=obj.ime, priimek=obj.priimek, status=obj.status)

    def get_by_vpisna(self, vpisna: str) -> Student | None:
        stmt = select(StudentModel).where(StudentModel.vpisna == vpisna)
        obj = self.session.execute(stmt).scalar_one_or_none()
        if not obj:
            return None
        return Student(id=obj.id, vpisna=obj.vpisna, ime=obj.ime, priimek=obj.priimek, status=obj.status)

    def update_status(self, student_id: int, status: str) -> Student | None:
        obj = self.session.get(StudentModel, student_id)
        if not obj:
            return None
        obj.status = status
        self.session.commit()
        self.session.refresh(obj)
        return Student(id=obj.id, vpisna=obj.vpisna, ime=obj.ime, priimek=obj.priimek, status=obj.status)