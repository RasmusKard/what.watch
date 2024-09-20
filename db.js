import mysql from "mysql2/promise";

// Create the connection to database
const connection = await mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "1234",
	database: "content_data",
});

export { connection };
