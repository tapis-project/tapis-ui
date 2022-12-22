FROM node:16.19

RUN mkdir tapisui
RUN mkdir tapisui/src

WORKDIR /tapisui/src

# Copy the package json and package lock
COPY package.json ./
COPY package-lock.json ./

# Copy the rest of the files
COPY ./ ./

# Install all files in the package json
RUN npm install

# Start the container
CMD ["npm", "run", "start"]