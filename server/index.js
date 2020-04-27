const fs = require('fs');
const path = require('path');
const url = require('url');
const mime = require('mime');
const zlib = require('zlib');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');
const {Server, Router} = require('./lib/interceptor');

const dbFile = path.resolve(__dirname, '../database/todolist.db');
let db = null;

const app = new Server();
const router = new Router();

app.use(async ({req}, next) => {
  console.log(`${req.method} ${req.url}`); // eslint-disable-line no-console
  await next();
});

const param = require('./aspect/param');
app.use(param);

const cookie = require('./aspect/cookie');
app.use(cookie);

app.use(async (ctx, next) => {
  if(!db) {
    db = await open({
      filename: dbFile,
      driver: sqlite3.cached.Database,
    });
  }
  ctx.database = db;

  await next();
});

app.use(router.get('/list', async ({database, route, res}, next) => {
  res.setHeader('Content-Type', 'application/json');
  const {getList} = require('./model/todolist');
  const result = await getList(database);
  res.body = {data: result};
  await next();
}));

app.use(router.post('/add', async ({database, params, res}, next) => {
  res.setHeader('Content-Type', 'application/json');
  const {addTask} = require('./model/todolist');
  const result = await addTask(database, params);
  res.body = result;
  await next();
}));

app.use(router.post('/update', async ({database, params, res}, next) => {
  res.setHeader('Content-Type', 'application/json');
  const {updateTask} = require('./model/todolist');
  const result = await updateTask(database, params);
  res.body = result;
  await next();
}));

app.use(router.post('/login', async (ctx, next) => {
  const {database, params, res} = ctx;
  res.setHeader('Content-Type', 'application/json');
  const {login} = require('./model/user');
  const result = await login(database, ctx, params);
  res.body = result || {err: 'invalid user'};
  await next();
}));

app.use(router.get('.*', async ({req, res}, next) => {
  let filePath = path.resolve(__dirname, path.join('../www', url.fileURLToPath(`file:///${req.url}`)));

  if(fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if(stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    if(fs.existsSync(filePath)) {
      const {ext} = path.parse(filePath);
      const stats = fs.statSync(filePath);
      const timeStamp = req.headers['if-modified-since'];
      res.statusCode = 200;
      if(timeStamp && Number(timeStamp) === stats.mtimeMs) {
        res.statusCode = 304;
      }
      const mimeType = mime.getType(ext);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'max-age=86400');
      res.setHeader('Last-Modified', stats.mtimeMs);
      const acceptEncoding = req.headers['accept-encoding'];
      const compress = acceptEncoding && /^(text|application)\//.test(mimeType);
      let compressionEncoding;
      if(compress) {
        acceptEncoding.split(/\s*,\s*/).some((encoding) => {
          if(encoding === 'gzip') {
            res.setHeader('Content-Encoding', 'gzip');
            compressionEncoding = encoding;
            return true;
          }
          if(encoding === 'deflate') {
            res.setHeader('Content-Encoding', 'deflate');
            compressionEncoding = encoding;
            return true;
          }
          if(encoding === 'br') {
            res.setHeader('Content-Encoding', 'br');
            compressionEncoding = encoding;
            return true;
          }
          return false;
        });
      }
      if(res.statusCode === 200) {
        const fileStream = fs.createReadStream(filePath);
        if(compress && compressionEncoding) {
          let comp;
          if(compressionEncoding === 'gzip') {
            comp = zlib.createGzip();
          } else if(compressionEncoding === 'deflate') {
            comp = zlib.createDeflate();
          } else {
            comp = zlib.createBrotliCompress();
          }
          res.body = fileStream.pipe(comp);
        } else {
          res.body = fileStream;
        }
      }
    }
  } else {
    res.setHeader('Content-Type', 'text/html');
    res.body = '<h1>Not Found</h1>';
    res.statusCode = 404;
  }

  await next();
}));

app.use(router.all('.*', async ({params, req, res}, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.body = '<h1>Not Found</h1>';
  res.statusCode = 404;
  await next();
}));

app.listen({
  port: 9090,
  host: '0.0.0.0',
});