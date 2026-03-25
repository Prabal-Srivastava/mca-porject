#!/bin/bash
if [ -n "$CODE_B64" ]; then
    echo "$CODE_B64" | base64 -d > solution.rb
else
    cat > solution.rb
fi
ruby solution.rb
