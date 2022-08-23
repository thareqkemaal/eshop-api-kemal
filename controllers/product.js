// auth.js fungsinya untuk manajemen data user

const { dbConf, dbQuery } = require('../config/db');
const fs = require('fs');

module.exports = {
    getData: async (req, res) => {
        try {
            console.log(req.query);
            
            let filter = [];

            for (const prop in req.query){
                if (prop == 'lte'){
                    filter.push(`price < ${dbConf.escape(req.query[prop])}`)
                } else if (prop == 'gte'){
                    filter.push(`price > ${dbConf.escape(req.query[prop])}`)
                } else {
                    filter.push(`${prop} = ${dbConf.escape(req.query[prop])}`)
                }
            };
        
            console.table(filter);
            let sqlGet = `SELECT p.*, s.status FROM products p JOIN status s ON p.status_id = s.idstatus
            ${filter.length == 0 ? '' : `WHERE ${filter.join(' AND ')}`};`;
            
            resultsGet = await dbQuery(sqlGet);
            
            res.status(200).send(resultsGet);

        } catch (error) {
            console.log("Error Query SQL", error);
            res.status(500).send(error);
        };
    },
    addProduct: async (req, res) => {
        try {
            console.log(req.body);
            console.log(req.files);

            let data = JSON.parse(req.body.data);

            let dataInput = [];
            for (const prop in data) {
                dataInput.push(dbConf.escape(data[prop]))
            };

            console.log("before", dataInput);
            dataInput.splice(5, 0, dbConf.escape(`/imgProduct/${req.files[0].filename}`))
            console.log("after", dataInput);

            // console.log('check script SQL', `Insert into products 
            //         (name, brand, price, category, description, images, stock) values
            //         (${dataInput.join(',')});`)

            await dbQuery(`Insert into products 
                    (name, brand, price, category, description, images, stock) values
                    (${dataInput.join(',')});`);

            res.status(200).send({
                success: true,
                message: "Product Added"
            });
        } catch (error) {
            console.log(error);
            // menghapus gambar pada directory
            fs.unlinkSync(`./public/imgProduct/${req.files[0].filename}`)
            res.status(500).send(error);
        }
    },
    deleteProduct: async (req, res) => {
        try {
            console.log(req.dataToken)
            // if (req.dataToken.role == 'admin'){
            //     console.log(req.params);

            //     await dbQuery(`Delete from products where idproducts = ${req.params.idproducts}`)

            //     return res.status(200).send({
            //         succces: true,
            //         message: "Product Deleted"
            //     });
            // } else {
            //     res.status(401).send({
            //         success: false,
            //         message: "You are not admin"
            //     })
            // }
        } catch (erorr) {
            res.status(500).send(error)
        }
    },
    editProduct: async (req, res) => {
        try {
            console.log(req.params);
            console.log(Object.keys(req.body));
            console.log(Object.values(req.body));
            console.log(req.dataToken.role);
            let temp = [];
            for (const prop in req.body){
                console.log(prop, req.body[prop]);
                temp.push(prop + "=" + dbConf.escape(req.body[prop]))
            }
            let compile = temp.join(',');

            console.log(compile)
            
            if (req.dataToken.role == 'admin') {
                await dbQuery(`UPDATE products SET
                ${compile}
                WHERE idproducts = ${dbConf.escape(req.params.idproducts)};`)

                res.status(200).send({
                    success: true,
                    message: "Product Updated✅"
                })
            } else {
                res.status(401).send({
                    message: "You are not Admin ❌"
                })
            }
        } catch (error) {
            res.status(500).send(error)
        }
    },
    addtoCart: async (req, res) =>{
        try {
            console.log(req.params)
            console.log(req.body)
            console.log(req.dataToken.iduser)

            if (req.dataToken.role == "user"){
                await dbQuery(`INSERT INTO carts (user_id, products_id, qty) VALUES
                (${dbConf.escape(req.dataToken.iduser)}, ${dbConf.escape(req.params.idproducts)}, ${dbConf.escape(req.body.quantity)});`)
                
                let resultsUser = await dbQuery(`SELECT u.iduser, u.username, u.email, u.role, u.status_id, s.status FROM users u JOIN status s ON u.status_id = s.idstatus WHERE iduser = ${dbConf.escape(req.dataToken.iduser)};`)
            
                if (resultsUser.length > 0){
                    let resultsCart = await dbQuery(`SELECT c.idcarts, p.idproducts, p.name, p.brand, p.description, p.category, p.price, c.qty, (p.price * c.qty) as totalprice, p.images
                    FROM carts c JOIN products p ON c.products_id = p.idproducts WHERE c.user_id = ${dbConf.escape(req.dataToken.iduser)};`);
    
                    res.status(200).send({...resultsUser[0], cart: resultsCart});
                }
                
            } else {
                res.status(401).send({
                    message: "You are not User ❌"
                })
            }
        }catch (error){
            res.status(500).send(error)
        }
    }
};