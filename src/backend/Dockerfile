FROM python:3.12

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.lock
RUN flask --app src/backend/app.py init-db
RUN chgrp -R 0 /app && \
    chmod -R g=u /app

EXPOSE 5000
CMD ["flask", "--app", "src/backend/app.py", "run", "--host", "0.0.0.0"]
