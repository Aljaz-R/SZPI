from __future__ import annotations

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from studenti.infrastruktura.db import Base

class StudentModel(Base):
    __tablename__ = "studenti"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vpisna: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    ime: Mapped[str] = mapped_column(String(80), nullable=False)
    priimek: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="AKTIVEN")  # AKTIVEN | NEAKTIVEN