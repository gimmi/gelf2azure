FROM node:12-alpine3.12 AS client-builder

COPY client/ /build/client/

RUN cd /build/client/ \
 && npm install \
 && npm run build

FROM node:12-alpine3.12

# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#handling-kernel-signals
RUN apk add --no-cache tini

COPY server/ /app
COPY --from=client-builder /build/server/src/static/ /app/src/static/

ENV NODE_ENV production

RUN cd /app/ \
 && npm install

ENTRYPOINT ["/sbin/tini", "--", "node", "/app/src/index.js"]
