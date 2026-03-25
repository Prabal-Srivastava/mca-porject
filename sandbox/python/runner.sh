#!/bin/bash
# Decode the code from base64 environment variable
if [ -n "$CODE_B64" ]; then
    echo "$CODE_B64" | base64 -d > solution.py
else
    # Fallback if not provided as env var
    cat > solution.py
fi

# Run the solution, inheriting the entire stdin for the user program
python3 solution.py
