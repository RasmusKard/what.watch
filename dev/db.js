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

const infoDbConfig = {
	client: "mysql2",
	connection: {
		host: "db",
		port: 3306,
		user: "root",
		password: process.env.MYSQL_PASSWORD || "1234",
		database: process.env.MYSQL_INFO_DB_NAME || "general_info",
	},
};

const mainDbConnection = knex(mainDbConfig);
const infoDbConnection = knex(infoDbConfig);

export { mainDbConnection, infoDbConnection };
