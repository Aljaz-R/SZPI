from __future__ import annotations

import os
import time
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError

from studenti.infrastruktura.db import make_engine, make_session_factory, Base

logger = logging.getLogger("studenti")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://studenti:studenti@localhost:5432/studenti",
)

_engine = make_engine(DATABASE_URL)
_SessionLocal = make_session_factory(_engine)

def init_db():
    last_err = None
    for _ in range(30):  # ~30s
        try:
            Base.metadata.create_all(bind=_engine)
            logger.info("DB ready")
            return
        except OperationalError as e:
            last_err = e
            logger.warning("DB not ready yet, retrying...")
            time.sleep(1)
    raise last_err

def get_session() -> Session:
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()