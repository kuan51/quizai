> [<< Documentation Index](./README.md)

# QuizAI Deployment Guide

This guide covers deploying QuizAI to various environments.

## Production Configuration

For production deployments, configure your environment:

```env
# Use your actual domain
NEXTAUTH_URL=https://yourdomain.com

# Generate a strong secret
NEXTAUTH_SECRET=your-32-character-secret

# Configure OAuth with production URLs
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
```

### SSL/TLS with Nginx

Example nginx configuration for reverse proxy with SSL:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Cloud Platform Deployments

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `src`
4. Configure environment variables in Vercel dashboard
5. Deploy

Note: For SQLite persistence on Vercel, consider using:
- Turso (SQLite edge database)
- PlanetScale (MySQL compatible)

### Railway

1. Connect your GitHub repository
2. Set the root directory to `src`
3. Add environment variables
4. Railway will auto-detect Next.js and deploy

### Fly.io

1. Install flyctl: `brew install flyctl`
2. Create a fly.toml in the src directory:

```toml
app = "quizai"
primary_region = "ord"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true

[[mounts]]
  source = "quiz_data"
  destination = "/app/data"
```

3. Deploy:
```bash
fly launch
fly secrets set NEXTAUTH_SECRET=your-secret
fly secrets set ANTHROPIC_API_KEY=your-key
# ... other secrets
fly deploy
```

---

## Database Considerations

### SQLite Persistence

The default SQLite database works well for:
- Single-instance deployments
- Low to moderate traffic
- Development and testing

Ensure:
- The `data` directory exists and is writable
- A backup strategy is in place

### Database Backup

Create a backup script:

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR=/path/to/backups
DATE=$(date +%Y%m%d_%H%M%S)
cp ./data/quiz.db $BACKUP_DIR/quiz_$DATE.db
```

### Scaling Considerations

For high-traffic deployments, consider:
- PostgreSQL with connection pooling
- Redis for session storage
- CDN for static assets

---

## Monitoring

### Health Checks

The `/api/health` endpoint returns:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Logging

The application uses structured logging via pino. In development, logs are pretty-printed. In production, logs are output as JSON for consumption by log aggregation services.

---

## Security Checklist

- [ ] Generate strong NEXTAUTH_SECRET (32+ characters)
- [ ] Use HTTPS in production
- [ ] Configure OAuth redirect URIs correctly
- [ ] Keep API keys secure (never commit to git)
- [ ] Enable firewall rules
- [ ] Regular security updates
- [x] Rate limiting (built-in, in-memory sliding window)
- [x] Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- [x] Structured security logging (Pino with field redaction)
- [x] Input validation (Zod schemas on all API boundaries)
- [ ] Set up monitoring and alerting

For the full security reference, see [Security](./SECURITY.md).

---

## Troubleshooting

### Application Won't Start

Common issues:
- Missing environment variables
- Port already in use
- Invalid OAuth configuration

### Database Errors

Ensure the `data` directory exists and is writable:
```bash
ls -la ./data
```

### OAuth Redirect Errors

Verify:
1. NEXTAUTH_URL matches your domain exactly
2. OAuth provider redirect URIs are configured
3. HTTPS is being used in production

---

**Next**: [Security](./SECURITY.md)
