# src/studenti/api/main.py
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
    description="Mikrostoritev za upravljanje studentov.",
)

@app.on_event("startup")
def _startup():
    if os.getenv("SKIP_DB_INIT", "0") == "1":
        logging.getLogger("studenti").info("SKIP_DB_INIT=1 -> init_db skipped")
        return
    init_db()
    logging.getLogger("studenti").info("Studenti service started")

app.include_router(router)
