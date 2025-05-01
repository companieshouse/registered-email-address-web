# registered-email-address-web
Temp change to test sbom changes
Web front-end for the Registered Email Address service. Provides the ability to change
the registered email address for a company.

## Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

**When running locally:**

- Local copy of `docker-chs-development`
- [`chs-dev`](https://github.com/companieshouse/chs-dev)
- Populated CHIPS `db2` Database (i.e. from a baseline)

  You will need to know the user schema for this - it takes the form
  `CAPDEVXX2` for example `CAPDEVJS2`

  If you have not already got such a populated CHIPS db, you will need to
  request a schema. See
  <https://github.com/companieshouse/docker-chs-development/blob/master/docs/chips.md>

## Environment Variables

By default will assume running within the local Docker environment.

- `ACCOUNT_URL=<url>` - URL to the account service
- `API_URL=<url>` - Url to public apis
- `CACHE_SERVER=<host:port>` - hostname/port reference to the Cache server
- `CDN_HOST=<host>` - Host url for the root of the CDN
- `CDN_URL_CSS=<url>` - Path from the CDN URL to the CSS assets
- `CDN_URL_JS=<url>` - Path from the CDN URL to the Javascript assets
- `CHS_API_KEY=<apikey>` - API Key to use with CHS Services against public APIs
- `CHS_INTERNAL_API_KEY=<apikey>` - API Key to use with CHS Services against private APIs
- `CHS_URL=<url>` - URL for chs
- `COOKIE_DOMAIN=<domain>` - Domain for which the cookie is set for
- `COOKIE_NAME=<name>` - Name of the cookie set in users browser
- `COOKIE_SECRET=<secret>` - the Secret Key to use to encrypt cookies/session data
- `DEFAULT_SESSION_EXPIRATION=<expirationseconds>` - Time for the session to live for until expiry
- `LOG_LEVEL=<level>` - Level Of Logging - DEBUG/INFO/WARN/ERROR
- `NODE_ENV=<env name>` - Name of the environment being run within
- `ORACLE_QUERY_API_URL=<url>` - URL to the oracle-query-api servicd
- `PIWIK_START_GOAL_ID=<id>` - Goal ID
- `PIWIK_SITE_ID=<id>` - Site ID to be analysed
- `PIWIK_URL=<url>` - URL to analytics host
- `PORT=<number>` - Port number to run the application on
- `SESSION_COUNTDOWN=<length of countdown in seconds>` - timeout popup before signing out - default if not set=60 seconds
- `SESSION_TIMEOUT=<browser timeout in seconds>` - default if not set=3600
- `WEBFILING_LOGIN_URL=<url>` - URL to the web-filing login

## Summary of User Journey

1. User initiates email change
2. If the user is not currently logged in the user is redirected to login
3. Lookup company by company number
4. Confirm the company choice
5. If the user has not authenticated against the business with the company's
  auth code, they are prompted to provide it
6. Provide new email address
7. Check answers
8. User submits and sees the Update submitted message

## Notable Third Party Frameworks used

- `express` for http server/routing
- `joi` for body validation

  If modifying the body being posted to `/change-email-address` the `joi`
  schema **must** be updated otherwise requests will fail and the errors may
  be quite opaque.
- `govuk-frontend` etc. for providing Nunjucks components used to compose
  the screens.

## Developing the service locally

### Getting started

To checkout and build the service:

1. Run `chs-dev modules enable registered-email-address`
2. Run `chs-dev services enable transactions-api`
3. Run `chs-dev services enable company-lookup-web-ch-gov-uk`
4. Run `chs-dev development enable registered-email-address-web` (this will allow you to make changes).
5. Run docker using "chs-dev up" in the docker-chs-development directory.
6. Open your browser and go to page <http://chs.local/registered-email-address>

NOTE: when testing, you will need a company that already has a registered-email-address that will be returned by the private oracle-query-api

Debugging with IDE - add the following to docker-chs-development/services/modules/registered-email-address/registered-email-address-web.docker-compose.yaml
    ports:
    - 9229:9229
and configure your IDE accordingly. For VS-CODE, the following can be added to .vscode/launch.json:

  ```json
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
  ```

These instructions are for a local docker environment.

### Running unit tests

In order to run tests locally you will need to do the following:

1. Navigate to the checked out `registered-email-address-web` repo (within
  `repositories` of local `docker-chs-development` if in use there)
2. Run 'git submodule init', followed by 'git submodule update'.
3. Run 'npm test'


### Gotchas when developing locally

#### Company being used must have a registered email address provided by a Confirmation Statement

You can either submit a Confirmation Statement (with an Email) for a given
company

OR

If there is a particular Company you want to use which is not part of the
aforementioned list the following steps can be performed to amend its email
address so that it can be used.

1. Open your SQL Developer connection to your CHIPS `db2` Database
2. Run the following SQL:

    ```sql
    UPDATE (
        SELECT CORPORATE_BODY_DETAIL.*
        FROM
          CORPORATE_BODY_DETAIL
          INNER JOIN CORPORATE_BODY
          ON CORPORATE_BODY_DETAIL.CORPORATE_BODY_ID = CORPORATE_BODY.CORPORATE_BODY_ID
        WHERE INCORPORATION_NUMBER = '<inc_num>'
    ) CORP_BOD_DETS
    SET CORP_BOD_DETS.EMAIL_ADDRESS = '<initial_email>'
    ```

    Replacing `<inc_num>` with the company number for the company and
    `<initial_email>` with an initial email.

3. Commit this change
4. Verify `oracle-query-api` now thinks it has a REA:

    ```sh
    docker compose exec -it registered-email-address-api \
      curl -H 'Authorization: <auth_key>' \
      -v http://oracle-query-api:8080/company/<inc_num>/registered-email-address
    ```

    Replacing `<auth_key>` with the API key found within
    `docker-chs-development` service and `<inc_num>` with the company number
    for the company. This should return some JSON Looking like:

    ```json
    {"registered_email_address":"test@demoemail.com"}
    ```

    If this fails, try running the select query against your CHIPS `db2` Database:

    ```sql
    SELECT CB.corporate_body_id, CBD.email_address
    FROM CORPORATE_BODY_DETAIL CBD INNER JOIN CORPORATE_BODY CB ON CBD.CORPORATE_BODY_ID = CB.CORPORATE_BODY_ID
    WHERE CB.INCORPORATION_NUMBER = '<companynum>';
    ```

    Again, replacing `<companynum>` with the company number. This will return
    the record modified previously. In which case it is likely your
    `oracle-query-api` is pointing at cidev and not your CHIPS `db2` Database.

#### `oracle-query-api` is not pointing at your database

If you have services in development mode, stop the run process. (You don't have to
stop the environment entirely.)

Set the environment variables as so:

```sh
CHIPS_DATASOURCE_USERNAME=CAPDEVXX2
CHIPS_DATASOURCE_PASSWORD=CAPDEVXX2
export CHIPS_DATASOURCE_USERNAME CHIPS_DATASOURCE_PASSWORD
```

Ensuring these are set correctly for your user (i.e. replace `XX` with your
initials).

Rerun `chs-dev up`
