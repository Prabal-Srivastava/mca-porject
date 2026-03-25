#!/bin/bash
if [ -n "$CODE_B64" ]; then
    echo "$CODE_B64" | base64 -d > Solution.java
else
    cat > Solution.java
fi

javac Solution.java
if [ $? -eq 0 ]; then
    java Solution
else
    echo "Compilation failed" >&2
    exit 1
fi
