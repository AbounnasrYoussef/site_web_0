#!/usr/bin/env sh
set -e

echo "Installing host dependencies for dashboard/backend..."
npm install
echo "Generating Prisma client on host..."
npx prisma generate
echo "Done. Reload VSCode window if errors persist."