const sessionKey = 'interceptor_js';

async function getSession(database, ctx, name) {
  const key = ctx.cookies[sessionKey];
  if(key) {
    const now = Date.now();
    const session = await database.get('SELECT * FROM session WHERE key = ? and name = ? and expires > ?',
      key, name, now);
    if(session) {
      return JSON.parse(session.value);
    }
  }
  return null;
}

async function setSession(database, ctx, name, data) {
  const res = ctx.res;
  let key = ctx.cookies[sessionKey];
  if(!key) { // 如果cookie不存在，重新生成一个key
    key = Math.random().toString(36).slice(2);
  }
  res.setHeader('Set-Cookie', `interceptor_js=${key}; Max-Age=${7 * 86400}`); // 过期时间为一周
  try {
    const result = await database.run(`INSERT INTO session(key, name, value, created, expires)
      VALUES (?, ?, ?, ?, ?)`,
    key,
    name,
    JSON.stringify(data),
    Date.now(),
    Date.now() + 7 * 86400);
    return {err: '', result};
  } catch (ex) {
    return {err: ex.message};
  }
}

module.exports = {
  getSession,
  setSession,
};
