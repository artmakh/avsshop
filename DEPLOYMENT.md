# Deployment Guide

This project uses GitHub Actions for CI/CD to automatically build Docker images and deploy to a remote host.

## CI/CD Setup

### 1. GitHub Container Registry (GHCR) Setup

The CI workflow automatically builds and pushes Docker images to GitHub Container Registry. No additional setup is required as it uses the built-in `GITHUB_TOKEN`.

### 2. GitHub Secrets Configuration

Configure the following secrets in your GitHub repository settings:

#### Required Secrets for Deployment:

- `DEPLOY_HOST`: The IP address or hostname of your deployment server
- `DEPLOY_USER`: SSH username for the deployment server
- `DEPLOY_SSH_KEY`: Private SSH key for authentication (RSA or ED25519)
- `ADMIN_USERNAME`: Admin username for the application
- `ADMIN_PASSWORD`: Admin password for the application
- `JWT_SECRET`: Secret key for JWT token signing (generate a secure random string)

#### Optional Secrets:

- `DEPLOY_PORT`: SSH port (default: 22)
- `DEPLOY_PATH`: Deployment directory path (default: /opt/salomarket)

### 3. Server Requirements

Your deployment server should have:

- Docker and Docker Compose installed
- SSH access enabled
- Port 3000 available (or configure a reverse proxy)
- `curl` installed for health checks

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Triggers on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch

Actions:
1. Builds Docker image
2. Pushes to GitHub Container Registry
3. Tags with branch name, SHA, and `latest` for main branch

### CD Workflow (`.github/workflows/cd.yml`)

Triggers on:
- Push to `main` branch
- Successful completion of CI workflow

Actions:
1. Connects to deployment server via SSH
2. Clones/updates repository
3. Creates environment file with secrets
4. Pulls latest Docker image
5. Deploys using `docker-compose.prod.yml`
6. Performs health check

## Manual Deployment

For manual deployment without GitHub Actions:

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

2. Create `.env` file:
   ```bash
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret_key
   DOCKER_IMAGE=ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
   ```

3. Deploy using production compose file:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Local Development

For local development, use the regular docker-compose.yml:

```bash
docker-compose up -d
```

This will build the image locally instead of pulling from GHCR.

## Environment Variables

- `NODE_ENV`: Set to `production` in deployed environments
- `JWT_SECRET`: Used for signing JWT tokens
- `ADMIN_USERNAME`: Initial admin user username
- `ADMIN_PASSWORD`: Initial admin user password
- `DOCKER_IMAGE`: Docker image to use (for production deployment)

## Security Notes

- Always use strong passwords for admin accounts
- Generate a secure JWT secret (recommended: 64+ character random string)
- Ensure your deployment server is properly secured
- Consider using a reverse proxy (nginx/traefik) for SSL termination
- Regularly update your server and Docker images

## Troubleshooting

1. **Deployment fails**: Check server SSH access and Docker installation
2. **Health check fails**: Verify the application is running on port 3000
3. **Image pull fails**: Ensure GHCR authentication is working
4. **Database issues**: Check volume mounts and permissions

For more details, check the GitHub Actions logs in your repository.