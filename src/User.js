class User {
    constructor(data){
        this.username = data.name.substring(3);
    }
}
module.exports = User;