#!/bin/bash
# Start script for registered-email-address-web
npm i --omit=dev
PORT=3000
export NODE_PORT=${PORT}
exec node server.js -- ${PORT}
exec inspect 0.0.0.0:9229