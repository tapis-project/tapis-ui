FROM node:22

RUN mkdir tapisui
RUN mkdir tapisui/src

WORKDIR /tapisui/src

# Copy the rest of the files
COPY ./ ./

# Install all files in the package json
RUN npm run init-project container

CMD ["npm", "run", "deploy"]

# RUN npm run build

# Start the container
# CMD ["serve", "-s", "build"]
# CMD ["npm", "run", "build"]