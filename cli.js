const chalk = require('chalk');
const config = require('./config.json');
const redditwrap = require('./reddit.js');
const fs = require('fs');
const readl = require('readline');
const rl = readl.createInterface({
    input: process.stdin,
    output: process.stdout
});
let collecting = true;
const beep = require('beepbeep');
let collected = 0;
let matched = 0;
const reddit = new redditwrap({
    refresh: 1000,
    username: config.username,
    password: config.password,
    clientId: config.clientid,
    clientSecret: config.clientsecret
});

console.log("Scanning subreddits: " + config.subreddits.join(", ") + " for keywords " + `T[${config.keywords.title.join(", ")}] D[${config.keywords.description.join(", ")}]`);

reddit.on('post', (postData) => {
    if(!collecting) return;
    collected++;
    console.log(`\n---------------------\n`)
    let haskeyword = 0;
    config.keywords.title.forEach(word => {
        if (postData.title.toLowerCase().includes(word.toLowerCase())) {
            haskeyword++;
        }
    });
    config.keywords.description.forEach(word => {
        if (postData.description.toLowerCase().includes(word.toLowerCase())) {
            haskeyword++;
        }
    });

    config.keywords.block.forEach(word =>{
        if(postData.summary.toLowerCase().includes(word.toLowerCase()) || postData.title.toLowerCase().includes(word.toLowerCase())){
            haskeyword = -100;
        }
    })

    if(haskeyword > 0){
        if(config.alerts) beep();
        matched++;
            let title = chalk.green(postData.title);
            console.log(title);
    }else if(haskeyword < 0){
            console.log(chalk.red(postData.title));
    }else{
            console.log(chalk.rgb(255, 165, 0)(postData.title));
    }
	let summary;
if(postData.summary.length > 0){
	summary = postData.summary;
}else{
	summary = "No description";
}
    console.log(summary);
    if(postData.image.url) console.log(`Image: ` + postData.image.url);
    console.log(`By u/${postData.author.username} on r/${postData.subreddit.name}`);
    console.log(postData.id);
    console.log(postData.url);
    if(config.log && haskeyword > 0){
        let filestring = `./logs/${postData.date.getFullYear()}${postData.date.getMonth()}.log`;
        if(!fs.existsSync(filestring)){
            console.log("test");
            fs.writeFileSync(filestring, `Sniffing for keywords T[${config.keywords.title.join(", ")}] D[${config.keywords.description.join(", ")}] on subreddits [${config.subreddits.join(", ")}]`);
        }
        let logMessage = `---\n[${postData.date.getFullYear()}/${postData.date.getMonth()}/${postData.date.getDate()} - ${postData.date.getHours()}:${postData.date.getMinutes()}] "${postData.title}" from ${postData.author} in r/${postData.subreddit}\n${postData.url}\n`;
        fs.appendFileSync(filestring, logMessage);
    }
});

rl.on('close', () => {
    collecting = false;
            console.log(chalk.red("Stopping sniffer"));
            console.log(`Search: keywords T[${config.keywords.title.join(", ")}] D[${config.keywords.description.join(", ")}] on subreddits [${config.subreddits.join(", ")}]`);
            console.log(`Collected: ${collected}`);
            console.log(`Matched: ${matched}/${collected}`);
            console.log(`Matched (%): ${Math.round(matched / collected * 100)}%`);
            console.log(`Collected for ${(process.uptime() / 60).toFixed(2)} minutes.`)
            process.exit(0);
})