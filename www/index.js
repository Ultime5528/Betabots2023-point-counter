// DO NOT CHANGE
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

const addLeaderboardTeam = (teamnum) => {
    if(teamnum == null || teamnum == '') return;
    
    let div = document.createElement('div');
    div.classList.add('matchinfo-row');
    div.classList.add('leaderboard-row');

    let label = document.createElement('label');
    label.setAttribute('for', teamnum+'_points');
    label.innerText = teamnum;

    let input = document.createElement('input');
    input.setAttribute('placeholder', 'Points');
    input.setAttribute('name', teamnum+'_points');
    input.setAttribute('type', 'number');
    input.setAttribute('min', '0');

    div.appendChild(label);
    div.appendChild(input);

    document.querySelectorAll('.matchinfo-container > div')[2].appendChild(div);
}

const getLeaderboard = () => {
    let leaderboard = {};
    document.querySelectorAll(".leaderboard-row").forEach((row) => {
        if(row.querySelector("input").value !== "")
        leaderboard[row.querySelector("label").innerText] = Number(row.querySelector("input").value);
    });
    return leaderboard;
}

const clearLeaderboard = () => {
    document.querySelectorAll(".leaderboard-row").forEach((row) => {
        row.remove();
    });
}

const loadMatchConfig = () => {
    let config = JSON.parse(localStorage.getItem("matchConfig"));
    if(config) {
        document.getElementById("match-number").value = config.match;
        document.getElementById("green-team-number").value = config.teams.green;
        document.getElementById("yellow-team-number").value = config.teams.yellow;
        document.getElementById("next-green-number").value = config.nextMatch.green;
        document.getElementById("next-yellow-number").value = config.nextMatch.yellow;
        
        clearLeaderboard();
        Object.keys(config.leaderboard).forEach((key) => {
            addLeaderboardTeam(key);
            document.querySelector("input[name=\""+key+"_points\"]").value = config.leaderboard[key];
        });
    }
}


const saveMatchConfig = () => {
    let config = {
        match: document.getElementById("match-number").value || 0,
        teams: {
            green: document.getElementById("green-team-number").value || "",
            yellow: document.getElementById("yellow-team-number").value || ""
        },
        nextMatch: {
            green: document.getElementById("next-green-number").value || "",
            yellow: document.getElementById("next-yellow-number").value || ""
        },
        leaderboard: getLeaderboard(),
    }

    localStorage.setItem("matchConfig", JSON.stringify(config));
    return config;
}

document.getElementById("save-match-data").addEventListener("click", () => {
    websocket.send(JSON.stringify({
        type: "match",
        data: saveMatchConfig()
    }));
    document.getElementsByClassName('matchinfo')[0].style.display = 'none';
    loadMatchConfig();
});

const EnumDeviceType = {
    LIVE: "LIVE",
    CONTROLLER: "CONTROLLER",
}

let websocket = new WebSocket(location.protocol.replace("http", "ws") + "//" + location.host + "/");

websocket.onopen = function() {
    console.log("Connected to websocket");
    websocket.send(JSON.stringify({type: "auth", data: {deviceType: EnumDeviceType.CONTROLLER, pass: prompt("Mot de passe: ")}}));
}

websocket.onclose = function() {
    console.log("Disconnected from websocket");
    alert("Déconnecté du serveur");
    location.reload();
}

const circles = [];

const COLORS = {
    DEFAULT: "grey",
    GREEN: "green",
    YELLOW: "yellow"
}

let selectedColor = COLORS.DEFAULT;

class Circle {
    constructor(element) {
        this.element = element;
        this.color = COLORS.DEFAULT;

        this.element.addEventListener("click", () => {
            if(this.color !== selectedColor) {
                this.setColorToSelectedColor();
                updatePoints();
            }
        });
    }

    setColorToSelectedColor() {
        this.color = selectedColor;
        this.element.style.backgroundColor = this.color;
    }

    setColor(color) {
        this.color = color;
        this.element.style.backgroundColor = this.color;
    }

