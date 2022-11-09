-- MySQL dump 10.13  Distrib 8.0.31, for Linux (x86_64)
--
-- Host: localhost    Database: dummySmswithoutborders
-- ------------------------------------------------------
-- Server version	8.0.31-0ubuntu0.20.04.1

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

CREATE DATABASE IF NOT EXISTS dummySmswithoutborders CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE dummySmswithoutborders;

--
-- Table structure for table `credentials`
--

DROP TABLE IF EXISTS `credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credentials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shared_key` text NOT NULL,
  `hashing_salt` text NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credentials`
--

LOCK TABLES `credentials` WRITE;
/*!40000 ALTER TABLE `credentials` DISABLE KEYS */;
INSERT INTO `credentials` VALUES (1,'adacd644b58e19a8d35a5405ac2c6755','b7c1c9605b98de2b055b5a13ac22765e','2022-11-08 16:10:41');
/*!40000 ALTER TABLE `credentials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platforms`
--

DROP TABLE IF EXISTS `platforms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platforms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `protocols` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `letter` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `platforms_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platforms`
--

LOCK TABLES `platforms` WRITE;
/*!40000 ALTER TABLE `platforms` DISABLE KEYS */;
INSERT INTO `platforms` VALUES (1,'gmail','/public/gmail-icon.svg','[\"oauth2\"]','email','g','2022-11-08 16:10:41','{\"en\": \"Gmail is a free email service provided by Google. By storing access with us, you will be able to send emails by SMS using the SWOB app. We only request the most basic permissions to make this process work.\", \"fr\": \"Gmail est un service de messagerie gratuit fourni par Google. En stockant l\'acc\\u00e8s chez nous, vous serez en mesure d\'envoyer des e-mails par SMS en utilisant l\'application SWOB. Nous ne demandons que les autorisations les plus \\u00e9l\\u00e9mentaires pour que ce processus fonctionne.\"}'),(2,'twitter','/public/twitter-icon.svg','[\"oauth2\"]','text','t','2022-11-08 16:10:41','{\"en\": \"Twitter is a microblogging and social networking service. By storing access with us, you will be able to tweet in real time by SMS using the SWOB app. We only request the most basic permissions to make this process work.\", \"fr\": \"Twitter est un service de microblogging et de r\\u00e9seau social. En stockant un acc\\u00e8s chez nous, vous pourrez tweeter en temps r\\u00e9el par SMS en utilisant l\'application SWOB. Nous ne demandons que les autorisations les plus \\u00e9l\\u00e9mentaires pour que ce processus fonctionne.\"}'),(3,'telegram','/public/telegram-icon.svg','[\"twofactor\"]','messaging','T','2022-11-08 16:10:41','{\"en\": \"Telegram is a freeware, cross-platform, cloud-based instant messaging service. By storing access with us, you will be able to send messages by SMS using the SWOB app. We only request the most basic permissions to make this process work.\", \"fr\": \"Telegram est un service de messagerie instantan\\u00e9e gratuit, multiplateforme et bas\\u00e9 sur le cloud. En stockant un acc\\u00e8s chez nous, vous serez en mesure d\'envoyer des messages par SMS en utilisant l\'application SWOB. Nous ne demandons que les autorisations les plus \\u00e9l\\u00e9mentaires pour que ce processus fonctionne.\"}'),(4,'slack','/public/slack-icon.svg','[\"oauth2\"]','text','s','2022-11-08 16:10:41','{\"en\": \"Slack is a messaging app for business that connects people to the information they need. By bringing people together to work as one unified team, Slack transforms the way organizations communicate.\", \"fr\": \"Slack est une application de messagerie pour les entreprises qui connecte les gens aux informations dont ils ont besoin. En rassemblant les gens pour qu\'ils travaillent comme une seule \\u00e9quipe unifi\\u00e9e, Slack transforme la fa\\u00e7on dont les organisations communiquent.\"}');
/*!40000 ALTER TABLE `platforms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retries`
--

DROP TABLE IF EXISTS `retries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uniqueId` varchar(255) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `block` int DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retries`
--

LOCK TABLES `retries` WRITE;
/*!40000 ALTER TABLE `retries` DISABLE KEYS */;
/*!40000 ALTER TABLE `retries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `sid` varchar(255) NOT NULL,
  `unique_identifier` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `svretries`
--

DROP TABLE IF EXISTS `svretries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `svretries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) DEFAULT NULL,
  `uniqueId` varchar(255) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `svretries`
--

LOCK TABLES `svretries` WRITE;
/*!40000 ALTER TABLE `svretries` DISABLE KEYS */;
/*!40000 ALTER TABLE `svretries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `current_login` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('dead3662-5f78-11ed-b8e7-6d06c3aaf3c6','cc0f716255274e8d5aef7c949cd9c375728572cf47cc60259b37f550218cede97ff71cfe10792f4049d0ad1adc98e7612171b75982743c55fe0c104b81771b80',NULL,NULL,'2022-11-08 16:20:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usersInfos`
--

DROP TABLE IF EXISTS `usersInfos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usersInfos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `country_code` varchar(255) DEFAULT NULL,
  `full_phone_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `iv` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usersinfos_userId` (`userId`),
  CONSTRAINT `usersInfos_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usersInfos`
--

LOCK TABLES `usersInfos` WRITE;
/*!40000 ALTER TABLE `usersInfos` DISABLE KEYS */;
INSERT INTO `usersInfos` VALUES (1,'fb8cf00e21b92700373f7ba7c625b55d','d8399ba8fa1749f375aa4f65d572352e','601141fe121799a07267bda9ad5e15d9778121661b3510be9f46418f07d630c01dfac1a12919d873ad6c12fd9a1ea2e7cf25e4e28574324586a87573ac3b470c','verified','dead3662-5f78-11ed-b8e7-6d06c3aaf3c6','2445a6b5141f7b3b','2022-11-08 16:27:42');
/*!40000 ALTER TABLE `usersInfos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `token` text,
  `uniqueId` varchar(255) DEFAULT NULL,
  `uniqueIdHash` varchar(255) DEFAULT NULL,
  `iv` varchar(255) DEFAULT NULL,
  `userId` varchar(255) NOT NULL,
  `platformId` int NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_userId_platformId` (`userId`,`platformId`),
  UNIQUE KEY `wallets_uniqueIdHash` (`uniqueIdHash`),
  KEY `wallets_userId` (`userId`),
  KEY `wallets_platformId` (`platformId`),
  CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  CONSTRAINT `wallets_ibfk_2` FOREIGN KEY (`platformId`) REFERENCES `platforms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-11-08 18:04:26
