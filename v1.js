const request = require("request");
const exec = require("child_process").exec;
const keySender = require("node-key-sender");

const OAUTH = "";

var lastSongName = "";

//keySender.setOption('globalDelayPressMillisec', 1);

// Spotify API headers

var headers = {
    url: 'https://api.spotify.com/v1/me/player/currently-playing',
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+OAUTH,
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

function inputTerminal(songName){
    var dataSong = ("say "+songName);
    if (isNewSong(songName)===true){
        keySender.sendKey('z').then(function(){
            keySender.sendText(dataSong).then(function(){
                keySender.sendKey('enter').then(function(){
                    keySender.sendKey('escape');
                })
            })
        })
    }
}

function makeRequest(){
    request(headers, function (error, response, body) {
        var spotifyData = JSON.parse(body);
            if (spotifyData.error){
                console.log("[HTTP-ERROR]: "+body);
                inputTerminal("Your spotify token has expired");
            } else {
                var isPlaying = spotifyData.is_playing;
                var csgoText = "Now playing on Spotify - "+spotifyData.item.name+" by "+spotifyData.item.artists[0].name;
                if (isPlaying===true){
                    inputTerminal(csgoText);
                } else {
                    inputTerminal("Spotify paused")
                    console.log("Not playing songs yet");
                }
            }
    })
}

function isNewSong(songName){
    if (songName===lastSongName){
        return false;
    };
    lastSongName = songName;
    return true
}

console.log("Checking to see if Spotify and CSGO is open");

const isRunning = (query, cb) => {
    let platform = process.platform;
    let cmd = '';
    switch (platform) {
        case 'win32' : cmd = `tasklist`; break;
        case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
        case 'linux' : cmd = `ps -A`; break;
        default: break;
    }
    exec(cmd, (err, stdout, stderr) => {
        cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
    });
}

function doCheck(){
    var csgoRunning = false;
    var spotifyRunning = false;
    isRunning('csgo.exe',(status)=>{
        csgoRunning=status;
    });
    isRunning('Spotify.exe',(status)=>{
        spotifyRunning=status;
    });
    setTimeout(function(){
        if (csgoRunning===true && spotifyRunning===true){
            var spotifyData = makeRequest();
        } else {
            clearTimeout();
            return;
        }
    }, 5000)
}

doCheck();

setInterval(doCheck, 5000);
