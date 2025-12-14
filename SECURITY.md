# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to the repository maintainer. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Security Measures

This project implements the following security measures:

### Input Validation
- **build.js**: All command-line inputs are validated with strict regex patterns to prevent command injection and path traversal attacks
- Config file names must match: `^[a-zA-Z0-9_-]+\.json$`
- App names must match: `^[a-zA-Z0-9_-]+$`

### XSS Prevention
- **URL Sanitization**: All URLs in navigation components are sanitized to prevent XSS attacks
- Only safe protocols are allowed: `https://`, `http://`, `mailto:`, and relative URLs (`#`, `/`)
- Dangerous protocols like `javascript:`, `data:`, and `vbscript:` are blocked

### Content Security Policy
- Strict CSP headers are implemented in the HTML template
- Scripts are limited to same-origin only
- Inline styles are controlled (note: 'unsafe-inline' is currently allowed for Vite compatibility)
- Frame ancestors are blocked to prevent clickjacking
- **Future Improvement**: Consider implementing CSP nonces for inline styles in production builds

### Security Headers
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-XSS-Protection: 1; mode=block` - Enables XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

### GitHub Actions Security
- Minimal permissions granted (only `contents: write` for dist branch)
- Dependencies are pinned to specific versions
- Actions use official GitHub actions or trusted sources

## Best Practices

When contributing to this project:

1. **Never commit secrets** - Use environment variables for sensitive data
2. **Validate all inputs** - Always sanitize and validate user inputs
3. **Use dependencies carefully** - Only add well-maintained, trusted packages
4. **Keep dependencies updated** - Regularly update to patch security vulnerabilities
5. **Review config files** - Config files are compiled into the bundle, so ensure they don't contain sensitive data
6. **Monitor security events** - In production, implement proper logging infrastructure to capture security warnings (currently using console.warn for development)

## Environment Variables

Environment variables should never be committed to the repository. The `.gitignore` file is configured to exclude:
- `.env`
- `.env.local`
- `.env.*.local`

## Build-time Configuration

This project uses build-time configuration injection. Config files in `packages/app-config/` should:
- Never contain API keys, secrets, or credentials
- Only contain public configuration data
- Be reviewed before committing to ensure no sensitive data is included

## Dependencies

To check for known vulnerabilities in dependencies, run:

```bash
pnpm audit
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Content Security Policy Reference](https://content-security-policy.com/)
