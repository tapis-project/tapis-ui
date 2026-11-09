# syntax=docker/dockerfile:1.7-labs
## ^ for --exclude on COPY
FROM node:22.4.0 as build-stage

RUN mkdir tapisui
WORKDIR /tapisui

# Copy the rest of the files.
# .env stays out twice over (here and .dockerignore): vite inlines VITE_*
# values into the bundle, so a local key would ship inside the pushed image.
COPY \
  --exclude=**node_modules* \
  --exclude=**dist* \
  --exclude=./.env \
  --exclude=./.vscode \
  --exclude=./__pycache__ \
  --exclude=./__mocks__ \
  --exclude=./.github \
  --exclude=./build \
  --exclude=./deploy \
  ./ ./

# Install all files in the package json
RUN npm run init-project container

RUN npm run init-project twice

RUN npm run build

# CMD ["sleep", "1000000"]


FROM nginx as production-stage

# RUN apt-get update
# RUN apt-get install -y vim
COPY --from=build-stage /tapisui/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf


CMD ["nginx", "-g", "daemon off;"]