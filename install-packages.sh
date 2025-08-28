#!/bin/bash

mode="prod"

while IFS= read -r pkg || [ -n "$pkg" ]; do
  pkg=$(echo "$pkg" | tr -d '\r' | xargs)   # trim + handle CRLF
  [ -z "$pkg" ] && continue                 # skip empty lines
  [[ $pkg =~ ^# ]] && continue              # skip comments

  if [[ $pkg == "[prod]" ]]; then
    mode="prod"
    continue
  fi

  if [[ $pkg == "[dev]" ]]; then
    mode="dev"
    continue
  fi

  if [[ $mode == "dev" ]]; then
    echo "Installing dev dependency $pkg..."
    npm install -D "$pkg"
  else
    echo "Installing dependency $pkg..."
    npm install "$pkg"
  fi
done < packages.txt

echo "✅ All packages installed!"