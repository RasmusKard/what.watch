-- MySQL dump 10.13  Distrib 9.2.0, for Linux (x86_64)
--
-- Host: localhost    Database: imdb_data
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `imdb_data`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `imdb_data` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `imdb_data`;

--
-- Table structure for table `genres_ref`
--

DROP TABLE IF EXISTS `genres_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genres_ref` (
  `genres_id` tinyint unsigned NOT NULL,
  `genres_str` varchar(15) NOT NULL,
  PRIMARY KEY (`genres_id`),
  UNIQUE KEY `genres_str_UNIQUE` (`genres_str`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `title`
--

DROP TABLE IF EXISTS `title`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `title` (
  `tconst` varchar(12) NOT NULL,
  `titleType` tinyint unsigned NOT NULL,
  `primaryTitle` varchar(400) NOT NULL,
  `startYear` smallint unsigned NOT NULL,
  `runtimeMinutes` smallint unsigned DEFAULT NULL,
  `averageRating` decimal(3,1) unsigned NOT NULL,
  `numVotes` mediumint unsigned NOT NULL,
  PRIMARY KEY (`tconst`),
  UNIQUE KEY `tconst` (`tconst`),
  KEY `fk_ref_titleType_idx` (`titleType`),
  KEY `averageRating_idx` (`averageRating`),
  KEY `numVotes_idx` (`numVotes`),
  KEY `titleType_idx` (`titleType`),
  KEY `primaryTitle_idx` (`primaryTitle`),
  KEY `startYear_idx` (`startYear`),
  KEY `runtimeMinutes_idx` (`runtimeMinutes`),
  KEY `title_compound_idx` (`tconst`,`titleType`,`primaryTitle`,`startYear`,`runtimeMinutes`,`averageRating`,`numVotes`),
  CONSTRAINT `fk_ref_titleType` FOREIGN KEY (`titleType`) REFERENCES `titleType_ref` (`titleType_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `titleType_ref`
--

DROP TABLE IF EXISTS `titleType_ref`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `titleType_ref` (
  `titleType_id` tinyint unsigned NOT NULL,
  `titleType_str` varchar(15) NOT NULL,
  PRIMARY KEY (`titleType_id`),
  UNIQUE KEY `titleType_str_UNIQUE` (`titleType_str`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `title_genres`
--

DROP TABLE IF EXISTS `title_genres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `title_genres` (
  `tconst` varchar(12) NOT NULL,
  `genres` tinyint unsigned NOT NULL,
  PRIMARY KEY (`tconst`,`genres`),
  KEY `fk_genres_ref_idx` (`genres`),
  CONSTRAINT `fk_genres_ref` FOREIGN KEY (`genres`) REFERENCES `genres_ref` (`genres_id`),
  CONSTRAINT `fk_title_tconst` FOREIGN KEY (`tconst`) REFERENCES `title` (`tconst`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-15 14:32:16
