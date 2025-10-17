(async function(){
  try {
    const fs = require('fs').promises;
    const initSqlJs = require('sql.js');
    const SQL = await initSqlJs();
    const file = await fs.readFile('./src/script/database.sqlite');
    const db = new SQL.Database(new Uint8Array(file));
    const res = db.exec('SELECT id, name, email, created_at FROM users');
    if (!res || res.length === 0) return console.log('No rows');
    const cols = res[0].columns;
    const values = res[0].values;
    const rows = values.map(r => {
      const obj = {};
      for (let i=0;i<cols.length;i++) obj[cols[i]]=r[i];
      return obj;
    });
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
