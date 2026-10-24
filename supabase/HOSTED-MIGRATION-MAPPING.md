# Migration history coordination

Parent confirmed these four reviewed SQL bodies were applied to project
`apkfyxfmsndwqjfetdad` through its connector. This checkout has not accessed a
hosted database. Connector-generated versions differ from local CLI filenames:

| Local version | Hosted version | Name |
| --- | --- | --- |
| 20261024160612 | 20261024162912 | cms_foundation |
| 20261024160620 | 20261024164747 | cms_content_and_media |
| 20261024160627 | 20261024164820 | cms_admin_and_instagram |
| 20261024161315 | 20261024164833 | cms_existing_content |

Do not run `db push`, reset, repair or replay these migrations yet. Proposed
reconciliation: parent verifies each hosted stored SQL body against the reviewed
file, then rename the four local files to their matching hosted versions and
update generator/documentation references. This changes local filenames only,
not the hosted migration history. If bodies differ, stop and inspect the exact
diff; do not mark divergent SQL as equivalent. No repair command has been run.

New local `20261024164822_cms_page_content.sql` imports existing page/common text.
It remains unapplied pending parent review. Its local timestamp predates the
last hosted migration, so coordinate a new local filename after all four hosted
versions (or match the connector's eventual version) before future CLI pushes.
Never apply this file with `--include-all` just to bypass version mismatches.

After reconciliation, compare local/remote migration lists read-only on the
single authorized project before enabling any automated migration workflow.
