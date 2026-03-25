FROM node:22-slim
WORKDIR /app
COPY runner.sh /app/runner.sh
RUN chmod +x /app/runner.sh
RUN useradd -m sandbox && chown -R sandbox:sandbox /app
USER sandbox
ENTRYPOINT ["/app/runner.sh"]
