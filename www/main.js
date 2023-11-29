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
        WebsocketManager.queue = {};
    }

    static send(data) {
        if(WebsocketManager.frozen) {
            WebsocketManager.queue[JSON.parse(data).type] = data;
        } else {
            WebsocketManager.processQueue();
            websocket.send(data);
        }
    }
}

const TEAMS = {
    5528: {
        name: "Ultime (A)"
    },
    8255: {
        name: "Ultime (B)",
    },
    5618: {
        name: "PLS"
    }
}

const EnumDeviceType = {
    LIVE: "LIVE",
    CONTROLLER: "CONTROLLER",
}

const updatePoints = () => {
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
    WebsocketManager.send(JSON.stringify({type: "auth", data: {deviceType: EnumDeviceType.CONTROLLER, pass: ""}}));
}

websocket.onmessage = function(event) {
    const msg = JSON.parse(event.data);

    if(msg.type === "flowers") {
        fleurs.forEach((fleur, index) => {
            fleur.setColor(msg.data.flowers_obj[index]);
        });
        updatePoints();
    }
    if(msg.type === "match") {
        document.querySelector(".timer > .match").innerText = "MATCH "+msg.data.match;
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