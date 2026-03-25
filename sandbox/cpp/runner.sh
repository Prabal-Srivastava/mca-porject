#!/bin/bash
if [ -n "$CODE_B64" ]; then
    echo "$CODE_B64" | base64 -d > solution.cpp
else
    cat > solution.cpp
fi

g++ -O3 solution.cpp -o solution
if [ $? -eq 0 ]; then
    ./solution
else
    echo "Compilation failed" >&2
    exit 1
fi
