import knex from "knex";
import "dotenv/config";

const mainDbConfig = {
	client: "mysql2",
	connection: {
		host: "db",
		port: 3306,
		user: "root",
		password: process.env.MYSQL_PASSWORD || "1234",
		database: process.env.MYSQL_DB_NAME || "imdb_data",
	},
};

const mainDbConnection = knex(mainDbConfig);

export { mainDbConnection };
