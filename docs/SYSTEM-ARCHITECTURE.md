# Grey Fabric Costing — System Architecture

## Architectural Principles

1. **Deterministic Backend Engine**:
   - All textile calculations live in the Node.js backend calculation service (`calculationService.js`).
   - Prevents client tampering, formula divergence, and ensures audit reproducibility.

2. **Phase 1 Isolation**:
   - No commercial selling prices, customer invoicing, or profit calculations exist in Phase 1.
   - Preserves clean manufacturing domain boundaries.

3. **Multi-Tier Theme Specification**:
   - Master visual reference: Dark analytical dashboard with vibrant orange (`#F66103` / `#FF6B00`) accents.
   - Surfaces:
     - Base Canvas: `#0D0E11`
     - Sidebar / Header: `#121316` / `#16171B`
     - Elevated Cards: `#18191E` with `#24262E` borders
     - Active Element Fill: `rgba(246, 97, 3, 0.14)` with `#F66103` border and text

```
┌────────────────────────────────────────┐
│             FRONTEND                   │
│   React 18 + Vite + Tailwind CSS       │
│   Recharts Glow Charts + Lucide Icons  │
└───────────────────┬────────────────────┘
                    │
           HTTPS / JSON REST API
                    │
┌───────────────────▼────────────────────┐
│              BACKEND                   │
│   Express.js REST API                  │
│   JWT Auth + Role-Based Access Control │
│   Textile Engineering Engine (Ne/Ends) │
└───────────────────┬────────────────────┘
                    │
┌───────────────────▼────────────────────┐
│             DATABASE                   │
│   SQLite (Zero-config embedded local)  │
│   PostgreSQL (Production ready DDL)    │
└────────────────────────────────────────┘
```
