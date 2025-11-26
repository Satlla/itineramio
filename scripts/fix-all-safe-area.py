#!/usr/bin/env python3
"""
Script to add safe-area padding to all dashboard pages
Adds style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}
to min-h-screen containers
"""

import re
import os

# Files that need fixing
files_to_fix = [
    "app/(dashboard)/analytics/page.tsx",
    "app/(dashboard)/property-sets/page.tsx",
    "app/(dashboard)/property-sets/new/page.tsx",
    "app/(dashboard)/account/billing/page.tsx",
    "app/(dashboard)/account/page.tsx",
    "app/(dashboard)/account/plans/page.tsx",
    "app/(dashboard)/properties/page.tsx",
    "app/(dashboard)/properties/[id]/page.tsx",
    "app/(dashboard)/properties/[id]/announcements/page.tsx",
    "app/(dashboard)/properties/groups/page.tsx",
    "app/(dashboard)/properties/[id]/zones/qr/page.tsx",
    "app/(dashboard)/properties/[id]/zones/new/page.tsx",
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
]

def fix_file(filepath):
    """Add safe-area padding to file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern 1: Fix incorrect paddingTop (missing calc wrapper)
        content = re.sub(
            r'paddingTop: [\'"]env\(safe-area-inset-top, 0px\)[\'"]',
            r'paddingTop: \'calc(4rem + env(safe-area-inset-top, 0px))\'',
            content
        )

        # Pattern 2: Add style prop to min-h-screen without existing style
        # Match: <div className="..." where className contains "min-h-screen" and no style prop
        pattern = r'(<div\s+className="[^"]*min-h-screen[^"]*")(\s*>)'

        def replacement(match):
            opening_tag = match.group(1)
            closing = match.group(2)

            # Check if style already exists in opening tag
            if 'style={' in opening_tag:
                return match.group(0)  # Don't modify if style exists

            # Add style prop
            return f'{opening_tag} style={{{{ paddingTop: \'calc(4rem + env(safe-area-inset-top, 0px))\' }}}}{closing}'

        content = re.sub(pattern, replacement, content)

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
    print("🔧 Fixing safe-area padding on dashboard pages...\n")

    fixed_count = 0
    for filepath in files_to_fix:
        if fix_file(filepath):
            fixed_count += 1

    print(f"\n📊 Summary: Fixed {fixed_count} out of {len(files_to_fix)} files")

if __name__ == "__main__":
    main()
