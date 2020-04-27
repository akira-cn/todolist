const crypto = require('crypto');

const {getSession, setSession} = require('./session');

async function login(database, ctx, {name, passwd}) {
  let userInfo = await getSession(database, ctx, name);
  if(userInfo) {
    return userInfo;
  }
  userInfo = await database.get('SELECT * FROM user WHERE name = ?', name);
  const salt = 'xypte';
  const hash = crypto.createHash('sha256').update(`${salt}${passwd}`, 'utf8').digest().toString('hex');
  if(userInfo && hash === userInfo.password) {
    const data = {id: userInfo.id, name: userInfo.name};
    setSession(database, ctx, name, data);
    return data;
  }
  return null;
}

module.exports = {
  login,
};