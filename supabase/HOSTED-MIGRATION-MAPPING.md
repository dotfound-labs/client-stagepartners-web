# Migration filenames reconciled

Only target: apkfyxfmsndwqjfetdad. The six stored hosted SQL bodies were compared
exactly with reviewed artifacts. Current local bodies were also compared against
reviewed commit 19e865d (line endings normalized) before renaming. All matched.
Only filenames and local references changed; SQL bodies and hosted history did not.

| Current local / hosted version | Previous local version | Name |
| --- | --- | --- |
| 20261024162912 | 20261024160612 | cms_foundation |
| 20261024164747 | 20261024160620 | cms_content_and_media |
| 20261024164820 | 20261024160627 | cms_admin_and_instagram |
| 20261024164833 | 20261024161315 | cms_existing_content |
| 20261024174313 | 20261024164822 | cms_page_content |
| 20261024174351 | 20261024170841 | cms_typed_pages_and_verified_media |

20261024180000_cms_integration_runtime.sql remains unapplied and sorts after all
six applied files. No db push, reset, repair, --include-all or hosted history
mutation was executed. Before any future deployment, verify the exact project
and current hosted migration list; migration application remains a separate step.
