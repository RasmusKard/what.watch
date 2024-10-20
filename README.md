**CD PREP**

Dependencies needed on destination (those that aren't included in Docker image):

1. Nginx
2. Docker + Docker compose
3. https://github.com/adnanh/webhook

_Setup_

1. Download dependencies above
2. Setup Nginx [Guide for Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04)
3. Build Docker images
4. Setup Nginx to reverse proxy the application
5. Setup adnanh/webhook to listen for Github Webhook (Only allow verified Github IPs through with Nginx)

**CD WORKFLOW**

1. On Github repo release webhook posts to server \*(1)
2. Adnanh/webhook triggers redeploy.sh (docker compose build)

(1) Only verified Github IPs are accepted by Nginx in the webhook route, everything else gets 403
