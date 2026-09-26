# Use official Node image as base
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Ensure the workdir is writable by the OMV admin user (UID/GID 1000)
# This matches the `user: "1000:1000"` directive in the compose file
RUN mkdir -p /usr/src/app && chown -R 1000:1000 /usr/src/app
RUN npm install -g dockerode

# Do not COPY any project code here
# When running the container, mount the actual source code directory via volumes