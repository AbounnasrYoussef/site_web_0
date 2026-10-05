FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /usr/src/app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN useradd --no-create-home app
USER app

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "app:app"]
