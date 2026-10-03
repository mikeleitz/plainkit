# public: plainkit a stranger can use

**public-8 is done.** Do not start another release unless a human
names it.

Sizes are agent session cost. See `CHANGELOG.md`.

plainkit-migrator is out of this release. Do not edit other apps
from this repo.

## Track

| ID       | Name                   | Size | Status |
|----------|------------------------|------|--------|
| public-1 | Approve plan           | S    | done   |
| public-2 | Private archive        | M    | done   |
| public-3 | License and tool names | S    | done   |
| public-4 | Public docs            | L    | done   |
| public-5 | Drop private surfaces  | M    | done   |
| public-6 | Stranger smoke         | M    | done   |
| public-7 | Rewrite history        | S    | done   |
| public-8 | GitHub push            | S    | done   |

## Exits (shipped)

| ID       | Exit                                                                                                                                                                                      |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| public-1 | Release file and AGENTS.md pointer are in the repo. No kit code in that step.                                                                                                             |
| public-2 | Private archive holds the legacy stylesheet, the four finished pass files, the old changelog, and a private brief. Copies matched before removal.                                         |
| public-3 | LICENSE is MIT. README, make help, and scripts/release.sh do not name an external publish command. make release still only writes VERSION.                                                |
| public-4 | A new reader starts from the README: copy src/ and css/, make preview, make check. AGENTS states the architecture and the never-do list. Changelog bullets have no session-cost trailers. |
| public-5 | Public tree has no legacy stylesheet, no earlier pass files, and no session-cost ledger. make check passes. Login no longer says Google. Consumer copies are unchanged.                   |
| public-6 | Phrase search of tracked files is clean. Preview serves the recipe list. Private archive still has the legacy sheet and the old passes. Ready to push. No remote is added.                |
| public-7 | main is one commit of the current tree. Previous history remains on the lab branch archive/pre-public-history. Version tags were not published.                                           |
| public-8 | https://github.com/mikeleitz/plainkit is public. Only main was pushed.                                                                                                                    |
