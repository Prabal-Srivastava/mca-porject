FROM golang:1.22-alpine
WORKDIR /app
COPY runner.sh /app/runner.sh
RUN chmod +x /app/runner.sh
RUN adduser -D sandbox && chown -R sandbox:sandbox /app
USER sandbox
ENTRYPOINT ["/app/runner.sh"]
