/**
 * Watcher which triggers incremental build for select libs via tsx
 * Also copies changed css/scss files to the dist folder when needed
 * All for hot-reloading. Run `npm run watcher` alongside `npm run start` to enable.
 * **npm runs could be combined, idk how though ;)
 */
const chokidar = require('chokidar');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const libsToWatch = [
  'lib/tapisui-hooks',
  'lib/tapisui-common',
  'lib/tapisui-extensions-core',
  'lib/tapisui-api',
  'lib/icicle-tapisui-extension',
  // Add other libraries you want watched and rebuilt here
];

libsToWatch.forEach((libPath) => {
  console.log(`Watching:   ${libPath}`);
  const watcher = chokidar.watch(`${libPath}/src`, { ignoreInitial: true });

  watcher.on('all', (event, filePath) => {
    // ONLY WORKS ON SUBLIBS. Not on root of app!
    // Prettier runs on changed files
    // Temporarily unwatch the file
    watcher.unwatch(filePath);
    exec(
      `npx prettier --single-quote --write "${filePath}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error - Prettier - ${filePath}: ${error}`);
          // Rewatch the file even if prettier fails to ensure it's not missed in future changes
          watcher.add(filePath);
          return;
        }

        // Rewatch the file after prettification
        watcher.add(filePath);

        console.log(`Prettied:   ${stdout}`);
      }
    );

    if (filePath.endsWith('.css') || filePath.endsWith('.scss')) {
      // Handle CSS and SCSS files separately
      const destPath = filePath.replace('/src/', '/dist/');
      fs.copyFile(filePath, destPath, (err) => {
        if (err) {
          console.error(`Error copying file ${filePath}: ${err}`);
          return;
        }
        console.log(`Copying:    ${filePath}`);
      });
    } else {
      // rebuild is incremental due to the lib/libname/tsconfig.json > compilerOptions
      // > incremental: true, meaning only changed files are recompiled
      console.log(`Rebuilding: ${libPath}`);
      exec(
        `cd ${libPath} && npx tsc --build ./tsconfig.json`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error rebuilding ${libPath}: ${error}\n${stdout}`);
            return;
          }
          console.log(`Rebuilt:    ${libPath} ${filePath}`);
        }
      );
    }
  });
});
