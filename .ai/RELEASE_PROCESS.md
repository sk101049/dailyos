# Release Process

DailyOS releases should stay simple and traceable.

## Versioning Approach

- Use semantic versioning: `MAJOR.MINOR.PATCH`.
- Increment `PATCH` for fixes and small documentation updates.
- Increment `MINOR` for new user-facing workflows.
- Increment `MAJOR` only for major direction or compatibility changes.

## Release Checklist

- [ ] Confirm all planned issue work is merged.
- [ ] Run relevant checks.
- [ ] Review the final diff or release branch.
- [ ] Update `docs/CHANGELOG.md`.
- [ ] Confirm the version number is correct.
- [ ] Create the release commit or tag when appropriate.

## Changelog Update Rule

Every release must update `docs/CHANGELOG.md` with:

- Version number
- Release date
- Added, changed, fixed, or removed items
- Any known limitations
