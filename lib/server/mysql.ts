import mysql from "mysql2/promise";

let connection: any;

export async function getMySQLConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: '64.227.141.14',
      port: 3306,
      user: 'root_amitkk',
      password: 'txm8Ql3tUciXp2LKBIwgfT6N3j23oj9W84EJQk',
      database: 'amitkkae'
    });
  }
  return connection;
}