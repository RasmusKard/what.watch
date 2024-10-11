ARG NODE_VERSION=20.17.0


FROM node:${NODE_VERSION}-alpine
FROM mcr.microsoft.com/playwright:v1.46.0-noble

# Set the working directory inside the container.
WORKDIR /app

# Copy "package.json" and "yarn.lock" from the current directory to the working directory inside the container.
COPY package.json ./

# Install the dependencies listed in "package.json" and "yarn.lock".
RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci --omit=dev

# Install the system dependencies needed by Playwright.
RUN npx playwright install-deps && npx playwright install


# Copy everything from the current directory to the working directory inside the container.
COPY . .