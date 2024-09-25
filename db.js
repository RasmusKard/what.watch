import knex from "knex";

const dbConfig = {
	client: "mysql2",
	connection: {
		host: "localhost",
		port: 3306,
		user: "root",
		password: "1234",
		database: "dataset_sql",
	},
};

const connection = knex(dbConfig);

export { connection };
