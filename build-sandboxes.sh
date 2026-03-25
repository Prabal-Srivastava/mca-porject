#!/bin/bash

# Build sandbox images for each language
languages=("python" "node" "cpp" "java" "ruby" "go")

for lang in "${languages[@]}"; do
  echo "Building sandbox image for $lang..."
  docker build -t "sandbox-$lang" "./sandbox/$lang"
done

echo "All sandbox images built successfully!"
