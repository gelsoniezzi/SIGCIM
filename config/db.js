if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://sigcim20192ufersa:iknA8o0wOZAVOHtn@cluster0-pv9gh.mongodb.net/SIGCIM?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/sigcim'}
}