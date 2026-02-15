# Fix admin-web startup (styled-jsx / Next.js)

If you see `Cannot find module 'styled-jsx/package.json'` or similar:

1. **Close** all terminals, editors, and processes using this project.

2. **Delete** `node_modules` and `package-lock.json`:
   - In File Explorer, delete `admin-web/node_modules` (if it fails, try again after closing apps)
   - Delete `admin-web/package-lock.json`

3. **Reinstall**:
   ```bash
   cd admin-web
   npm cache clean --force
   npm install
   npm run dev
   ```

4. If `npm install` still fails with ENOTEMPTY/ENOENT:
   - Restart your computer
   - Or run from a new terminal as Administrator
   - Or use: `npx rimraf node_modules` then `npm install`

## Changes made

- `package.json` updated: Next.js 14.2.21, styled-jsx ^5.1.1
- Pinned stable 14.x (no canary)
