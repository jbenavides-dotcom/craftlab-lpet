# Best Practices: Web Platform for Specialty Coffee Roasters

## North Star
> Turn process traceability into a **shared project (co-creation)**, not just a report.

---

## 1. Strategic Framing (SDT - Self-Determination Theory)

| Need | Platform Implementation |
|------|------------------------|
| **Autonomy** | Choose participation depth (observe → comment → co-decide), control notifications |
| **Competence** | Clear explanations, trends, "why this mattered" summaries, learning over time |
| **Relatedness** | Human connection to processing team, producers, origin context |

---

## 2. Benchmarks & References

| Platform | Strength | Learn From |
|----------|----------|------------|
| Farmer Connect | Consumer traceability, QR codes | Make provenance feel real |
| Cropster | B2B lot management, selective sharing | "Share what matters, hide what doesn't" |
| Algrano | Marketplace + relationship | Discovery + trade + traceability |
| Enveritas | Sustainability verification | Data collection at scale |

---

## 3. UX Patterns for Co-Processing

### Progressive Disclosure (3 layers)
| Layer | Content |
|-------|---------|
| 1. Fast scan | What's happening now, next milestone, risk flags, photos |
| 2. Decision support | Trends, comparisons to targets, QC notes, sample schedule |
| 3. Expert mode | Full logs, sensor exports, lab results, audit trails |

### Microinteractions
- "Update received"
- "Your input was recorded"
- "Decision locked"
- "Risk escalated"

### Responsible Gamification
- Progress-as-mastery > badges-as-bribes
- "Processing literacy" growth tied to real outcomes

### Performance
- Core Web Vitals (LCP, INP, CLS)
- PWA for offline + installability
- "Starts fast, stays fast"

---

## 4. Processing Data Model

### Variables to Capture
| Variable | Purpose |
|----------|---------|
| Temperature | Fermentation control |
| Time | Stage duration |
| pH | Acidity monitoring |
| °Brix | Sugar content |
| O₂/CO₂ | Aerobic/anaerobic conditions |
| Moisture % | Drying endpoint (target: 10-12%) |
| Water Activity (aw) | Stability indicator (SCA max: 0.70) |

### "Digital Lot Passport"
1. Preserves identity through transformations
2. Records what happened and why
3. Supports selective sharing
4. Audit-ready for disputes

---

## 5. Traceability & Compliance

### Standards
- **ISO 22005**: Traceability system design
- **EU Deforestation Regulation**: Dec 2026 deadline for large operators

### Selective Sharing
- Every field has sharing classification
- Each roaster relationship has "sharing contract"
- Default templates + overrides

### Privacy
- **Colombia**: Ley 1581 de 2012
- **UK/EU**: GDPR principles

---

## 6. Cloud Architecture

### Quality Pillars (AWS Well-Architected)
1. Operational excellence
2. Security
3. Reliability
4. Performance efficiency
5. Cost optimization
6. Sustainability

### Event-Driven Patterns
- Events: reading captured, stage changed, risk flag, intervention logged
- Use CloudEvents specification for event envelope
- Event Sourcing for audit trails (lot transformations, approvals)

### Security Baseline
- OWASP Top 10 awareness
- OAuth 2.0 / OpenID Connect
- Broken access control = #1 risk

### Observability
- OpenTelemetry for traces/metrics
- Tie incidents to UX impact

---

## 7. Team Training Tracks

| Track | Focus |
|-------|-------|
| Domain immersion | Coffee processing variables, avoid "dashboard theatre" |
| Experience design | Progressive disclosure, microinteractions |
| Engineering excellence | OWASP, OAuth, event-driven patterns |
| Measurement | DORA metrics, SUS usability scale |

### DORA Metrics
- Deployment frequency
- Lead time
- Change failure rate
- Time to restore

### "Done" Definition
1. **User value**: Measurable improvement + SUS delta
2. **Performance**: No Core Web Vitals regression
3. **Security**: OWASP compliance
4. **Traceability**: Lot history preserved

---

## Key Sources
- Specialty Coffee Association (SCA)
- Nielsen Norman Group (UX patterns)
- OWASP, ISO 22005
- Martin Fowler (Event Sourcing, CQRS)
- AWS Well-Architected Framework
