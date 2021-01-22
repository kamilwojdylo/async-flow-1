import http from 'http';
import url from 'url';

const RESPONSE_TIME = 100;

const stats = {
  third: 0,
  second: 0,
  first: 0
};

const server = http.createServer((req, res) => {
  const responseBody = `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8"/>
    </head>
    <body>
      <h1>Hello World!</h1>

      <p>This is a <a href="second/1/">link</a></p>
      <p>This is a <a href="second/2/">link</a></p>
      <p>This is a <a href="second/3/">link</a></p>
      <p>This is a <a href="second/4/">link</a></p>
      <p>This is a <a href="second/5/">link</a></p>

      <p>This is an <a href="https://wwww.wp.pl">external link</a></p>
    </body>
  </html>
  `;

  const secondResponseBody = `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8"/>
    </head>
    <body>
      <p>This is a second subpage.</p>
      <p>Second <a href="third/1">link to thrid page</a></p>
      <p>Second <a href="third/2">link to thrid page</a></p>
    </body>
  </html>
  `;

  const thirdResponseBody = `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8"/>
    </head>
    <body>
      <p>This is a third subpage.</p>
    </body>
  </html>
  `;


  res.setHeader('content-type', 'text/html');
  const requestUrl = url.parse(req.url);
  if ((requestUrl.pathname || '').includes('/second/third')) {
    stats.third += 1;
    console.log(stats);
    return setTimeout(() => res.end(thirdResponseBody), RESPONSE_TIME);
  }
  if ((requestUrl.pathname || '').includes('/third')) {
    stats.third += 1;
    console.log(stats);
    return setTimeout(() => res.end(thirdResponseBody), RESPONSE_TIME);
  }
  if ((requestUrl.pathname || '').includes('/second')) {
    stats.second += 1;
    console.log(stats);
    return setTimeout(() => res.end(secondResponseBody), RESPONSE_TIME);
  }

  stats.first += 1;
  console.log(stats);
  return res.end(responseBody);
});

server.listen(8080, () => console.log('Server listens'));
