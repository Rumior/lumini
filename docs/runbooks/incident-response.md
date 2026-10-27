# Runbook: Incident Response

## On-Call Procedures
1. **Acknowledge** - Acknowledge incident within 15 minutes
2. **Assess** - Determine severity (P0-P3)
3. **Mitigate** - Apply fix or rollback
4. **Communicate** - Update stakeholders
5. **Resolve** - Verify fix and document

## Common Issues
- **Database connection errors**: Check connection pool, restart if needed
- **High error rates**: Check logs, rollback recent deployment
- **Auth failures**: Verify auth service status
- **Performance degradation**: Scale resources, check queries

## Rollback Procedure
1. Identify last known good deployment
2. Run rollback via CI/CD
3. Verify health checks pass
4. Monitor for 30 minutes
5. Document incident
