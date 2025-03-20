#!/bin/sh

# Copy nanorc configuration file to /etc
cp nanorc /etc/nanorc

# Create the /usr/share/nano directory if it doesn't exist
mkdir -p /usr/share/nano

# Copy all files from nanorc1 directory to /usr/share/nano
cp nanorc1/*.* /usr/share/nano/

# Print completion message
echo "Files copied successfully!"
