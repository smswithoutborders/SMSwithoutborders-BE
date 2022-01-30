const config = require('config');
const SERVER_CFG = config.get("SERVER");

const fs = require("fs");
const chalk = require("chalk");
const mysql = require('mysql2/promise');

//db connection
mysql.createConnection({
    host: SERVER_CFG.database.MYSQL_HOST,
    user: SERVER_CFG.database.MYSQL_USER,
    password: SERVER_CFG.database.MYSQL_PASSWORD,
}).then(connection => {
    console.log(`Creating Database ${SERVER_CFG.database.MYSQL_DATABASE} ...`)
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${SERVER_CFG.database.MYSQL_DATABASE}\`;`)
        .then(() => {
            let db = require("../schemas");
            let Platform = db.platforms;
            console.log("Synchronizing database schema ...");
            setTimeout(async () => {
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
                            description: platforms[i].description.toLowerCase(),
                            logo: platforms[i].logo,
                            protocols: JSON.stringify(platforms[i].protocols),
                            type: platforms[i].type.toLowerCase(),
                            letter: platforms[i].name.toLowerCase()[0]
                        }).catch(error => {
                            console.error(error);
                        });
                    };

                    console.log(chalk.blue(`----> ${platforms[i].name.toLowerCase()}`));
                };
                process.exit();
            }, 3000)
        })
})