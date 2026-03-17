from __future__ import annotations

from dataclasses import dataclass

@dataclass(frozen=True)
class Student:
    id: int
    vpisna: str
    ime: str
    priimek: str
    status: str  
