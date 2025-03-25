# Start with the lightweight Alpine Linux base image
FROM alpine:latest

# Set environment variables to avoid interactive prompts during package installation
ENV NODE_VERSION=20.7.0 \
    PATH="/usr/local/bin:$PATH"

# Set the timezone to Hong Kong
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime && \
    echo "Asia/Hong_Kong" > /etc/timezone && \
    apk del tzdata

# Install additional tools and dependencies
RUN apk update && \
    apk add --no-cache openrc openssh syslog-ng  && \
    ssh-keygen -A && \
    apk add --no-cache curl wget nano

# Enable services in OpenRC
# default make sshd to be run at runlevel after boot
RUN rc-update add sshd default   
# App.js winston-syslog will use syslog-ng
# no default, this will be run during booting
RUN rc-update add syslog-ng


# Install tools, dependencies, and Nginx
RUN apk add --no-cache nginx
RUN mkdir -p /run/nginx && \
    mkdir /run/openrc && touch /run/openrc/softlevel

# Add Nginx to OpenRC
 # default, run at runlevel after boot
RUN rc-update add nginx default 

# Copy CORS configuration and data directory
# COPY ./data /data

# Copy CORS configuration and data directory
# Copy the default nginx config with CORS enabled  # control CROS IP here
# COPY will treat the following comment as parameter, will error. DO NOT put comment at COPY end
COPY default.conf /etc/nginx/http.d


# Install dependencies, Node.js, and PM2
RUN apk add --no-cache \
        nodejs \
        npm \
    && npm install -g pm2@latest \
    && npm install bootstrap


# Set the working directory inside the container
WORKDIR /app

# Copy your application files into the container
COPY . /app
COPY syslog-ng.conf /etc/syslog-ng
COPY node_modules/bootstrap/dist/css/bootstrap.min.css /app/html/css/

# Install application dependencies
RUN npm install

# Expose the application port
EXPOSE 3000
EXPOSE 80
EXPOSE 22



COPY startapp.sh /usr/local/bin/startapp.sh
RUN chmod +x /usr/local/bin/startapp.sh

# Set the command to execute the start script
CMD ["/usr/local/bin/startapp.sh"]

# Specify the command to run your Node.js application using pm2
#CMD ["pm2-runtime", "start", "app.js"]
