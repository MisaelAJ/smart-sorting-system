# Use a lightweight Node image
FROM node:20-alpine

WORKDIR /usr/src/app

# Install nodemon globally for hot reload on our API
RUN npm install -g nodemon

# Keep the container alive
CMD ["tail", "-f", "/dev/null"]