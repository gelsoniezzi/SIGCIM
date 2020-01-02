module.exports = {
    estaLogado: function(req, res, next){
        if(req.isAuthenticated()){

            return next()
        }
        req.flash("error_msg", "Faça login.")
        res.redirect('/')
    },
    eAdmin: (req, res, next) => {
        if(req.isAuthenticated()){
            if(req.user.perfil_usuario ===1){
                return next()
            }else{
                req.flash("error_msg", "Você precisa estar logado e ter perfil Admin para acessar essa rota.")
            }
        }else{
            req.flash("error_msg", "Faça login.")
        }        
        res.redirect('/')
    },
    eAssistente: (req, res, next) => {
        if(req.isAuthenticated()){
            if(req.user.perfil_usuario ===2 || req.user.perfil_usuario === 1){
                return next()
            }else{
                req.flash("error_msg", "Você precisa estar logado e ter perfil Assistente para acessar essa rota.")
            }
        }else{
            req.flash("error_msg", "Faça login.")
        }
        res.redirect('/')
    },
    eTecnico: (req, res, next) => {
        if(req.isAuthenticated()){
            if(req.user.perfil_usuario === 3 || req.user.perfil_usuario === 2 || req.user.perfil_usuario === 1){
                return next()
            }else{
                req.flash("error_msg", "Você precisa estar logado e ter perfil Técnico para acessar essa rota.")
            }
        }else{
            req.flash("error_msg", "Faça login.")
        }
        res.redirect('/')
    },
    eContratada: () => {
        if(req.isAuthenticated()){
            if(req.user.perfil_usuario === 4 || req.user.perfil_usuario === 3 || req.user.perfil_usuario ===2 || req.user.perfil_usuario === 1){
                return next()
            }else{
                req.flash("error_msg", "Você precisa estar logado e ter perfil Contratada para acessar essa rota.")
                res.redirect('/')
            }
        }else{
            req.flash("error_msg", "Faça login.")
        }        
        res.redirect('/')
    }

}