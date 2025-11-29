#!/bin/bash

echo "========================================"
echo "PDF Question Extraction Script"
echo "========================================"
echo ""

cd server

echo "Installing dependencies (if needed)..."
npm install

echo ""
echo "Running extraction and merge..."
npm run extract-and-merge

echo ""
echo "========================================"
echo "Done! Check the output above for results."
echo "========================================"

