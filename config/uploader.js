const multer = require('multer');
const fs = require('fs'); // untuk manajemen directory

module.exports = {
    uploader: (directory, filePrefix) => {
        // directory untuk lokasi
        // filePrefix untuk me rename file yang diupload

        let defaultDir = './public';

        // konfigurasi untuk multer

        // diskStorage untuk menentukan mau disimpan directory mana, dalam bentuk object
        const storageUploader = multer.diskStorage({
            destination:(req, file, cb) => {
                // menentukan lokasi penyimpanan
                const pathDir = directory ? defaultDir + directory : defaultDir;

                if (fs.existsSync(pathDir)){
                    // jika directory ada, maka akan dijalankan cb untuk meyimpan data
                    console.log(`Directory ${pathDir} exist ✅`);
                    cb(null, pathDir)
                } else {
                    // recursive true digunakan untuk membuat dir di dalam dir jika dir yang dituju tidak ada
                    // mkdir adalah async
                    // fungsi async digunakan ketika ingin mengetahui apakah ada error atau tidak pada syntax yang dijalankan

                    fs.mkdir(pathDir,{recursive: true}, (err) => {
                        if (err) {
                            console.log("error mkdir", err);
                        } else {
                            console.log(`success mkdir ✅ created ${pathDir}`, err);
                            return cb(err, pathDir);
                        }
                    })
                }
            },
            filename:(req, file, cb) => {
                // membaca tipe data file yg diupload
                let ext = file.originalname.split('.');

                // cb(null, file.originalname) -> jika tidak mau merubah nama filenya
                
                let newName = filePrefix + Date.now() + '.' + ext[ext.length-1];
                console.log('New File Name', newName)
                
                cb(null, newName)

            }
        })

        const fileFilter = (req, file, cb) => {
            const extFilter = /\.(jpg|png|webp|jpeg|svg)/;

            if (file.originalname.toLowerCase().match(extFilter)) {
                cb(null, true)
            } else {
                cb(new Error('Your file ext are denied ❌', false));
            }
        }

        return multer({storage: storageUploader, fileFilter})
    }
}