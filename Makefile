install: install-deps

run:
	npx babel-node -- 'bin/nodejs-package.js' 10

build:
	rm -rf dist
	npm run build

install-deps:
	npm ci

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

test-watch:
	npm test -- --watchAll

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
