const multer = require("multer")

module.exports = (multer({
    storage: multer.diskStorage({
        //destino
        destination: (req, file, cb) => {            
            cb(null, './public/img/insumos/')
        },
        //nome do arquivo
        filename: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname)
        }
    }),
    fileFilter: (req, file, cb) => {
        const isAccepted = ['image/png', 'image/jpg', 'image/jpeg'].find(formatoAceito => formatoAceito == file.mimetype)
        if(isAccepted)
            return cb(null, true)
        return cb(null,false)
    }
}))