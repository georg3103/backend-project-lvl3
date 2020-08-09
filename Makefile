install: install-deps

run:
	npx babel-node -- 'bin/page-loader' 10

build:
	rm -rf dist
	npm run build

install-deps:
	npm ci

test:
	npm test

test-debug:
	DEBUG=page-loader npm test

test-axios-debug:
	DEBUG=axios,page-loader npm test

test-nock-debug:
	DEBUG=nock.scope.* npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

test-watch:
	npm test -- --watchAll

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
