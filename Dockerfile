# Specify the base image
FROM node:22.2.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Bundle app source inside Docker image
COPY ./src ./src

# Your app binds to port 3000 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 3000