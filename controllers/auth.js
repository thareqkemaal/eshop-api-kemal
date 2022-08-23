// auth.js fungsinya untuk manajemen data user

const { dbConf, dbQuery } = require('../config/db');

const { hashPassword, createToken } = require('../config/encrypt');
const { transport } = require('../config/nodemailer');


module.exports = {
    getData: (req, res) => {
        dbConf.query(`Select * from users u JOIN status s on u.status_id = s.idstatus;`,
            (err, results) => {
                if (err) {
                    console.log("Error Query SQL", err);
                    res.status(500).send(err);
                }
                console.log("Results SQL", results)
                res.status(200).send(results);
            });
    },
    register: async (req, res) => {
        try {
            // console.log(req.body)
            const { username, email, password } = req.body;
    
            let sqlInsert = await dbQuery(`Insert Into users (username, email, password) Values 
            (${dbConf.escape(username)},${dbConf.escape(email)},${dbConf.escape(hashPassword(password))})`)
            
            console.log(sqlInsert);
            if(sqlInsert.insertId){
                let sqlGet = await dbQuery(`SELECT iduser, email, status_id FROM users WHERE iduser = ${dbConf.escape(sqlInsert.insertId)};`)

                // generate token
                let token = createToken({...sqlGet[0]}, '1h');

                // mengirimkan email
                await transport.sendMail({
                    from:'ESHOP ADMIN CARE',
                    to: sqlGet[0].email,
                    subject: 'Verification Email Account',
                    html: `<div>
                    <h3>Click link below</h3>
                    <a href="${process.env.FE_URL}/verification/${token}">Verified Account</a>
                    </div>`
                })
                res.status(200).send({
                            success: true,
                            message: 'Register Success'
                })
            }
        } catch (error){
            console.log("Error Query SQL", error);
            res.status(500).send(error);
        }
    },
    login: (req, res) => {
        // console.log(req.body);
        const { email, password } = req.body;

        // console.log(password);
        // console.log(hashPassword(password));

        dbConf.query(`SELECT u.iduser, u.username, u.email, u.age, u.city, u.role, u.status_id, s.status FROM users u 
        JOIN status s ON u.status_id = s.idstatus WHERE email = ${dbConf.escape(email)} and password = ${dbConf.escape(password)};`,
        (err, results) => {
            if (err) {
                console.log("Error Query SQL", err);
                res.status(500).send(err);
            }
            // res.status(200).send(results);
            // console.log(results[0].iduser);

            // console.log({...results[0], carts: 'cart'})
            dbConf.query(`SELECT u.iduser, p.idproducts, p.name, p.images, p.brand, p.category, p.price, c.qty, (p.price * c.qty) as totalprice FROM users u JOIN carts c ON u.iduser = c.user_id
            JOIN products p ON p.idproducts = c.products_id WHERE c.user_id = ${dbConf.escape(results[0].iduser)};`, 
            (errCart, resultsCart) => {
                if (errCart) {
                    console.log("Error Query SQL", err);
                    res.status(500).send(err);
                }

                let token = createToken({...results[0]})
                // console.log(resultsCart)

                res.status(200).send({...results[0], carts: resultsCart, token})
            })
        });
    },
    keepLogin: async (req, res) => {

        try {
            console.log(req.dataToken);
    
            let resultsUser = await dbQuery(`SELECT u.iduser, u.username, u.email, u.age, u.city, u.role, u.status_id, s.status FROM users u JOIN status s ON u.status_id = s.idstatus WHERE iduser = ${dbConf.escape(req.dataToken.iduser)};`)
            
                // console.log(results)
                // res.status(200).send(results[0]);
                if (resultsUser.length > 0) {

                    let resultsCart = await dbQuery(`SELECT u.iduser, p.idproducts, p.name, p.images, p.brand, p.category, p.price, c.qty, (p.price * c.qty) as totalprice FROM users u JOIN carts c ON u.iduser = c.user_id
                    JOIN products p ON p.idproducts = c.products_id WHERE c.user_id = ${dbConf.escape(resultsUser[0].iduser)};`)
                    // console.log(resultsCart)
                    
                    let token = createToken({...resultsUser[0]});

                    res.status(200).send({...resultsUser[0], carts: resultsCart, token});
                };
            
        } catch (error) {
            console.log("Error Query SQL", error);
            res.status(500).send(error);
        }

    },
    verifyLogin: async (req, res) => {
        try {
            console.log(req.dataToken);

            let verifUser = await dbQuery(`UPDATE users SET status_id = 1 WHERE iduser = ${dbConf.escape(req.dataToken.iduser)};`)

            if (verifUser){
                let resultsUser = await dbQuery(`SELECT u.iduser, u.username, u.password, u.email, u.age, u.city, u.role, u.status_id, s.status FROM users u JOIN status s ON u.status_id = s.idstatus WHERE iduser = ${dbConf.escape(req.dataToken.iduser)};`)
                
                    // console.log(results)
                    // res.status(200).send(results[0]);
                    if (resultsUser.length > 0) {
    
                        let resultsCart = await dbQuery(`SELECT u.iduser, p.idproducts, p.name, p.images, p.brand, p.category, p.price, c.qty, (p.price * c.qty) as totalprice FROM users u JOIN carts c ON u.iduser = c.user_id
                        JOIN products p ON p.idproducts = c.products_id WHERE c.user_id = ${dbConf.escape(resultsUser[0].iduser)};`)
                        // console.log(resultsCart)
                        
                        let token = createToken({...resultsUser[0]});
    
                        res.status(200).send({...resultsUser[0], carts: resultsCart, token});
                    };
            }
        } catch (error) {
            res.status(500).send(error)
        }
    }
};