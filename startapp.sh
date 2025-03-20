#!/bin/sh

# Initialize OpenRC
# start all services registered in rc-update in dockerfile
openrc default  

npm start

#pm2 start app.js

# Keep the container running
tail -f /dev/null



