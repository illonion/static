let socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
let mapid = document.getElementById('mapid');

// NOW PLAYING
let mapContainer = document.getElementById("mapContainer");
let mapTitle = document.getElementById("mapTitle");
let mapDifficulty = document.getElementById("mapDifficulty");

// TEAM OVERALL SCORE
let teamBlueName = document.getElementById("teamBlueName");
let teamRedName = document.getElementById("teamRedName");
let scoreNowBlue = document.getElementById("scoreNowBlue");
let scoreNowRed = document.getElementById("scoreNowRed");
let scoreMaxBlue = document.getElementById("scoreMaxBlue");
let scoreMaxRed = document.getElementById("scoreMaxRed");

// For Star Visibility
let scoreBlue = document.getElementById("scoreBlue");
let scoreRed = document.getElementById("scoreRed");
let teamBlue = document.getElementById("teamBlue");
let teamRed = document.getElementById("teamRed");

// TEAM PLAYING SCORE
let playScoreBlue = document.getElementById("playScoreBlue");
let playScoreRed = document.getElementById("playScoreRed");

// Moving Score Bar
let movingScoreBarLeft = document.getElementById("movingScoreBarLeft");
let movingScoreBarRight = document.getElementById("movingScoreBarRight");

// Graphic components
let bottom = document.getElementById("bottom");

// Chats
let chats = document.getElementById("chats");

socket.onopen = () => {
    console.log("Successfully Connected");
};

let animation = {
    playScoreBlue:  new CountUp('playScoreBlue', 0, 0, 0, .2, {useEasing: true, useGrouping: true,   separator: " ", decimal: "." }),
    playScoreRed:  new CountUp('playScoreRed', 0, 0, 0, .2, {useEasing: true, useGrouping: true,   separator: " ", decimal: "." }),
}

socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = error => {
    console.log("Socket Error: ", error);
};

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let tempImg;
let tempMapName;
let tempMapDiff;

let scoreBlueTemp;
let scoreRedTemp;
let teamNameBlueTemp;
let teamNameRedTemp;
let gameState;

let chatLen = 0;
let tempClass = 'unknown';

