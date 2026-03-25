
FROM eclipse-temurin:21-jdk
RUN apt-get update && apt-get install -y openjdk-21-jdk-headless && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY runner.sh /app/runner.sh
RUN chmod +x /app/runner.sh
RUN useradd -m sandbox && chown -R sandbox:sandbox /app
USER sandbox
ENTRYPOINT ["/app/runner.sh"]
