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
            this.setColorToSelectedColor();
            updatePoints();
        });
    }

    setColorToSelectedColor() {
        this.color = selectedColor;
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

document.getElementById("default-button").addEventListener("click", () => {
    selectedColor = COLORS.DEFAULT;
    document.getElementById("default-button").classList.add("selected");
    document.getElementById("yellow-button").classList.remove("selected");
    document.getElementById("green-button").classList.remove("selected");
});

const updatePoints = () => {
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
};

class BodyLock { static lock() { const o = document.body; o.classList.contains("body-locked") !== !0 && (window.innerWidth > document.documentElement.clientWidth && (o.style.overflowY = "scroll"), window.innerHeight > document.documentElement.clientHeight && (o.style.overflowX = "scroll"), Object.assign(o.style, { position: "fixed", top: `-${window.scrollY}px`, left: `-${window.scrollX}px`, right: "0" }), o.classList.add("body-locked")) } static unlock() { const o = document.body; if (o.classList.contains("body-locked") === !1) return; const t = parseInt(o.style.left.replace("px", "") || "0", 10) * -1, e = parseInt(o.style.top.replace("px", "") || "0", 10) * -1; Object.assign(o.style, { position: "", top: "", left: "", right: "", overflowY: "", overflowX: "" }), window.scrollTo(t, e), o.classList.remove("body-locked") } static isLocked() { return document.body.classList.contains("body-locked") } }

BodyLock.lock();