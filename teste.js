const multer = require('multer');


module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './app/public/images');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);           
        }
        
    }), // FIM DA CONFIGURAÇÃO DE ARMAZENAMENTO
}));