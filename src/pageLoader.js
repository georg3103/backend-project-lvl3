import { promises as fsPromises } from 'fs';

/**
 * @param {String} link
 * @param {Object} options
 */
export default (link, options) => {
  const data = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>test</title>
  <link href="/style.css">
</head>
<body>
  <a href="/foo">foo</a>
  <a href="https://www.google.com/">google</a>
  <img src="/image.png" />
  <img src="/folder/image.png" />
  <script src="/script.txt"></script>
</body>
  `.trim();
  return fsPromises.writeFile(`${options.output}/test-com.html`, data);
};
