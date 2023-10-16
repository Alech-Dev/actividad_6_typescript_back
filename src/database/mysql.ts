import mysql from 'mysql'
import { config } from '../config/config';


// export async function connect() {
//   const connection = await mysql.createConnection(config.database);
//   return connection;
// }

export default class ConnectionMysql {
  private static newInstance: ConnectionMysql;
  conn: mysql.Connection;

  constructor() {
    this.conn = mysql.createConnection(config.database);
    this.connectionDB();
  }

  public static get instance() {
    return this.newInstance || (this.newInstance = new this());
  }

  static querySingle(sql: string): Promise<any> {
    return new Promise ((res, rej) => {
      this.instance.conn.query(sql, (err, results, fields) => {
        if (err) {
          console.log(err);
          rej(err);
        }
        res(results[0] !== undefined ? results[0][0] : results[0]);
      });
    })
  }

  static queryMultiple(sql: string): Promise<any> {
    return new Promise ((res, rej) => {
      this.instance.conn.query(sql, (err, results, fields) => {
        if (err) {
          console.log(err);
          rej(err);
        }
        res(results);
      });
    })
  }

  private connectionDB() {
    this.conn.connect((err: mysql.MysqlError): any => {
      if (err) {
        return (err.message);
      }
    });
  }
}
