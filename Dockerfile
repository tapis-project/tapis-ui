FROM node:22.4.0 as build-stage

RUN mkdir tapisui
WORKDIR /tapisui

# Copy the rest of the files
COPY ./ ./

# Install all files in the package json
RUN npm run init-project container

RUN npm run init-project twice

RUN npm run build-local

# CMD ["sleep", "1000000"]


FROM nginx as production-stage

RUN apt-get update
RUN apt-get install -y vim
COPY --from=build-stage /tapisui/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf

# RUN npm run build

CMD ["nginx", "-g", "daemon off;"]


# Start the container
# CMD ["serve", "-s", "build"]
# CMD ["npm", "run", "build"]
