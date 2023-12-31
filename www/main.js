const possiblePositions = [
    [0,1,2],
    [3,4,5],
    [4,5,6],
    [7,8,9],
    [8,9,10],
    [9,10,11],
    [12,13,14],
    [13,14,15],
    [16,17,18],
    [7,3,0],
    [8,4,1],
    [12,8,4],
    [13,9,5],
    [16,13,9],
    [9,5,2],
    [17,14,10],
    [14,10,6],
    [18,15,11],
    [2,6,11],
    [1,5,10],
    [5,10,15],
    [0,4,9],
    [4,9,14],
    [9,14,18],
    [3,8,13],
    [8,13,17],
    [7,12,16]
];

class WebsocketManager {
    static queue = {};
    static frozen = false;
    static teams = {
        blue: null,
        red: null
    }
    static teamsModified = false;

    static freeze() {
        WebsocketManager.frozen = true;
    }

    static unfreeze() {
        WebsocketManager.frozen = false;
        WebsocketManager.processQueue();
    }

    static processQueue() {
        if(WebsocketManager.frozen) return;

        Object.keys(WebsocketManager.queue).forEach(key => {
            websocket.send(WebsocketManager.queue[key]);
        });
        if(WebsocketManager.teamsModified) {
            websocket.send(JSON.stringify({
                type: "teams",
                data: {
                    blue: WebsocketManager.teams.blue,
                    red: WebsocketManager.teams.red
                }
            }));
            WebsocketManager.teamsModified = false;
        }
        WebsocketManager.queue = {};
    }

    static send(data) {
        if(WebsocketManager.frozen) {
            if(JSON.parse(data).type === "teams") {
                WebsocketManager.teamsModified = true;
                WebsocketManager.teams.blue = JSON.parse(data).data.blue;
                WebsocketManager.teams.red = JSON.parse(data).data.red;
            } else {
                WebsocketManager.queue[JSON.parse(data).type] = data;
            }
        } else {
            WebsocketManager.processQueue();
            websocket.send(data);
        }
    }
}

const TEAMS = {
    5528: {
        name: "Ultime (A)",
        image: "logo-5528"
    },
    8255: {
        name: "Ultime (B)",
        image: "logo-5528"
    },
    5618: {
        name: "PLS",
        image: "logo-5618"
    }
}

const EnumDeviceType = {
    LIVE: "LIVE",
    CONTROLLER: "CONTROLLER",
}

const updatePoints = (notsend) => {
    let bluePoints = 0;
    let blueFlowers = 0;

    let redPoints = 0;
    let redFlowers = 0;

    possiblePositions.forEach(position => {
        let color = null;
        position.forEach(point => {
            if(color === null) color = fleurs[point].getColor();

            if(color !== fleurs[point].getColor()) {
                color = "none"
            }
        });

        if(color === COLORS.BLUE) {
            bluePoints += 1
        } else if(color === COLORS.RED) {
            redPoints += 1
        }
    });
    fleurs.forEach(point => {
        if(point.getColor() === COLORS.BLUE) {
            blueFlowers += 1;
        } else if(point.getColor() === COLORS.RED) {
            redFlowers += 1;
        }
    });

    document.querySelector(".equipe-a > .fleur").innerText = blueFlowers;
    document.querySelector(".equipe-b > .fleur").innerText = redFlowers;
    document.querySelector(".equipe-a > .pointage").innerText = bluePoints;
    document.querySelector(".equipe-b > .pointage").innerText = redPoints;
    if(notsend) return;
    WebsocketManager.send(JSON.stringify({
        type: "flowers",
        data: {
            flowers_obj: fleurs.map((fleur) => {
                return fleur.getColor();
            }),
            points: {
                blue: bluePoints,
                red: redPoints
            },
            flowers: {
                blue: blueFlowers,
                red: redFlowers
            }
        }
    }))
}

let websocket = new WebSocket(location.protocol.replace("http", "ws") + "//" + location.host + "/");

websocket.onopen = function() {
    console.log("Connected to websocket");
    websocket.send(JSON.stringify({type: "auth", data: {deviceType: EnumDeviceType.CONTROLLER, pass: ""}}));
    websocket.send(JSON.stringify({type: "mode", data: document.getElementById("autonomous-mode").value}));
}

