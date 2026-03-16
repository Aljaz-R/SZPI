from __future__ import annotations

import os
import logging

from fastapi import FastAPI
from studenti.api.routes import router
from studenti.api.deps import init_db

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(asctime)s %(levelname)s %(name)s %(message)s")

app = FastAPI(
    title="Studenti API",
    version="1.0.0",
    description="Mikrostoritev za upravljanje studentov (sistem prijav na izpite).",
)

@app.on_event("startup")
def _startup():
    init_db()
    logging.getLogger("studenti").info("Studenti service started")

app.include_router(router)