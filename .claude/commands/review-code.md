# Code Review

Review the current changes for production readiness.

## Check for:

### Security
- [ ] No hardcoded secrets
- [ ] Input validation on all user inputs
- [ ] Supabase RLS policies respected
- [ ] No SQL injection vectors
- [ ] Auth checks on protected routes

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Lazy loading where appropriate
- [ ] No memory leaks (useEffect cleanup)

### React Best Practices
- [ ] Proper key props on lists
- [ ] Controlled components
- [ ] Error boundaries where needed
- [ ] Loading states handled

### TypeScript
- [ ] No `any` types
- [ ] Proper interface definitions
- [ ] Null checks

### Code Quality
- [ ] DRY (no repeated code)
- [ ] Clear naming
- [ ] Small, focused functions

## Output
Provide list of issues found with severity: 🔴 Critical | 🟡 Warning | 🟢 Suggestion
