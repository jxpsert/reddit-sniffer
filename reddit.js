const {EventEmitter} = require('events');
const config = require('./config.json');
const RssFeedEmitter = require('rss-feed-emitter');
const Post = require('./src/Post.js');
const Collection = require('@discordjs/collection');
const feeder = new RssFeedEmitter();
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
class RedditClient extends EventEmitter {
    constructor(data) {
        super();
        this.options = data;
        this.posts = new Collection();
        config.subreddits.forEach(subreddit => {
            feeder.add({
                url: `http://www.reddit.com/r/${subreddit}/new/.rss?sort=new`,
                refresh: this.options.refresh,
                eventName: 'newpost'
            });
        });
        feeder.on('newpost', data => {
            if (!data.title) return;
            let PostData = new Post({
                title: data.title,
                id: data.guid,
                summary: parseDesc(data.description),
                description: data.description.substring(0, data.description.indexOf("submitted by")),
                author: data.author,
                subreddit: data.categories[0],
                image: data.image,
                url: data.link.replace('www', 'new'),
                date: data.pubdate
            });
            this.newPost(PostData);
        })
    }

    newPost(data) {
        if (!data) return new Error("Shit hath hit the fan");
        this.posts.set(data.id, data);
        return this.emit('post', data);
    }
}

function parseDesc(data){
    let newstring = data.replace(/<[^>]*>?/gm, '')
    .replace(data.title, ' ')
    .substring(0, 197) + "...";
    newstring = entities.decode(newstring);
    return newstring;
}

module.exports = RedditClient;