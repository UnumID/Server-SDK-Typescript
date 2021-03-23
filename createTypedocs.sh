#!/bin/sh

rm -rf build/
npx typedoc src/index.ts
yarn build