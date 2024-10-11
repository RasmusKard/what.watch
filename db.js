import knex from "knex";
import "dotenv/config";

const dbConfig = {
	client: "mysql2",
	connection: {
		host: "db",
		port: process.env.DB_PORT,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE_NAME,
	},
};

const connection = knex(dbConfig);

export { connection };
