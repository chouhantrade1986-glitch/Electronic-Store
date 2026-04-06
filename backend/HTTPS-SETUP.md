# HTTPS Enforcement Guide

## Production HTTPS Setup

For production deployment, follow one of these approaches:

### Option 1: Nginx Reverse Proxy (Recommended)
```nginx
# /etc/nginx/sites-available/electromart
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL certificates (.crt and .key files)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS header (already set by Helmet.js, but redundant here)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Redirect HTTP to HTTPS
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Option 2: Express HTTPS with Node.js
```javascript
// Only for development - use reverse proxy in production
const https = require("https");
const fs = require("fs");

const options = {
  key: fs.readFileSync("path/to/private.key"),
  cert: fs.readFileSync("path/to/certificate.crt")
};

https.createServer(options, app).listen(4000);
```

### Option 3: AWS/GCP/Azure Managed SSL
Use cloud provider's built-in SSL/TLS management:
- AWS: AWS Certificate Manager + Application Load Balancer
- GCP: Cloud Armor + Cloud Load Balancing
- Azure: Azure Application Gateway + Managed SSL

## Let's Encrypt Free SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d api.yourdomain.com

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal
sudo certbot renew --dry-run
```

## Environment Variables for HTTPS

Add to `.env` (production):
```bash
# Enforce HTTPS
HTTPS_ONLY=true
SECURE_COOKIE=true
TRUST_PROXY=true
```

## Verification Checklist

- [ ] SSL certificate installed and valid
- [ ] HTTPS redirects HTTP traffic
- [ ] HSTS header present (`max-age` set correctly)
- [ ] TLS 1.2+ only (no SSL 3.0, TLS 1.0, 1.1)
- [ ] Strong cipher suites configured
- [ ] CSP headers correct for HTTPS
- [ ] Cookie flags: Secure + HttpOnly + SameSite
- [ ] Certificate auto-renewal working

## Testing HTTPS

```bash
# Check SSL grade
curl -I https://api.yourdomain.com

# Verify security headers
curl -H "User-Agent: PostmanRuntime/7" https://api.yourdomain.com/api/health

# Test TLS version
openssl s_client -connect api.yourdomain.com:443 -tls1_2
```

---
See [SECURITY-IMPLEMENTATION.md](./SECURITY-IMPLEMENTATION.md) for more details.
