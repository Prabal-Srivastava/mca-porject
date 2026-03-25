#!/bin/sh
if [ -n "$CODE_B64" ]; then
    echo "$CODE_B64" | base64 -d > main.go
else
    cat > main.go
fi
go run main.go
