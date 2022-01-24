const fs = require("fs");
const chalk = require("chalk");
const db = require("../schemas");
const mysql = require('mysql2/promise');
const configs = require("../config.json");

var Platform = db.platforms;

module.exports = (() => {
    try {
        //db connection
        mysql.createConnection({
            host: configs.database.MYSQL_HOST,
            user: configs.database.MYSQL_USER,
            password: configs.database.MYSQL_PASSWORD,
        }).then(connection => {
            connection.query(`CREATE DATABASE IF NOT EXISTS \`${configs.database.MYSQL_DATABASE}\`;`).then(async () => {
                let data = fs.readFileSync(`${process.cwd()}/libs/platforms/info.json`, 'utf8');
                let platforms = JSON.parse(data);

                console.log(chalk.blue("Available Platforms:"));
                for (let i = 0; i < platforms.length; i++) {
                    let db_platforms = await Platform.findAll({
                        where: {
                            name: platforms[i].name.toLowerCase()
                        }
                    }).catch(error => {
                        console.error(error);
                    });;

                    if (db_platforms.length > 1) {
                        console.error("DUP_PLATFROMS");
                    }

                    if (db_platforms.length < 1) {
                        await Platform.create({
                            name: platforms[i].name.toLowerCase(),
                            type: platforms[i].type.toLowerCase(),
                            letter: platforms[i].name.toLowerCase()[0]
                        }).catch(error => {
                            console.error(error);
                        });
                    }
                    console.log(chalk.blue(`----> ${platforms[i].name.toLowerCase()}`));
                };
                process.exit();
            })
        })
    } catch (error) {
        console.error(error);
    }
})();