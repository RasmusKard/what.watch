**CD WORKFLOW**

1. On Github repo release webhook posts to server \*(1)
2. Nodejs webhook route triggers docker compose using new packages
3. Docker compose is called, automatically killing the container(s) that have changed and rebuilding them

(1) Only verified Github IPs are accepted by Nginx in the webhook route, everything else gets 403
