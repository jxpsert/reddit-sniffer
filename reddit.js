const {EventEmitter} = require('events');
const config = require('./config.json');
const RssFeedEmitter = require('rss-feed-emitter');
const Submission = require('./src/Submission.js');
const Collection = require('@discordjs/collection');
const feeder = new RssFeedEmitter();
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
class RedditClient extends EventEmitter {
    constructor(data) {
        super();
        this.options = data; // Currently just the refresh
        this.posts = new Collection(); // Thank you, @discord.js/collection!
        config.subreddits.forEach(subreddit => {
            feeder.add({
                url: `http://www.reddit.com/r/${subreddit}/new/.rss?sort=new`,
                refresh: this.options.refresh,
                eventName: 'newpost'
            });
        });
        feeder.on('newpost', data => {
            if (!data.title) return; // Not sure why, but sometimes the title is undefined
            let SubmissionData = new Submission({
                title: data.title,
                id: data.guid, // Unique identifier
                summary: parseDesc(data.description), // CLI
                description: entities.decode(data.description.substring(0, data.description.indexOf("submitted by"))), // RSS feed supplies HTML, and includes the 'submitted by part'
                author: data.author, // This is turned into a User in the Submission constructor
                subreddit: data.categories[0], // categories is an Array for whatever reason, but it has only 1 entry, thus [0]
                image: data.image,
                url: data.link.replace('www', 'new'), // For new Reddit UI
                date: data.pubdate
            });
            this.newSubmission(SubmissionData);
        })
    }

    newSubmission(data) { // Adding the new Submission to this.posts
        if (!data) return new Error("Shit has hit the fan");
        if(this.posts.get(data.id)) return; // Check if the same post has already been shown. This happens.
        this.posts.set(data.id, data);
        return this.emit('post', data);
    }
}

function parseDesc(data){ // For CLI support (Submission.summary)
    let newstring = data.replace(/<[^>]*>?/gm, '')
    .replace(data.title, '')
    .substring(0, data.indexOf("submitted by"))
    .substring(0, 197) + "...";
    newstring = entities.decode(newstring);
    return newstring;
}

module.exports = RedditClient;