websocket.onmessage = function(event) {
    const msg = JSON.parse(event.data);

    if(msg.type === "flowers") {
        fleurs.forEach((fleur, index) => {
            fleur.setColor(msg.data.flowers_obj[index]);
        });
        updatePoints(true);
    }
    if(msg.type === "match") {
        document.querySelector(".timer > .match").innerText = "MATCH "+msg.data.match;
    }
    if(msg.type === "teams") {
        currentTeams.blue = msg.data.blue;
        currentTeams.red = msg.data.red;
        Object.keys(TEAMS).forEach(key => {
            if(currentTeams.blue)
            document.querySelector(".equipe-a > .logo").classList.remove(TEAMS[key].image);

            if(currentTeams.red)
            document.querySelector(".equipe-b > .logo").classList.remove(TEAMS[key].image);
        });
        

        if(currentTeams.red) {
            document.querySelector(".equipe-b > .logo").classList.add(TEAMS[currentTeams.red].image);
            document.querySelector(".equipe-b > .numero").innerText = currentTeams.red;
            document.querySelector(".equipe-b > .nom").innerText = TEAMS[currentTeams.red].name;
        }

        if(currentTeams.blue) {
            document.querySelector(".equipe-a > .logo").classList.add(TEAMS[currentTeams.blue].image);
            document.querySelector(".equipe-a > .numero").innerText = currentTeams.blue;
            document.querySelector(".equipe-a > .nom").innerText = TEAMS[currentTeams.blue].name;
        }
    }
}

websocket.onclose = function() {
    console.log("Disconnected from websocket");
    alert("Déconnecté du serveur");
    location.reload();
}

const fleurs = [];

const COLORS = {
    DEFAULT: "",
    BLUE: "bleu",
    RED: "rouge"
}

let selectedColor = COLORS.DEFAULT;

class Fleur {
    constructor(element) {
        this.element = element;
        this.color = COLORS.DEFAULT;

        this.element.addEventListener("click", () => {
            if(this.color !== selectedColor) {
                this.setColor(selectedColor);
                updatePoints();
            }
        });
    }

    setColor(color) {
        this.color = color;

        this.element.classList.remove("bleu");
        this.element.classList.remove("rouge");
        if(color !== "")
        this.element.classList.add(color);
    }

    getColor() {
        return this.color
    }

    isColor(color) {
        return this.color === color;
    }
}

for(let fleurIndex = 1; fleurIndex <= 19; fleurIndex++) {
    fleurs.push(new Fleur(document.getElementsByClassName("fleur-"+fleurIndex)[0]));
}

document.getElementById("rouge-btn").addEventListener("click", () => {
    selectedColor = COLORS.RED;

    document.getElementById("rouge-btn").classList.add("selected");

    document.getElementById("bleu-btn").classList.remove("selected");
    document.getElementById("aucun-btn").classList.remove("selected");
});

document.getElementById("bleu-btn").addEventListener("click", () => {
    selectedColor = COLORS.BLUE;

    document.getElementById("bleu-btn").classList.add("selected");

    document.getElementById("rouge-btn").classList.remove("selected");
    document.getElementById("aucun-btn").classList.remove("selected");
});

document.getElementById("aucun-btn").addEventListener("click", () => {
    selectedColor = COLORS.DEFAULT;

    document.getElementById("aucun-btn").classList.add("selected");

    document.getElementById("bleu-btn").classList.remove("selected");
    document.getElementById("rouge-btn").classList.remove("selected");
});

document.getElementById("reset-btn").addEventListener("click", () => {
    fleurs.forEach(element => {
        element.setColor(COLORS.DEFAULT);
    });
    updatePoints();
});

document.querySelector(".timer > .match").addEventListener("click", () => {
    let matchNumber = prompt("Numéro du match");

    if(Number.isInteger(parseInt(matchNumber))) {
        WebsocketManager.send(JSON.stringify({
            type: "match",
            data: {
                match: parseInt(matchNumber)
            }
        }));
        document.querySelector(".timer > .match").innerText = "MATCH "+Number(matchNumber);
    } else {
        alert("Numéro de match invalide");
    }
});

document.getElementById("freeze-btn").addEventListener("click", () => {
    if(WebsocketManager.frozen) {
        WebsocketManager.unfreeze();
        document.querySelector("#freeze-btn > a > span").innerText = "Freeze";
    } else {
        WebsocketManager.freeze();
        document.querySelector("#freeze-btn > a > span").innerText = "Unfreeze";
    }
});

let currentTeams = {
    blue: null,
    red: null
}

document.getElementsByClassName("equipe-b")[0].addEventListener("click", () => {
    let team_num = prompt("Numéro d'équipe rouge: ");
    if(!Number.isInteger(parseInt(team_num))) {
        alert("Numéro d'équipe invalide");
        return;
    }
    if(!TEAMS[team_num]) {
        alert("Équipe non trouvée");
        return;
    }
    currentTeams.red = team_num;
    Object.keys(TEAMS).forEach(key => {
        document.querySelector(".equipe-b > .logo").classList.remove(TEAMS[key].image);
    });
    document.querySelector(".equipe-b > .logo").classList.add(TEAMS[team_num].image);
    document.querySelector(".equipe-b > .numero").innerText = team_num;
    document.querySelector(".equipe-b > .nom").innerText = TEAMS[team_num].name;

    WebsocketManager.send(JSON.stringify({
        type: "teams",
        data: {
            blue: currentTeams.blue,
            red: currentTeams.red
        }
    }));
});

