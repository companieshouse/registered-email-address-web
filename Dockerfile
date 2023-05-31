FROM 169942020521.dkr.ecr.eu-west-2.amazonaws.com/base/node-16:alpine-builder
FROM 169942020521.dkr.ecr.eu-west-2.amazonaws.com/base/node-16:alpine-runtime
WORKDIR /app/dist
CMD ["server.js"]
EXPOSE 3000
