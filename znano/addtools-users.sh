#!/bin/sh

# Update package index and busybox
apk --no-cache update
apk --no-cache upgrade busybox

# Install necessary packages
apk add --no-cache sudo
# apk add --no-cache nano
apk add --no-cache supervisor

# Add users with specific passwords and group
adduser -D spuser -G wheel
echo "spuser:123pass" | chpasswd

adduser -D nuser
echo "nuser:123" | chpasswd

# Change root password
echo "root:superman" | chpasswd

# Set permissions for busybox
chmod u+s /bin/busybox

# Set ownership and permissions for Nginx HTML directory
chown -R root:wheel /usr/share/nginx/html
chmod -R g+w /usr/share/nginx/html

# Print completion message
echo "Setup complete!"
  
