FROM node:lts-slim as base
WORKDIR /usr/src/app


FROM base as dev
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev 
ENV PLAYWRIGHT_BROWSERS_PATH=$HOME/home/node/.cache/ms-playwright
RUN npx playwright install --with-deps chromium-headless-shell
USER node
COPY . .
CMD npm run nodemon

FROM base as prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY . .
CMD node server.js


