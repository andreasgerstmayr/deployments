FROM node:20-alpine

WORKDIR /app
COPY . /app

RUN npm ci
RUN chgrp -R 0 /app && \
    chmod -R g=u /app

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
