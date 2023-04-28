CREATE USER IF NOT EXISTS `swob-user`@'localhost' IDENTIFIED BY 'swob-password';
CREATE DATABASE IF NOT EXISTS `swob-database`;
GRANT ALL PRIVILEGES ON `swob-database`.* TO `swob-user`@'localhost';
