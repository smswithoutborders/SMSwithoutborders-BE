-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 09, 2022 at 03:29 PM
-- Server version: 8.0.31-0ubuntu0.20.04.1
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `swob_dummy_db`
--
DROP DATABASE IF EXISTS `swob_dummy_db`;
CREATE DATABASE IF NOT EXISTS `swob_dummy_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `swob_dummy_db`;

-- --------------------------------------------------------

--
-- Table structure for table `credentials`
--

DROP TABLE IF EXISTS `credentials`;
CREATE TABLE IF NOT EXISTS `credentials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `shared_key` text NOT NULL,
  `hashing_salt` text NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `credentials`
--

INSERT INTO `credentials` (`id`, `shared_key`, `hashing_salt`, `createdAt`) VALUES
(1, 'adacd644b58e19a8d35a5405ac2c6755', 'b7c1c9605b98de2b055b5a13ac22765e', '2022-11-08 16:10:41');

-- --------------------------------------------------------

--
-- Table structure for table `platforms`
--

DROP TABLE IF EXISTS `platforms`;
CREATE TABLE IF NOT EXISTS `platforms` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `platforms`
--

INSERT INTO `platforms` (`id`, `name`, `logo`, `protocols`, `type`, `letter`, `createdAt`, `description`) VALUES
(1, 'gmail', '/public/gmail-icon.svg', '[\"oauth2\"]', 'email', 'g', '2022-11-08 16:10:41', '{\"en\": \"Gmail is a free email service provided by Google. By storing access with us, you will be able to send emails by SMS using the SWOB app. We only request the most basic permissions to make this process work.\", \"fr\": \"Gmail est un service de messagerie gratuit fourni par Google. En stockant l\'acc\\u00e8s chez nous, vous serez en mesure d\'envoyer des e-mails par SMS en utilisant l\'application SWOB. Nous ne demandons que les autorisations les plus \\u00e9l\\u00e9mentaires pour que ce processus fonctionne.\"}'),
(2, 'twitter', '/public/twitter-icon.svg', '[\"oauth2\"]', 'text', 't', '2022-11-08 16:10:41', '{\"en\": \"Twitter is a microblogging and social networking service. By storing access with us, you will be able to tweet in real time by SMS using the SWOB app. We only request the most basic permissions to make this process work.\", \"fr\": \"Twitter est un service de microblogging et de r\\u00e9seau social. En stockant un acc\\u00e8s chez nous, vous pourrez tweeter en temps r\\u00e9el par SMS en utilisant l\'application SWOB. Nous ne demandons que les autorisations les plus \\u00e9l\\u00e9mentaires pour que ce processus fonctionne.\"}'),
(3, 'telegram', '/public/telegram-icon.svg', '[\"twofactor\"]', 'messaging', 'T', '2022-11-08 16:10:41', '{\"en\": \"Telegram is a freeware, cross-platform, cloud-based instant messaging service. By storing access with us, you will be able to send messages by SMS using the SWOB app. We only request the most basic permissions to make this process work.\", \"fr\": \"Telegram est un service de messagerie instantan\\u00e9e gratuit, multiplateforme et bas\\u00e9 sur le cloud. En stockant un acc\\u00e8s chez nous, vous serez en mesure d\'envoyer des messages par SMS en utilisant l\'application SWOB. Nous ne demandons que les autorisations les plus \\u00e9l\\u00e9mentaires pour que ce processus fonctionne.\"}'),
(4, 'slack', '/public/slack-icon.svg', '[\"oauth2\"]', 'text', 's', '2022-11-08 16:10:41', '{\"en\": \"Slack is a messaging app for business that connects people to the information they need. By bringing people together to work as one unified team, Slack transforms the way organizations communicate.\", \"fr\": \"Slack est une application de messagerie pour les entreprises qui connecte les gens aux informations dont ils ont besoin. En rassemblant les gens pour qu\'ils travaillent comme une seule \\u00e9quipe unifi\\u00e9e, Slack transforme la fa\\u00e7on dont les organisations communiquent.\"}');

-- --------------------------------------------------------

--
-- Table structure for table `retries`
--

DROP TABLE IF EXISTS `retries`;
CREATE TABLE IF NOT EXISTS `retries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uniqueId` varchar(255) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `block` int DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `sid` varchar(255) NOT NULL,
  `unique_identifier` varchar(255) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `data` text,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`sid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `svretries`
--

DROP TABLE IF EXISTS `svretries`;
CREATE TABLE IF NOT EXISTS `svretries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) DEFAULT NULL,
  `uniqueId` varchar(255) DEFAULT NULL,
  `count` int DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `current_login` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `password`, `current_login`, `last_login`, `createdAt`) VALUES
('dead3662-5f78-11ed-b8e7-6d06c3aaf3c6', 'b829955d86babb6f7d1c68236166e91598f0b541a3ca424ee241633a7a255238b1d7a63b5332db4b8988519ef0dab341a3555fc22947788d06aa6bbd3841cbb0', NULL, NULL, '2022-11-08 16:20:37');

-- --------------------------------------------------------

--
-- Table structure for table `usersInfos`
--

DROP TABLE IF EXISTS `usersInfos`;
CREATE TABLE IF NOT EXISTS `usersInfos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `country_code` varchar(255) DEFAULT NULL,
  `full_phone_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `userId` varchar(255) NOT NULL,
  `iv` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usersinfos_userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usersInfos`
--

INSERT INTO `usersInfos` (`id`, `name`, `country_code`, `full_phone_number`, `status`, `userId`, `iv`, `createdAt`) VALUES
(1, '74a6a9facbba61178c4d00de9e1adeb9', 'd8399ba8fa1749f375aa4f65d572352e', '601141fe121799a07267bda9ad5e15d9778121661b3510be9f46418f07d630c01dfac1a12919d873ad6c12fd9a1ea2e7cf25e4e28574324586a87573ac3b470c', 'verified', 'dead3662-5f78-11ed-b8e7-6d06c3aaf3c6', '2445a6b5141f7b3b', '2022-11-08 16:27:42');

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
CREATE TABLE IF NOT EXISTS `wallets` (
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
  KEY `wallets_platformId` (`platformId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `usersInfos`
--
ALTER TABLE `usersInfos`
  ADD CONSTRAINT `usersInfos_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `wallets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `wallets_ibfk_2` FOREIGN KEY (`platformId`) REFERENCES `platforms` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
