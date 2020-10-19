const User = require('./User.js');
const Subreddit = require('./Subreddit.js');
class Post {
    constructor(data){
        this.title = data.title;
        this.summary = data.summary;
        this.id = data.id;
        this.description = data.description;
        this.author = new User({ name: data.author });
        this.subreddit = new Subreddit({name: data.subreddit});
        this.image = data.image || "No image";
        this.url = data.url;
        this.date = data.date;
    }
}
module.exports = Post;