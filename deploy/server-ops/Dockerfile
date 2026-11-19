FROM python:3.13-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY core.py web.py index.html app.js style.css ./
USER 1000:1000
EXPOSE 8793
CMD ["python","web.py"]
