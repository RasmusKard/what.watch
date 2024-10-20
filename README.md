# **CD Prep**

### Dependencies Needed on Destination

_(These are not included in the Docker image)_

- **Nginx**
- **Docker + Docker Compose**
- [adnanh/webhook](https://github.com/adnanh/webhook)

### Setup Steps

1. Install the dependencies listed above.
2. Set up Nginx:
   - Follow this [guide for Ubuntu 22.04](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-22-04).
3. Build the Docker images.
4. Configure Nginx to reverse proxy the application.
5. Configure `adnanh/webhook` to listen for GitHub webhooks:
   - Ensure that only **verified GitHub IPs** are allowed through Nginx, blocking all others with a `403 Forbidden`.

---

# **CD Workflow**

1. **GitHub Release:** When a new release is made, the GitHub webhook posts to the server.  
   \* (1)
2. **Webhook Trigger:** `adnanh/webhook` triggers the `redeploy.sh` script, which runs `docker compose build`.

---

### Notes:

- **(1)**: Only requests from **verified GitHub IPs** are allowed by Nginx on the webhook route. All other requests are blocked with a `403 Forbidden` response.
