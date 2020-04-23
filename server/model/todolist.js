async function getList(database) {
  const result = await database.all('SELECT * FROM todo WHERE state <> 2 ORDER BY state DESC');
  return result;
}

async function addTask(database, {text, state}) {
  try {
    const data = await database.run('INSERT INTO todo(text,state) VALUES (?, ?)', text, state);
    return {err: '', data};
  } catch (ex) {
    return {err: ex.message};
  }
}

async function updateTask(database, {id, state}) {
  try {
    const data = await database.run('UPDATE todo SET state = ? WHERE id = ?', state, id);
    return {err: '', data};
  } catch (ex) {
    return {err: ex.message};
  }
}


module.exports = {
  getList,
  addTask,
  updateTask,
};