    getColor() {
        return this.color
    }

    isColor(color) {
        return this.color === color;
    }
}

document.querySelectorAll(".circle").forEach((element) => {
    circles.push(new Circle(element));
});

document.getElementById("green-button").addEventListener("click", () => {
    selectedColor = COLORS.GREEN;
    document.getElementById("green-button").classList.add("selected");
    document.getElementById("yellow-button").classList.remove("selected");
    document.getElementById("default-button").classList.remove("selected");
});

document.getElementById("yellow-button").addEventListener("click", () => {
    selectedColor = COLORS.YELLOW;
    document.getElementById("yellow-button").classList.add("selected");
    document.getElementById("green-button").classList.remove("selected");
    document.getElementById("default-button").classList.remove("selected");
});

document.getElementById("reset-button").addEventListener("click", () => {
    circles.forEach((circle) => {
        circle.setColor(COLORS.DEFAULT);
    });
    updatePoints();
});

document.getElementById("default-button").addEventListener("click", () => {
    selectedColor = COLORS.DEFAULT;
    document.getElementById("default-button").classList.add("selected");
    document.getElementById("yellow-button").classList.remove("selected");
    document.getElementById("green-button").classList.remove("selected");
});

const updatePoints = () => {
    let greenFlowers = 0;
    circles.forEach((circle) => {
        if(circle.isColor(COLORS.GREEN)) {
            greenFlowers++;
        }
    });

    let yellowFlowers = 0;
    circles.forEach((circle) => {
        if(circle.isColor(COLORS.YELLOW)) {
            yellowFlowers++;
        }
    });

    document.getElementById("fleurs-green-text").innerText = greenFlowers;
    document.getElementById("fleurs-yellow-text").innerText = yellowFlowers;

    let yellowPoints = 0;
    possiblePositions.forEach((positions) => {
        let allEqual = -1;
        if(positions.length === 3) {
            allEqual = true;
        }
        Array.from(positions).forEach((position) => {
            if(circles[position].isColor(COLORS.YELLOW) === false) {
                allEqual = false;
            }
        });
        if(allEqual === true) {
            yellowPoints++;
        }
    });
    document.getElementById("points-yellow-text").innerText = yellowPoints;

    let greenPoints = 0;
    possiblePositions.forEach((positions) => {
        let allEqual = -1;
        if(positions.length === 3) {
            allEqual = true;
        }
        Array.from(positions).forEach((position) => {
            if(!circles[position].isColor(COLORS.GREEN)) {
                allEqual = false;
            }
        });
        if(allEqual === true) {
            greenPoints++;
        }
    });
    document.getElementById("points-green-text").innerText = greenPoints;

    websocket.send(JSON.stringify({
        type: "flowers",
        data: {
            flowers_obj: circles.map((circle) => {
                return circle.getColor();
            }),
            points: {
                green: greenPoints,
                yellow: yellowPoints
            },
            flowers: {
                green: greenFlowers,
                yellow: yellowFlowers
            }
        }
    }))
};

loadMatchConfig();

class BodyLock { static lock() { const o = document.body; o.classList.contains("body-locked") !== !0 && (window.innerWidth > document.documentElement.clientWidth && (o.style.overflowY = "scroll"), window.innerHeight > document.documentElement.clientHeight && (o.style.overflowX = "scroll"), Object.assign(o.style, { position: "fixed", top: `-${window.scrollY}px`, left: `-${window.scrollX}px`, right: "0" }), o.classList.add("body-locked")) } static unlock() { const o = document.body; if (o.classList.contains("body-locked") === !1) return; const t = parseInt(o.style.left.replace("px", "") || "0", 10) * -1, e = parseInt(o.style.top.replace("px", "") || "0", 10) * -1; Object.assign(o.style, { position: "", top: "", left: "", right: "", overflowY: "", overflowX: "" }), window.scrollTo(t, e), o.classList.remove("body-locked") } static isLocked() { return document.body.classList.contains("body-locked") } }

BodyLock.lock();