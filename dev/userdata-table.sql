CREATE TABLE
	`user_seen_content` (
		`rowId` int NOT NULL AUTO_INCREMENT,
		`userId` varchar(20) NOT NULL,
		`tconst` varchar(12) NOT NULL,
		PRIMARY KEY (`rowId`)
	) ENGINE = InnoDB AUTO_INCREMENT = 190 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
	`username_ref` (
		`userId` varchar(20) NOT NULL,
		`username` varchar(100) NULL,
		`syncState` tinyint unsigned NOT NULL,
		`lastSync` datetime DEFAULT NULL,
		PRIMARY KEY (`userId`)
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;