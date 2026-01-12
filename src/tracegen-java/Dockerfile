FROM gradle:jdk24
WORKDIR /app
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon
COPY src ./src
ENTRYPOINT ["gradle", "run", "--quiet", "--no-daemon"]
