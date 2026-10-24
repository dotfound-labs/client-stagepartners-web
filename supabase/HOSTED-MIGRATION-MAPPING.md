# Migration history coordination

Only target: apkfyxfmsndwqjfetdad. Parent confirmed all six applied bodies.
They are immutable; the executor has not applied hosted migrations.

| Local version | Hosted version | Name |
| --- | --- | --- |
| 20261024160612 | 20261024162912 | cms_foundation |
| 20261024160620 | 20261024164747 | cms_content_and_media |
| 20261024160627 | 20261024164820 | cms_admin_and_instagram |
| 20261024161315 | 20261024164833 | cms_existing_content |
| 20261024164822 | 20261024174313 | cms_page_content |
| 20261024170841 | 20261024174351 | cms_typed_pages_and_verified_media |

20261024180000_cms_integration_runtime.sql is new and unapplied.

Do not run db push, reset, repair or replay local files blindly. Reconciliation
proposal: compare each hosted stored SQL body with its reviewed local file,
then rename the six local files to hosted versions and update generator paths.
This changes local names, not hosted history. If any body differs, inspect the
exact difference first. No history deletion/repair or filename reconciliation
has been executed. Do not use --include-all to bypass mismatched versions.