document.getElementsByClassName("equipe-a")[0].addEventListener("click", () => {
    let team_num = prompt("Numéro d'équipe bleu: ");
    if(!Number.isInteger(parseInt(team_num))) {
        alert("Numéro d'équipe invalide");
        return;
    }
    if(!TEAMS[team_num]) {
        alert("Équipe non trouvée");
        return;
    }
    currentTeams.blue = team_num;
    Object.keys(TEAMS).forEach(key => {
        document.querySelector(".equipe-a > .logo").classList.remove(TEAMS[key].image);
    });
    document.querySelector(".equipe-a > .logo").classList.add(TEAMS[team_num].image);
    document.querySelector(".equipe-a > .numero").innerText = team_num;
    document.querySelector(".equipe-a > .nom").innerText = TEAMS[team_num].name;

    WebsocketManager.send(JSON.stringify({
        type: "teams",
        data: {
            blue: currentTeams.blue,
            red: currentTeams.red
        }
    }));
});

class Timer {
    static started = Date.now();
    static elapsed = 0;
    static paused = true;
    static resetted = true;

    static reset() {
        Timer.started = Date.now();
        Timer.elapsed = 0;
        Timer.paused = true;
        Timer.resetted = true;
        websocket.send(JSON.stringify({type: "timer", data: {type: "reset", dataTime: Date.now()}}))
    }

    static start() {
        Timer.started = Date.now();
        Timer.paused = false;
        websocket.send(JSON.stringify({type: "timer", data: {type: "start", dataTime: Date.now()}}))
    }

    static pause() {
        Timer.elapsed += Date.now() - Timer.started;
        Timer.resetted = false;
        Timer.paused = true;
        websocket.send(JSON.stringify({type: "timer", data: {type: "pause", dataTime: Date.now()}}))
    }

    static getElapsed() {
        return Timer.paused ? Timer.elapsed : Timer.elapsed + Date.now() - Timer.started;
    }
}
let currTimer = -1;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById("timer-toggle").addEventListener("click", () => {
    if(currTimer !== -1) {
        clearInterval(currTimer);
        currTimer = -1;
    }
    if(Timer.paused) {
        Timer.start();
        if(Timer.resetted && document.getElementById("autonomous-mode").value === "autonomous") {
            websocket.send(JSON.stringify({type: "sound", data: "start_auto"}))
        }
        document.getElementById("timer-toggle").innerText = "Pause";
    } else {
        Timer.pause();
        websocket.send(JSON.stringify({type: "sound", data: "pause"}))
        document.getElementById("timer-toggle").innerText = "Start";
    }
    let playedEndGame = false;
    currTimer = setInterval(async () => {
        let timeLeft = (document.getElementById("autonomous-mode").value === "autonomous" ? 15500 : 165500)-Timer.getElapsed();
        let minutes = Math.floor(timeLeft / 60000);
        let seconds = Math.floor((timeLeft % 60000) / 1000);

        if(!playedEndGame && timeLeft <= 30000 && timeLeft !== 0 && document.getElementById("autonomous-mode").value !== "autonomous") {
            websocket.send(JSON.stringify({type: "sound", data: "start_endgame"}))
            playedEndGame = true;
        }

        if(timeLeft <= 0) {
            Timer.reset();
            if(document.getElementById("autonomous-mode").value === "autonomous") {
                websocket.send(JSON.stringify({type: "sound", data: "end"}))
                await wait(2870);
                document.getElementById("autonomous-mode").value = "teleop";
                websocket.send(JSON.stringify({type: "mode", data: "teleop"}))
                websocket.send(JSON.stringify({type: "sound", data: "start_teleop"}))
                Timer.start()
            } else {
                document.getElementById("timer-toggle").innerText = "Start";
                clearInterval(currTimer);
                websocket.send(JSON.stringify({type: "sound", data: "end"}))
                return;
            }
        }

        document.querySelector(".timer > .horloge").innerText = minutes+":"+(seconds < 10 ? "0"+seconds : seconds);
    }, 10);
});
document.getElementById("timer-reset").addEventListener("click", () => {
    if(currTimer !== -1) {
        clearInterval(currTimer);
        currTimer = -1;
    }
    Timer.reset();
    document.getElementById("timer-toggle").innerText = "Start";
});
document.getElementById("autonomous-mode").addEventListener("change", () => {
    if(currTimer !== -1) {
        clearInterval(currTimer);
        currTimer = -1;
    }
    Timer.reset();
    document.getElementById("timer-toggle").innerText = "Start";
    websocket.send(JSON.stringify({type: "mode", data: document.getElementById("autonomous-mode").value}))
});