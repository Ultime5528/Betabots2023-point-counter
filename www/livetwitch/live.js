const EnumDeviceType = {
    LIVE: "LIVE",
    CONTROLLER: "CONTROLLER",
}

const fleurs = [];
const COLORS = {
    DEFAULT: "",
    BLUE: "bleu",
    RED: "rouge"
}
class Fleur {
    constructor(element) {
        this.element = element;
        this.color = COLORS.DEFAULT;
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
document.querySelectorAll(".fleurs > li").forEach((fleur) => {
    fleurs.push(new Fleur(fleur));
})

let websocket = new WebSocket(location.protocol.replace("http", "ws") + "//" + location.host + "/");
websocket.onopen = function() {
    console.log("Connected to websocket");
    websocket.send(JSON.stringify({type: "auth", data: {deviceType: EnumDeviceType.LIVE}}));
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

let currentTeams = {
    red: null,
    blue: null
}

websocket.onmessage = function(event) {
    const msg = JSON.parse(event.data);

    if(msg.type === "flowers") {
        fleurs.forEach((fleur, index) => {
            fleur.setColor(msg.data.flowers_obj[index]);
        });
        document.querySelector(".equipe-b > .fleur").innerText = msg.data.flowers.red;
        document.querySelector(".equipe-a > .fleur").innerText = msg.data.flowers.blue;
        document.querySelector(".equipe-b > .pointage").innerText = msg.data.points.red;
        document.querySelector(".equipe-a > .pointage").innerText = msg.data.points.blue;
    }
    if(msg.type === "match") {
        document.querySelector(".timer > .match").innerText = "MATCH "+msg.data.match;
    }
    if(msg.type === "teams") {
        currentTeams.red = msg.data.red;
        currentTeams.blue = msg.data.blue;
        Object.keys(TEAMS).forEach(key => {
            if(currentTeams.blue)
            document.querySelector(".equipe-b > .logo").classList.remove(TEAMS[key].image);

            if(currentTeams.red)
            document.querySelector(".equipe-a > .logo").classList.remove(TEAMS[key].image);
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
    if(msg.type === "sound") {
        let audio = document.querySelector("audio");
        audio.src = "/audio/"+msg.data+".wav"
        audio.play();
    }
    if(msg.type === "timer") {
        if(msg.data.type === "start") {
            Timer.start(msg.data.dataTime);
        } else if(msg.data.type === "pause") {
            Timer.pause(msg.data.dataTime);
        } else if(msg.data.type === "reset") {
            Timer.reset();
        }
    }
    if(msg.type === "mode") {
        currentMode = msg.data;
    }
}

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
        document.querySelector(".timer > .horloge").innerText = "-:--"
    }

    static start(time) {
        Timer.started = time;
        Timer.paused = false;
    }

    static pause(time) {
        Timer.elapsed += time - Timer.started;
        Timer.resetted = false;
        Timer.paused = true;
    }

    static getElapsed() {
        return Timer.paused ? Timer.elapsed : Timer.elapsed + Date.now() - Timer.started;
    }
}
let currentMode = "autonomous";
setInterval(() => {
    let timeLeft = (currentMode === "autonomous" ? 15500 : 165500)-Timer.getElapsed();
    let minutes = Math.floor(timeLeft / 60000);
    let seconds = Math.floor((timeLeft % 60000) / 1000);

    if(timeLeft > 0 && !Timer.paused)
    document.querySelector(".timer > .horloge").innerText = minutes+":"+(seconds < 10 ? "0"+seconds : seconds);
}, 10);