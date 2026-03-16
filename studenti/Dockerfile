FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir poetry==1.8.2

COPY pyproject.toml poetry.lock* /app/
COPY src /app/src

RUN poetry config virtualenvs.create false \
 && poetry install --no-interaction --no-ansi

EXPOSE 8000

CMD ["uvicorn", "studenti.api.main:app", "--host", "0.0.0.0", "--port", "8000"]