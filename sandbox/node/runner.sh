#!/bin/bash
if [ -n "$CODE_B64" ]; then
    echo "$CODE_B64" | base64 -d > solution.js
else
    cat > solution.js
fi
node solution.js
