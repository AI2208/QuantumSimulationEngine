# Use a lightweight web server as the base image
FROM nginx:alpine

# Copy your static files to the nginx web server directory
COPY . /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start the web server when the container runs
CMD ["nginx", "-g", "daemon off;"]