socket.onmessage = event => {
    let data = JSON.parse(event.data);
	if(scoreVisibleTemp !== data.tourney.manager.bools.scoreVisible) {
		scoreVisibleTemp = data.tourney.manager.bools.scoreVisible;
		if(scoreVisibleTemp) {
			// Score visible -> Set bg bottom to full
			chats.style.opacity = 0;
			playScoreBlue.style.opacity = 1;
			playScoreRed.style.opacity = 1;
		} else {
			// Score invisible -> Set bg to show chats
			chats.style.opacity = 1;
			playScoreBlue.style.opacity = 0;
			playScoreRed.style.opacity = 0;
		}
	}
	if(starsVisibleTemp !== data.tourney.manager.bools.starsVisible) {
		starsVisibleTemp = data.tourney.manager.bools.starsVisible;
		if(starsVisibleTemp) {
			scoreBlue.style.display = "flex";
			scoreRed.style.display = "flex";
			teamBlueName.style.width = "500px";
			teamRedName.style.width = "500px";
		} else {
			scoreBlue.style.display = "none";
			scoreRed.style.display = "none";
			teamBlueName.style.width = "700px";
			teamRedName.style.width = "700px";
		}
	}
	if(tempImg !== data.menu.bm.path.full){
        tempImg = data.menu.bm.path.full;
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25').replace(/\\/g,'/');
        mapContainer.style.backgroundImage = `url('http://` + location.host + `/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}')`;
    }
    if(tempMapName !== data.menu.bm.metadata.title){
        tempMapName = data.menu.bm.metadata.title;
        mapTitle.innerHTML = tempMapName;
    }
    if(tempMapDiff !== '[' + data.menu.bm.metadata.difficulty + ']'){
        tempMapDiff = '[' + data.menu.bm.metadata.difficulty + ']';
        mapDifficulty.innerHTML = tempMapDiff;
    }
	if(bestOfTemp !== data.tourney.manager.bestOF) {
		bestOfTemp = data.tourney.manager.bestOF;
		scoreMaxBlue.innerHTML = '\xa0/\xa0' + Math.ceil(bestOfTemp / 2);
		scoreMaxRed.innerHTML = '\xa0/\xa0' + Math.ceil(bestOfTemp / 2);
	}
	if(scoreBlueTemp !== data.tourney.manager.stars.left) {
		scoreBlueTemp = data.tourney.manager.stars.left;
		scoreNowBlue.innerHTML = scoreBlueTemp;
	}
	if(scoreRedTemp !== data.tourney.manager.stars.right) {
		scoreRedTemp = data.tourney.manager.stars.right;
		scoreNowRed.innerHTML = scoreRedTemp;
	}
	if(teamNameBlueTemp !== data.tourney.manager.teamName.left) {
		teamNameBlueTemp = data.tourney.manager.teamName.left;
		teamBlueName.innerHTML = teamNameBlueTemp;
	}
	if(teamNameRedTemp !== data.tourney.manager.teamName.right) {
		teamNameRedTemp = data.tourney.manager.teamName.right;
		teamRedName.innerHTML = teamNameRedTemp;
	}
	if(scoreVisibleTemp) {
		playScoreBlueTemp = data.tourney.manager.gameplay.score.left;
		playScoreRedTemp = data.tourney.manager.gameplay.score.right;
		
		animation.playScoreBlue.update(playScoreBlueTemp);
		animation.playScoreRed.update(playScoreRedTemp);

		const bgRed = "#f4557a";
		const bgBlue = "#545fff";
		const bgGrey = "#898989";
		
		
		
		if(playScoreBlueTemp > playScoreRedTemp) {
			// Blue is Leading
			playScoreBlue.style.backgroundColor = bgBlue;
			playScoreRed.style.backgroundColor = bgGrey;

			movingScoreBarLeft.style.width = ((playScoreBlueTemp - playScoreRedTemp) / 650000 * 960) + "px";
			movingScoreBarRight.style.width = "0px";
		} else if (playScoreBlueTemp == playScoreRedTemp) {
			// Tie
			playScoreBlue.style.backgroundColor = bgBlue;
			playScoreRed.style.backgroundColor = bgRed;

			movingScoreBarLeft.style.width = "0px";
			movingScoreBarRight.style.width = "0px";
		} else {
			// Red is Leading
			playScoreBlue.style.backgroundColor = bgGrey;
			playScoreRed.style.backgroundColor = bgRed;
			
			movingScoreBarLeft.style.width = "0px";
			movingScoreBarRight.style.width = ((playScoreRedTemp - playScoreBlueTemp) / 650000 * 960) + "px";
		}
	}
	if(!scoreVisibleTemp) {
		movingScoreBarRight.style.width = "0px";
		movingScoreBarLeft.style.width = "0px";
		if(chatLen != data.tourney.manager.chat.length) {
			// There's new chats that haven't been updated
			
			if(chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.manager.chat.length)) {
				// Starts from bottom
				chats.innerHTML = "";
				chatLen = 0;
			}
			
			// Add the chats
			for(var i=chatLen; i < data.tourney.manager.chat.length; i++) {
				tempClass = data.tourney.manager.chat[i].team;
				
				// Chat variables
				let chatParent = document.createElement('div');
				chatParent.setAttribute('class', 'chat');

				let chatTime = document.createElement('div');
				chatTime.setAttribute('class', 'chatTime');

				let chatName = document.createElement('div');
				chatName.setAttribute('class', 'chatName');

				let chatText = document.createElement('div');
				chatText.setAttribute('class', 'chatText');
				
				chatTime.innerText = data.tourney.manager.chat[i].time;
				chatName.innerText = data.tourney.manager.chat[i].name + ":\xa0";
				chatText.innerText = data.tourney.manager.chat[i].messageBody;
				
				chatName.classList.add(tempClass);
				
				chatParent.append(chatTime);
				chatParent.append(chatName);
				chatParent.append(chatText);
				chats.append(chatParent);
			}
			
			// Update the Length of chat
			chatLen = data.tourney.manager.chat.length;
			
			// Update the scroll so it's sticks at the bottom by default
			chats.scrollTop = chats.scrollHeight;
		}
	}
}