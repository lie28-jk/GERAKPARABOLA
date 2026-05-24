// ======================================================
// VIRTUAL PHYSICS LAB - GERAK PARABOLA
// ======================================================


// ======================================================
// CANVAS
// ======================================================

const canvas = document.getElementById("simulationCanvas");

const ctx = canvas.getContext("2d");

canvas.width = 950;
canvas.height = 500;


// ======================================================
// BACKGROUND IMAGE
// ======================================================

const gridImage = new Image();

gridImage.src = "grid.png";


// ======================================================
// BUTTON
// ======================================================

const launchBtn =
document.getElementById("launchBtn");

const resetBtn =
document.getElementById("resetBtn");

const darkModeBtn =
document.getElementById("darkModeBtn");

const fullscreenBtn =
document.getElementById("fullscreenBtn");


// ======================================================
// TABLE
// ======================================================

const tableBody =
document.getElementById("dataTableBody");


// ======================================================
// AUDIO
// ======================================================

const launchSound = new Audio(
"https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3"
);


// ======================================================
// DARK MODE
// ======================================================

let darkMode = false;


// ======================================================
// COLORS
// ======================================================

const projectileColors = [

    {
        ball: "#3b82f6",
        trail: "#60a5fa",
        glow: "#93c5fd"
    },

    {
        ball: "#facc15",
        trail: "#fde047",
        glow: "#fef08a"
    },

    {
        ball: "#06b6d4",
        trail: "#22d3ee",
        glow: "#67e8f9"
    }

];


// ======================================================
// PROJECTILES
// ======================================================

let projectiles = [];

let animationId;


// ======================================================
// SLIDE NAVIGATION
// ======================================================

const slides =
document.querySelectorAll(".slide");

const nextButtons =
document.querySelectorAll(".next-btn");

const prevButtons =
document.querySelectorAll(".prev-btn");

let currentSlide = 0;


function showSlide(index) {

    slides.forEach(slide => {

        slide.classList.remove("active");

    });

    slides[index].classList.add("active");

    slides[index].scrollIntoView({
        behavior: "smooth"
    });

}


nextButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (currentSlide < slides.length - 1) {

            currentSlide++;

            showSlide(currentSlide);

        }

    });

});


prevButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (currentSlide > 0) {

            currentSlide--;

            showSlide(currentSlide);

        }

    });

});


// ======================================================
// DRAW BACKGROUND
// ======================================================

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // SKY

    const gradient =
    ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#081120");
    gradient.addColorStop(1, "#0f172a");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // GRID

    ctx.globalAlpha = 0.2;

    ctx.drawImage(
        gridImage,
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.globalAlpha = 1;

    // GROUND

    ctx.fillStyle = "#1e293b";

    ctx.fillRect(
        0,
        canvas.height - 50,
        canvas.width,
        50
    );

}


// ======================================================
// DRAW AXIS
// ======================================================

function drawAxis() {

    ctx.strokeStyle = "#94a3b8";

    ctx.lineWidth = 2;

    // X AXIS

    ctx.beginPath();

    ctx.moveTo(
        60,
        canvas.height - 50
    );

    ctx.lineTo(
        canvas.width - 40,
        canvas.height - 50
    );

    ctx.stroke();

    // Y AXIS

    ctx.beginPath();

    ctx.moveTo(
        60,
        canvas.height - 50
    );

    ctx.lineTo(
        60,
        30
    );

    ctx.stroke();

    // LABEL

    ctx.fillStyle = "#ffffff";

    ctx.font = "14px Poppins";

    ctx.fillText(
        "X (meter)",
        canvas.width - 120,
        canvas.height - 20
    );

    ctx.fillText(
        "Y",
        30,
        40
    );

    // GRID NUMBER

    for (let i = 0; i <= 800; i += 100) {

        ctx.fillStyle = "#94a3b8";

        ctx.font = "12px Poppins";

        ctx.fillText(
            i / 10,
            60 + i,
            canvas.height - 25
        );

    }

    for (let i = 0; i <= 400; i += 50) {

        ctx.fillText(
            i / 10,
            25,
            canvas.height - 50 - i
        );

    }

}


// ======================================================
// DRAW TRAJECTORY
// ======================================================

