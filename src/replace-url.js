const fs = require('fs');
const path = require('path');

const oldUrl = 'http://35.192.124.70:8081/kafka-data';
const newUrl = 'https://harveypredictive.work.gd:8081/kafka-data/';

const buildDir = path.join(__dirname, 'build/static/js');

fs.readdir(buildDir, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory:', err);
  }

  files.forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(buildDir, file);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          return console.error('Error reading file:', err);
        }

        if (data.includes(oldUrl)) {
          const result = data.replace(new RegExp(oldUrl, 'g'), newUrl);

          fs.writeFile(filePath, result, 'utf8', (err) => {
            if (err) {
              return console.error('Error writing file:', err);
            }

            console.log(`URL replaced successfully in ${file}`);
          });
        }
      });
    }
  });
});
