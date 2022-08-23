const { dbConf, dbQuery } = require('../config/db');

module.exports = {
    getCart: async (req, res) => {
        try {
            console.log(req.dataToken.iduser);

            if (req.dataToken.status == "VERIFIED"){
                let resultUser = await dbQuery(`SELECT u.iduser, u.username, s.status, u.role FROM users u JOIN status s ON u.status_id = s.idstatus WHERE u.iduser = ${dbConf.escape(req.dataToken.iduser)};`)

                if (resultUser.length > 0){
                    let results = await dbQuery(`SELECT c.idcarts, p.idproducts, p.name, p.brand, p.description, p.category, p.price, c.qty, (p.price * c.qty) as totalprice, p.images
                    FROM carts c JOIN products p ON c.products_id = p.idproducts WHERE c.user_id = ${dbConf.escape(req.dataToken.iduser)};`);
    
                    res.status(200).send({...resultUser[0], cart: results});
                }
            } else {
                res.status(401).send({
                    message: "You are not Verified ❌"
                })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    },

    editCart: async (req, res) => {
        try {
            console.log(req.params);
            console.log(req.body)
            console.log(req.dataToken);

            if (req.dataToken.status == "VERIFIED"){
                await dbQuery(`UPDATE carts SET qty = ${dbConf.escape(req.body.quantity)} WHERE
                idcarts = ${dbConf.escape(req.params.idcarts)} AND user_id = ${dbConf.escape(req.dataToken.iduser)};`)
            
                let resultUser = await dbQuery(`SELECT u.iduser, u.username, s.status, u.role FROM users u JOIN status s ON u.status_id = s.idstatus WHERE u.iduser = ${dbConf.escape(req.dataToken.iduser)};`)

                if (resultUser.length > 0){
                    let results = await dbQuery(`SELECT c.idcarts, p.idproducts, p.name, p.brand, p.description, p.category, p.price, c.qty, (p.price * c.qty) as totalprice, p.images
                    FROM carts c JOIN products p ON c.products_id = p.idproducts WHERE c.user_id = ${dbConf.escape(req.dataToken.iduser)};`);
    
                    res.status(200).send({...resultUser[0], cart: results});
                };
            } else {
                res.status(401).send({
                    message: "You are not Verified ❌"
                })
            }
            
        } catch (error) {
            res.status(500).send(error)
        }
    },

    deleteCart: async (req, res) => {
        try {
            console.log(req.params);
            console.log(req.dataToken.iduser);

            if (req.dataToken.status == "VERIFIED"){
                await dbQuery(`DELETE FROM carts WHERE idcarts = ${dbConf.escape(req.params.idcarts)} AND user_id = ${dbConf.escape(req.dataToken.iduser)};`)

                let resultUser = await dbQuery(`SELECT u.iduser, u.username, s.status, u.role FROM users u JOIN status s ON u.status_id = s.idstatus WHERE u.iduser = ${dbConf.escape(req.dataToken.iduser)};`)

                if (resultUser.length > 0){
                    let results = await dbQuery(`SELECT c.idcarts, p.idproducts, p.name, p.brand, p.description, p.category, p.price, c.qty, (p.price * c.qty) as totalprice, p.images
                    FROM carts c JOIN products p ON c.products_id = p.idproducts WHERE c.user_id = ${dbConf.escape(req.dataToken.iduser)};`);
    
                    res.status(200).send({...resultUser[0], cart: results});
                }
            } else {
                res.status(401).send({
                    message: "You are not Verified ❌"
                })
            }

        } catch (error) {
            res.status(500).send(error)
        }
    }
};