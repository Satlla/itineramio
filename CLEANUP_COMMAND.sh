#!/bin/bash
# Execute this command to fix the build error:
rm -rf app/api/public/resolve-property/\[propertyId\]
rm -f URGENT_DELETE_DIRECTORY.md
rm -f temp_delete_me.txt
rm -f remove_conflicting_route.sh
rm -f manual_cleanup.txt
rm -f CLEANUP_COMMAND.sh
echo "Build error fixed - conflicting route removed"