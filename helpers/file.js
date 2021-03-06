const fs = require('fs')
const sharp = require('sharp')
const express = require("express")

exports.compressImage = (file, size) => {

    var newPath = file.path.split('.')[0] + '.webp'
        return sharp(file.path)
            .resize(size)
            .toFormat('webp')
            .webp({
                quality: 80
            })
            .toBuffer()
            .then((data) => {
                fs.access(file.path, (err) => {
                    if(!err){
                        fs.unlink(file.path, err => {
                            if(err) console.log(err)
                        })
                    }
                })
                fs.writeFile(newPath, data, err => {
                    if(err){
                        throw err
                    }
                })
                //Tratar o caminho da imagem no banco.
                
                /*newPath = newPath.split('\/public/')[1]*/
                console.log("Teste: " + newPath)
                return newPath
            })    
}