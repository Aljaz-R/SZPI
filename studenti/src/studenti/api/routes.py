from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from studenti.infrastruktura.repositories import StudentRepository
from studenti.aplikacija.use_cases import StudentiUseCases
from studenti.api.deps import get_session

router = APIRouter()

class StudentCreate(BaseModel):
    vpisna: str = Field(min_length=1, max_length=32)
    ime: str = Field(min_length=1, max_length=80)
    priimek: str = Field(min_length=1, max_length=80)

class StudentOut(BaseModel):
    id: int
    vpisna: str
    ime: str
    priimek: str
    status: str

class StatusPatch(BaseModel):
    status: str = Field(pattern="^(AKTIVEN|NEAKTIVEN)$")

@router.get("/health")
def health():
    return {"status": "ok"}

@router.post("/studenti", response_model=StudentOut, status_code=201)
def create_student(payload: StudentCreate, db: Session = Depends(get_session)):
    repo = StudentRepository(db)
    existing = repo.get_by_vpisna(payload.vpisna)
    if existing:
        raise HTTPException(status_code=409, detail="VPISNA_ALREADY_EXISTS")
    s = repo.add(vpisna=payload.vpisna, ime=payload.ime, priimek=payload.priimek)
    return s.__dict__

@router.get("/studenti/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_session)):
    repo = StudentRepository(db)
    s = repo.get_by_id(student_id)
    if not s:
        raise HTTPException(status_code=404, detail="STUDENT_NOT_FOUND")
    return s.__dict__

@router.get("/studenti", response_model=StudentOut)
def get_student_by_vpisna(vpisna: str = Query(...), db: Session = Depends(get_session)):
    repo = StudentRepository(db)
    s = repo.get_by_vpisna(vpisna)
    if not s:
        raise HTTPException(status_code=404, detail="STUDENT_NOT_FOUND")
    return s.__dict__

@router.patch("/studenti/{student_id}/status", response_model=StudentOut)
def patch_status(student_id: int, payload: StatusPatch, db: Session = Depends(get_session)):
    repo = StudentRepository(db)
    s = repo.update_status(student_id, payload.status)
    if not s:
        raise HTTPException(status_code=404, detail="STUDENT_NOT_FOUND")
    return s.__dict__

@router.get("/studenti/{student_id}/upravicenost")
def upravicenos(student_id: int, predmetId: str | None = None, db: Session = Depends(get_session)):
    repo = StudentRepository(db)
    uc = StudentiUseCases(repo)
    return uc.preveri_upravicenost(student_id, predmet_id=predmetId)