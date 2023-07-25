# registered-email-address-web
Web front-end for the Registered Email Address service

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

### Getting started

To checkout and build the service:
1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README. 
2. Run ./bin/chs-dev modules enable registered-email-address
3. Run ./bin/chs-dev services enable transactions-api
4. Run ./bin/chs-dev development enable registered-email-address-web (this will allow you to make changes).
5. Run docker using "tilt up" in the docker-chs-development directory.
6. Use spacebar in the command line to open tilt window - wait for officer-filing-web to become green.
7. Open your browser and go to page http://chs.local/registered-email-address

NOTE: when testing, you will need a company that already has a registered-email-address that will be returned by the private oracle-query-api

Debugging with IDE - add the following to docker-chs-development/services/modules/registered-email-address/registered-email-address-web.docker-compose.yaml
    ports:
    - 9229:9229
and configure your IDE accordingly. For VS-CODE, the following can be added to .vscode/launch.json:
 
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "attach - remote",
      "address": "localhost",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}/dist",
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ]
    }
  ]

These instructions are for a local docker environment.

### Running Tests
In order to run tests locally you will need to do the following:
1. Navigate to /registered-email-address-web/
2. Run 'git submodule init', followed by 'git submodule update'.
3. Run 'npm test'
