# Docker Setup for salo.market

## Quick Start

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   Open http://localhost:3000 in your browser

## Data Persistence

All data is stored in the `./data` directory:
- `./data/db/` - SQLite database files
- `./data/uploads/` - Uploaded product images

This directory is mounted as a volume, so your data persists between container restarts.

## Environment Variables

Create a `.env` file in the project root (copy from `.env.docker.example`):

```env
JWT_SECRET=your-very-secure-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
```

## Docker Commands

### Start the application:
```bash
docker-compose up -d
```

### Stop the application:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f
```

### Rebuild after code changes:
```bash
docker-compose build
docker-compose up -d
```

### Clean up everything (including volumes):
```bash
docker-compose down -v
```

## Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Ensure proper file permissions for the data directory
3. Consider using a reverse proxy (nginx/traefik) for SSL
4. Set up regular backups of the `./data` directory

## Troubleshooting

### Permission Issues
If you encounter permission issues with the data directory:
```bash
sudo chown -R 1001:1001 ./data
```

### Database Lock Errors
If the database is locked, ensure only one instance is running:
```bash
docker-compose down
docker-compose up -d
```