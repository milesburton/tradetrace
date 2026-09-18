# Security Policy

## Reporting Security Vulnerabilities

**Do not open a public issue for security vulnerabilities.** Please report security issues privately to miles.burton@gmail.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 24 hours and work on a fix.

## Security Standards

tradetrace is built with security as a core concern:

- All user input is validated using Zod schemas
- SQL queries use parameterized statements to prevent injection
- Environment secrets are not committed (`.env.template` provided)
- GDPR compliance is a requirement for all features
- Data handling is audited for relationship inference (Article 22 compliance)

## Dependencies

We regularly audit and update dependencies. All dependencies are pinned in `deno.lock`.

## Deployment Security

- Never commit `.env` files or secrets
- Rotate Neo4j and Postgres credentials in production
- Use HTTPS for all client connections
- Enable database authentication in production
- Run containers with non-root users
- Monitor access logs for suspicious activity
