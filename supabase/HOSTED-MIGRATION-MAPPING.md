# Migration filenames reconciled

Only target: apkfyxfmsndwqjfetdad. The first six stored hosted SQL bodies were compared
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

| 20261024183541 | 20261024180000 | cms_integration_runtime |

All seven migrations are applied to the target project. Migration 7 was applied
from reviewed Library v8; the local body matched that artifact before renaming,
and its bytes were preserved. External integrations remain disabled/unconfigured.
No db push, reset, repair, --include-all or hosted history mutation was executed
here. Before future migrations, verify the exact project and current hosted list.

| 20261025030912 | 20261025025557 | cms_publication_dates |

Migration 8 is applied. Its local Git blob was verified as
e4d8959bf7c93a6d18d79d0ed8a7daf231da986c before the filename-only rename.
All eight applied bodies are immutable. The encrypted-token migration remains
pending review/application and does not enable any external integration.