function drawTrajectory(projectile) {

    if (projectile.path.length < 2) return;

    ctx.beginPath();

    ctx.moveTo(
        projectile.path[0].x,
        projectile.path[0].y
    );

    for (let i = 1; i < projectile.path.length; i++) {

        ctx.lineTo(
            projectile.path[i].x,
            projectile.path[i].y
        );

    }

    ctx.strokeStyle =
    projectile.color.trail;

    ctx.lineWidth = 3;

    ctx.shadowBlur = 15;

    ctx.shadowColor =
    projectile.color.glow;

    ctx.stroke();

    ctx.shadowBlur = 0;

}


// ======================================================
// DRAW PROJECTILE
// ======================================================

function drawProjectile(projectile) {

    ctx.beginPath();

    ctx.arc(
        projectile.canvasX,
        projectile.canvasY,
        10,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
    projectile.color.ball;

    ctx.shadowBlur = 20;

    ctx.shadowColor =
    projectile.color.glow;

    ctx.fill();

    ctx.shadowBlur = 0;

}


// ======================================================
// DRAW INFO
// ======================================================

function drawInfo(projectile, index) {

    const startY =
    90 + (index * 110);

    ctx.fillStyle = "#ffffff";

    ctx.font = "14px Poppins";

    ctx.fillText(
        `Benda ${index + 1}`,
        720,
        startY
    );

    ctx.fillText(
        `Sudut : ${projectile.angle}°`,
        720,
        startY + 20
    );

    ctx.fillText(
        `Kecepatan : ${projectile.velocity} m/s`,
        720,
        startY + 40
    );

    ctx.fillText(
        `Waktu : ${projectile.time.toFixed(2)} s`,
        720,
        startY + 60
    );

    ctx.fillText(
        `Jangkauan : ${projectile.range.toFixed(2)} m`,
        720,
        startY + 80
    );

}


// ======================================================
// CREATE PROJECTILE
// ======================================================

function createProjectile(
    angle,
    velocity,
    gravity,
    color
) {

    const angleRad =
    angle * Math.PI / 180;

    const vx =
    velocity * Math.cos(angleRad);

    const vy =
    velocity * Math.sin(angleRad);

    const maxHeight =
    (
        Math.pow(velocity, 2) *
        Math.pow(Math.sin(angleRad), 2)
    ) / (2 * gravity);

    const range =
    (
        Math.pow(velocity, 2) *
        Math.sin(2 * angleRad)
    ) / gravity;

    const totalTime =
    (2 * vy) / gravity;

    return {

        angle,
        velocity,
        gravity,
        vx,
        vy,
        maxHeight,
        range,
        totalTime,

        time: 0,

        x: 0,
        y: 0,

        canvasX: 60,
        canvasY: canvas.height - 50,

        active: true,

        landed: false,

        color,

        path: []

    };

}


// ======================================================
// LAUNCH SIMULATION
// ======================================================

function launchSimulation() {

    cancelAnimationFrame(animationId);

    projectiles = [];

    tableBody.innerHTML = "";

    launchSound.currentTime = 0;

    launchSound.play();

    const gravity =
    parseFloat(
        document.getElementById("gravity").value
    );

    const inputs = [

        {
            angle:
            parseFloat(
                document.getElementById("angle1").value
            ),

            velocity:
            parseFloat(
                document.getElementById("velocity1").value
            )
        },

        {
            angle:
            parseFloat(
                document.getElementById("angle2").value
            ),

            velocity:
            parseFloat(
                document.getElementById("velocity2").value
            )
        },

        {
            angle:
            parseFloat(
                document.getElementById("angle3").value
            ),

            velocity:
            parseFloat(
                document.getElementById("velocity3").value
            )
        }

    ];

    inputs.forEach((input, index) => {

        const projectile =
        createProjectile(
            input.angle,
            input.velocity,
            gravity,
            projectileColors[index]
        );

        projectiles.push(projectile);

        // TABLE

        const row =
        document.createElement("tr");

        row.innerHTML = `

            <td>Benda ${index + 1}</td>

            <td>${projectile.angle}°</td>

            <td>${projectile.velocity} m/s</td>

            <td>${projectile.maxHeight.toFixed(2)} m</td>

            <td>${projectile.range.toFixed(2)} m</td>

            <td>${projectile.totalTime.toFixed(2)} s</td>

        `;

        tableBody.appendChild(row);

    });

    animate();

}


// ======================================================
// ANIMATION
// ======================================================

function animate() {

    animationId =
    requestAnimationFrame(animate);

    drawBackground();

    drawAxis();

    let activeCount = 0;

    projectiles.forEach((projectile, index) => {

        // =====================================
        // SAAT MASIH BERGERAK
        // =====================================

        if (projectile.active) {

            activeCount++;

            projectile.time += 0.03;

            projectile.x =
            projectile.vx *
            projectile.time;

            projectile.y =
            (
                projectile.vy *
                projectile.time
            ) -
            (
                0.5 *
                projectile.gravity *
                projectile.time *
                projectile.time
            );

            // AUTO SCALE

            const scaleX =
            Math.max(
                5,
                700 / (projectile.range + 20)
            );

            const scaleY =
            Math.max(
                5,
                250 / (projectile.maxHeight + 10)
            );

            projectile.canvasX =
            60 +
            (projectile.x * scaleX);

            projectile.canvasY =
            canvas.height -
            50 -
            (projectile.y * scaleY);

            // SAVE PATH

            projectile.path.push({

                x: projectile.canvasX,
                y: projectile.canvasY

            });

            // MAX HEIGHT

            const peakTime =
            projectile.vy /
            projectile.gravity;

            if (
                Math.abs(
                    projectile.time - peakTime
                ) < 0.03
            ) {

                projectile.peakPoint = {

                    x: projectile.canvasX,
                    y: projectile.canvasY

                };

            }

            // LANDING

            if (projectile.y <= 0 &&
                projectile.time > 0.1) {

                projectile.active = false;

                projectile.landed = true;
            }

        }

        // =====================================
        // DRAW TRAJECTORY TETAP
        // =====================================

        drawTrajectory(projectile);

        // =====================================
        // DRAW BOLA TERAKHIR
        // =====================================

        if (projectile.path.length > 0) {

            const lastPoint =
            projectile.path[
                projectile.path.length - 1
            ];

            projectile.canvasX =
            lastPoint.x;

            projectile.canvasY =
            lastPoint.y;

            drawProjectile(projectile);

        }

        // =====================================
        // DRAW INFO PANEL
        // =====================================

        drawInfo(projectile, index);

        // =====================================
        // DRAW PEAK LABEL
        // =====================================

        if (projectile.peakPoint) {

            ctx.fillStyle = "#ffffff";

            ctx.font = "13px Poppins";

            ctx.fillText(
                `H max = ${projectile.maxHeight.toFixed(1)} m`,
                projectile.peakPoint.x + 10,
                projectile.peakPoint.y - 10
            );

        }

        // =====================================
        // DRAW RANGE LABEL
        // =====================================

        if (projectile.landed &&
            projectile.path.length > 0) {

            const endPoint =
            projectile.path[
                projectile.path.length - 1
            ];

            ctx.fillStyle = "#ffd54a";

            ctx.font = "bold 13px Poppins";

            ctx.fillText(
                `R = ${projectile.range.toFixed(1)} m`,
                endPoint.x - 25,
                canvas.height - 70
            );

            ctx.fillText(
                `T = ${projectile.totalTime.toFixed(2)} s`,
                endPoint.x - 25,
                canvas.height - 90
            );

        }

    });

    // =====================================
    // STOP ANIMATION
    // =====================================

    if (activeCount === 0) {

        cancelAnimationFrame(animationId);

    }

}


// ======================================================
// RESET
// ======================================================

function resetSimulation() {

    cancelAnimationFrame(animationId);

    projectiles = [];

    tableBody.innerHTML = "";

    drawBackground();

    drawAxis();

}


// ======================================================
// DARK MODE
// ======================================================

function toggleDarkMode() {

    darkMode = !darkMode;

    document.body.classList.toggle("dark-mode");

}


// ======================================================
// FULLSCREEN
// ======================================================

function toggleFullscreen() {

    if (!document.fullscreenElement) {

        document.documentElement
        .requestFullscreen();

    } else {

        document.exitFullscreen();

    }

}


// ======================================================
// EVENT LISTENERS
// ======================================================

launchBtn.addEventListener(
    "click",
    launchSimulation
);

resetBtn.addEventListener(
    "click",
    resetSimulation
);

darkModeBtn.addEventListener(
    "click",
    toggleDarkMode
);

fullscreenBtn.addEventListener(
    "click",
    toggleFullscreen
);


// ======================================================
// INITIAL DRAW
// ======================================================

drawBackground();

drawAxis();
