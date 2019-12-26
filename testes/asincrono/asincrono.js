(corpo, email, callback) => {
    setTimeout(() => {
        console.log("O Corpo é : " + corpo + ", endereco: " + email)
    }, 2000)
    callback()
}