import knex from "knex";
import "dotenv/config";

const dbConfig = {
	client: "mysql2",
	connection: {
		host: "db",
		port: 3306,
		user: "root",
		password: "1234",
		database: "dataset_sql",
	},
};

const connection = knex(dbConfig);

export { connection };
