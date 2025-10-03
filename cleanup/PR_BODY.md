## Summary
- Produce a dry-run cleanup plan identifying legacy Python artifacts that are no longer referenced by the TypeScript application.
- Capture a machine-readable removal plan (`cleanup/trash_report.jsonl`) and a ready-to-apply diff (`cleanup/cleanup.diff`) covering two low-risk files totaling ~17.5 KB.
- Document an outdated server backup directory that requires manual review before any deletion.

## Evidence Highlights
- `example_usage.py` imports a Python backend (`core.base_entities`, `analysis_modules.*`) that no longer exists in the repository. 【F:example_usage.py†L1-L120】
- `requirements.txt` lists Python dependencies but is not referenced by any build, lint, or runtime tooling in this Node/TypeScript stack. 【F:requirements.txt†L1-L122】
- `backup_20251003_052813/` mirrors the `server/` tree yet diverges from the current implementation, indicating a historical snapshot rather than live code. 【F:cleanup/trash_report.jsonl†L1-L3】

## Verification
- Dry run script: `./cleanup/apply_cleanup.sh --dry-run`. 【4e3382†L1-L4】
- Vitest suite: `npm test`. 【662f58†L1-L6】【a103dc†L1-L12】
- Build and type-check commands currently fail because of missing scripts/entrypoints (documented in `cleanup/verification.md`).

## Rollback / Safety Nets
- Restoring files after applying the cleanup: extract the archived tarballs from `cleanup/_backup/` (created automatically by `apply_cleanup.sh --apply`).
- Alternatively, run `git restore example_usage.py requirements.txt` before committing the cleanup.
