#!/usr/bin/env python3
"""
Script to replace padding-top approach with DashboardSpacer component
"""

import re
import os

# Files to fix
files_to_fix = [
    "app/(dashboard)/analytics/page.tsx",
    "app/(dashboard)/property-sets/page.tsx",
    "app/(dashboard)/property-sets/new/page.tsx",
    "app/(dashboard)/main/page.tsx",
    "app/(dashboard)/account/billing/page.tsx",
    "app/(dashboard)/account/page.tsx",
    "app/(dashboard)/account/plans/page.tsx",
    "app/(dashboard)/properties/page.tsx",
    "app/(dashboard)/properties/[id]/page.tsx",
    "app/(dashboard)/properties/[id]/announcements/page.tsx",
    "app/(dashboard)/properties/groups/page.tsx",
    "app/(dashboard)/properties/[id]/zones/qr/page.tsx",
    "app/(dashboard)/properties/[id]/zones/new/page.tsx",
    "app/(dashboard)/properties/[id]/zones/page.tsx",
    "app/(dashboard)/properties/groups/new/page.tsx",
    "app/(dashboard)/subscription-success/page.tsx",
    "app/(dashboard)/subscriptions/page.tsx",
    "app/(dashboard)/pricing-v2/page.tsx",
    "app/(dashboard)/test-login/page.tsx",
    "app/(dashboard)/properties/[id]/zones/[zoneId]/steps/page.tsx",
    "app/(dashboard)/properties/[id]/zones/[zoneId]/steps/new/page.tsx",
    "app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx",
    "app/(dashboard)/checkout/manual/page.tsx",
    "app/(dashboard)/properties/groups/[id]/page.tsx",
    "app/(dashboard)/properties/new/page.tsx",
]

def fix_file(filepath):
    """Remove padding-top style and add DashboardSpacer import + usage"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Step 1: Remove the paddingTop style prop
        content = re.sub(
            r' style=\{\{\s*paddingTop:\s*[\'"]calc\(4rem \+ env\(safe-area-inset-top,\s*0px\)\)[\'\"]\s*\}\}',
            '',
            content
        )

        # Step 2: Add DashboardSpacer import if not present and if file has min-h-screen
        if 'min-h-screen' in content and 'DashboardSpacer' not in content:
            # Find the last import statement
            import_pattern = r'(import\s+.*\s+from\s+[\'"].*[\'"])'
            imports = list(re.finditer(import_pattern, content))

            if imports:
                last_import = imports[-1]
                insert_pos = last_import.end()

                # Add the new import
                new_import = "\nimport { DashboardSpacer } from '../../../src/components/layout/DashboardSpacer'"

                # Adjust path based on depth
                depth = filepath.count('/') - 2  # Subtract 2 for app/(dashboard)
                if depth == 1:  # e.g., main/page.tsx
                    new_import = "\nimport { DashboardSpacer } from '../../src/components/layout/DashboardSpacer'"
                elif depth == 2:  # e.g., properties/new/page.tsx
                    new_import = "\nimport { DashboardSpacer } from '../../../src/components/layout/DashboardSpacer'"
                elif depth == 3:  # e.g., properties/[id]/zones/page.tsx
                    new_import = "\nimport { DashboardSpacer } from '../../../../src/components/layout/DashboardSpacer'"
                elif depth == 4:  # e.g., properties/[id]/zones/[zoneId]/page.tsx
                    new_import = "\nimport { DashboardSpacer } from '../../../../../src/components/layout/DashboardSpacer'"
                elif depth == 5:  # e.g., properties/[id]/zones/[zoneId]/steps/page.tsx
                    new_import = "\nimport { DashboardSpacer } from '../../../../../../src/components/layout/DashboardSpacer'"

                content = content[:insert_pos] + new_import + content[insert_pos:]

        # Step 3: Add <DashboardSpacer /> after <DashboardNavbar /> or after opening div
        # Pattern: Find <DashboardNavbar ... /> and add <DashboardSpacer /> after it
        if 'DashboardNavbar' in content and '<DashboardSpacer />' not in content:
            content = re.sub(
                r'(<DashboardNavbar[^/>]*/>)',
                r'\1\n      <DashboardSpacer />',
                content
            )
        # If no DashboardNavbar, add after the first min-h-screen div opening tag
        elif '<DashboardSpacer />' not in content and 'min-h-screen' in content:
            content = re.sub(
                r'(<div className="min-h-screen[^"]*">)',
                r'\1\n      <DashboardSpacer />',
                content,
                count=1
            )

        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"⏭️  Skipped (no changes): {filepath}")
            return False

    except FileNotFoundError:
        print(f"❌ Not found: {filepath}")
        return False
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    print("🔧 Replacing padding-top with DashboardSpacer...\n")

    fixed_count = 0
    for filepath in files_to_fix:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n📊 Summary: Fixed {fixed_count} out of {len(files_to_fix)} files")

if __name__ == "__main__":
    main()
