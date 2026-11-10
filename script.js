// Bank Soal Persamaan Kuadrat (10 Soal)
const questions = [
    { q: "Akar-akar dari $x^2 - 5x + 6 = 0$ adalah...", options: ["$x = 2$ dan $x = 3$", "$x = -2$ dan $x = -3$", "$x = 1$ dan $x = 6$", "$x = -1$ dan $x = -6$"], answerText: "$x = 2$ dan $x = 3$" },
    { q: "Akar-akar dari $x^2 - 9 = 0$ adalah...", options: ["$x = 3$ dan $x = -3$", "$x = 9$ dan $x = -9$", "$x = 0$ dan $x = 3$", "$x = 1$ dan $x = 9$"], answerText: "$x = 3$ dan $x = -3$" },
    { q: "Jumlah akar-akar ($x_1 + x_2$) dari $x^2 + 4x - 12 = 0$ adalah...", options: ["-4", "4", "-12", "12"], answerText: "-4" },
    { q: "Hasil kali akar-akar ($x_1 \\cdot x_2$) dari $x^2 - 3x - 10 = 0$ adalah...", options: ["-10", "10", "-3", "3"], answerText: "-10" },
    { q: "Nilai Diskriminan ($D = b^2 - 4ac$) dari $x^2 - 4x + 4 = 0$ adalah...", options: ["0", "16", "8", "-8"], answerText: "0" },
    { q: "Akar-akar dari $x^2 + 7x + 12 = 0$ adalah...", options: ["$x = -3$ dan $x = -4$", "$x = 3$ dan $x = 4$", "$x = 2$ dan $x = 6$", "$x = -2$ dan $x = -6$"], answerText: "$x = -3$ dan $x = -4$" },
    { q: "Persamaan kuadrat yang akar-akarnya 2 dan 5 adalah...", options: ["$x^2 - 7x + 10 = 0$", "$x^2 + 7x + 10 = 0$", "$x^2 - 3x + 10 = 0$", "$x^2 + 3x - 10 = 0$"], answerText: "$x^2 - 7x + 10 = 0$" },
    { q: "Sumbu simetri dari fungsi $y = x^2 - 6x + 8$ adalah...", options: ["$x = 3$", "$x = -3$", "$x = 6$", "$x = -6$"], answerText: "$x = 3$" },
    { q: "Akar-akar dari $2x^2 - 8 = 0$ adalah...", options: ["$x = 2$ dan $x = -2$", "$x = 4$ dan $x = -4$", "$x = 8$ dan $x = -8$", "$x = 1$ dan $x = -1$"], answerText: "$x = 2$ dan $x = -2$" },
    { q: "Jika $x = 3$ adalah akar dari $x^2 + kx - 15 = 0$, maka nilai $k$ adalah...", options: ["2", "-2", "5", "-5"], answerText: "2" }
];

// Audio Web API Synthesizer (BGM & SFX)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let bgMusicInterval = null;

function playBGM() {
    if (bgMusicInterval) clearInterval(bgMusicInterval);
    const notes = [261.63, 329.63, 392.00, 523.25];
    let index = 0;
    bgMusicInterval = setInterval(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = notes[index % notes.length];
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
        index++;
    }, 500);
}

function stopBGM() {
    if (bgMusicInterval) clearInterval(bgMusicInterval);
}

function playCorrectSound() {
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.08);
        osc.stop(audioCtx.currentTime + i * 0.08 + 0.25);
    });
}

function playWrongSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.7);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.7);
}

// Koordinat Waypoints Labirin 3D [X, Z]
const waypoints3D = [
    { x: -18, z: -10 }, // Start
    { x: -10, z: -10 }, // Q1
    { x: -10, z: 0 },   // Q2
    { x: -2,  z: 0 },   // Q3
    { x: -2,  z: -10 }, // Q4
    { x: 6,   z: -10 }, // Q5
    { x: 6,   z: 10 },  // Q6
    { x: 14,  z: 10 },  // Q7
    { x: 14,  z: 0 },   // Q8
    { x: 18,  z: 0 },   // Q9
    { x: 18,  z: 10 }   // Q10 / Finish
];

// Variables State
let currentQuestionIndex = 0;
let score = 0;
let hp = 3;
let timeLeft = 600;
let timerInterval = null;
let isAnimating = false;
let targetWaypoint = 0;
let currentShuffledOptions = [];

// THREE.JS SCENE SETUP
let scene, camera, renderer;
let rabbitGroup, gateMeshes = [], spikeGroup;

function init3D() {
    const container = document.getElementById('canvas3d-container');
    container.innerHTML = '';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 32, 28);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const groundGeo = new THREE.PlaneGeometry(50, 35);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xd5c8a0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    create3DPath();

    rabbitGroup = createPerfect3DRabbit();
    scene.add(rabbitGroup);

    create3DGates();

    spikeGroup = create3DSpikes();
    scene.add(spikeGroup);

    animate3D();
}

function createPerfect3DRabbit() {
    const rabbit = new THREE.Group();

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
    const darkPinkMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    const bodyGeo = new THREE.SphereGeometry(1, 32, 16);
    bodyGeo.scale(1.1, 0.9, 1.3);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    body.position.y = 0.9;
    body.castShadow = true;
    rabbit.add(body);

    const headGeo = new THREE.SphereGeometry(0.75, 32, 16);
    const head = new THREE.Mesh(headGeo, whiteMat);
    head.position.set(0, 1.6, 0.7);
    head.castShadow = true;
    rabbit.add(head);

    const earOuterGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.4, 16);
    const earInnerGeo = new THREE.CylinderGeometry(0.07, 0.12, 1.2, 16);

    const earLeft = new THREE.Mesh(earOuterGeo, whiteMat);
    earLeft.position.set(-0.3, 2.7, 0.6);
    earLeft.rotation.z = 0.15;
    earLeft.castShadow = true;
    const earLeftInner = new THREE.Mesh(earInnerGeo, pinkMat);
    earLeftInner.position.set(0, 0, 0.05);
    earLeft.add(earLeftInner);
    rabbit.add(earLeft);

    const earRight = new THREE.Mesh(earOuterGeo, whiteMat);
    earRight.position.set(0.3, 2.7, 0.6);
    earRight.rotation.z = -0.15;
    earRight.castShadow = true;
    const earRightInner = new THREE.Mesh(earInnerGeo, pinkMat);
    earRightInner.position.set(0, 0, 0.05);
    earRight.add(earRightInner);
    rabbit.add(earRight);

    const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const eyeLeft = new THREE.Mesh(eyeGeo, blackMat);
    eyeLeft.position.set(-0.32, 1.75, 1.3);
    const eyeRight = new THREE.Mesh(eyeGeo, blackMat);
    eyeRight.position.set(0.32, 1.75, 1.3);
    rabbit.add(eyeLeft);
    rabbit.add(eyeRight);

    const cheekGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const cheekLeft = new THREE.Mesh(cheekGeo, pinkMat);
    cheekLeft.position.set(-0.45, 1.5, 1.15);
    const cheekRight = new THREE.Mesh(cheekGeo, pinkMat);
    cheekRight.position.set(0.45, 1.5, 1.15);
    rabbit.add(cheekLeft);
    rabbit.add(cheekRight);

    const noseGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const nose = new THREE.Mesh(noseGeo, darkPinkMat);
    nose.position.set(0, 1.6, 1.4);
    rabbit.add(nose);

    const tailGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const tail = new THREE.Mesh(tailGeo, whiteMat);
    tail.position.set(0, 0.8, -1.2);
    rabbit.add(tail);

    rabbit.scale.set(0.7, 0.7, 0.7);
    return rabbit;
}

function create3DPath() {
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xc8b282, roughness: 0.5 });
    for (let i = 0; i < waypoints3D.length - 1; i++) {
        const p1 = waypoints3D[i];
        const p2 = waypoints3D[i + 1];

        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const len = Math.hypot(dx, dz);

        const pathGeo = new THREE.BoxGeometry(len + 2, 0.05, 2.5);
        const pathMesh = new THREE.Mesh(pathGeo, pathMat);

        pathMesh.position.set((p1.x + p2.x) / 2, 0.02, (p1.z + p2.z) / 2);
        pathMesh.rotation.y = -Math.atan2(dz, dx);
        pathMesh.receiveShadow = true;
        scene.add(pathMesh);
    }
}

function create3DGates() {
    gateMeshes = [];
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.5, 16);
    const gateOrangeMat = new THREE.MeshStandardMaterial({ color: 0xe67e22 });

    for (let i = 1; i < waypoints3D.length - 1; i++) {
        const pt = waypoints3D[i];
        const gateGroup = new THREE.Group();

        const pLeft = new THREE.Mesh(pillarGeo, gateOrangeMat);
        pLeft.position.set(-1.2, 1.25, 0);
        const pRight = new THREE.Mesh(pillarGeo, gateOrangeMat);
        pRight.position.set(1.2, 1.25, 0);

        const topGeo = new THREE.BoxGeometry(2.8, 0.3, 0.3);
        const topMesh = new THREE.Mesh(topGeo, gateOrangeMat);
        topMesh.position.set(0, 2.4, 0);

        gateGroup.add(pLeft);
        gateGroup.add(pRight);
        gateGroup.add(topMesh);

        gateGroup.position.set(pt.x, 0, pt.z);
        scene.add(gateGroup);
        gateMeshes.push(gateGroup);
    }

    const finishPt = waypoints3D[waypoints3D.length - 1];
    const ringGeo = new THREE.RingGeometry(0.5, 1.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x27ae60, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(finishPt.x, 0.06, finishPt.z);
    scene.add(ring);
}

function create3DSpikes() {
    const spikes = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.15, 0.8, 16);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, metalness: 0.6 });

    for (let x = -0.8; x <= 0.8; x += 0.4) {
        for (let z = -0.8; z <= 0.8; z += 0.4) {
            const spike = new THREE.Mesh(coneGeo, redMat);
            spike.position.set(x, 0.4, z);
            spikes.add(spike);
        }
    }
    spikes.visible = false;
    return spikes;
}

function animate3D() {
    requestAnimationFrame(animate3D);

    const targetPt = waypoints3D[targetWaypoint];
    const dx = targetPt.x - rabbitGroup.position.x;
    const dz = targetPt.z - rabbitGroup.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.1) {
        rabbitGroup.position.x += (dx / dist) * 0.12;
        rabbitGroup.position.z += (dz / dist) * 0.12;

        const angle = Math.atan2(dx, dz);
        rabbitGroup.rotation.y = angle;

        rabbitGroup.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.4;
    } else {
        rabbitGroup.position.x = targetPt.x;
        rabbitGroup.position.z = targetPt.z;
        rabbitGroup.position.y = 0;
    }

    renderer.render(scene, camera);
}

// LOGIKA GAME & KUIS
function startGame() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    document.getElementById('overlay').style.display = 'none';

    score = 0;
    hp = 3;
    currentQuestionIndex = 0;
    timeLeft = 600;
    targetWaypoint = 0;
    isAnimating = false;

    init3D();
    rabbitGroup.position.set(waypoints3D[0].x, 0, waypoints3D[0].z);

    updateHPDisplay();
    document.getElementById('score').innerText = score;
    document.getElementById('timer').innerText = "10:00";

    playBGM();
    startTimer();
    loadQuestion();
}

function updateHPDisplay() {
    let hpStr = "";
    for (let i = 0; i < hp; i++) hpStr += "❤️";
    for (let i = hp; i < 3; i++) hpStr += "🖤";
    document.getElementById('hp').innerText = hpStr;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        document.getElementById('timer').innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) endGame(false, "Waktu Habis!");
    }, 1000);
}

// FUNGSI MENGACAK URUTAN JAWABAN (FISHER-YATES SHUFFLE)
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function loadQuestion() {
    let q = questions[currentQuestionIndex];
    document.getElementById('question-count').innerText = `${currentQuestionIndex + 1}/10`;
    document.getElementById('question-text').innerText = q.q;

    const container = document.getElementById('options-container');
    container.innerHTML = '';
    document.getElementById('feedback').innerText = '';

    // Acak Pilihan Opsi Jawaban
    currentShuffledOptions = shuffleArray(q.options);

    currentShuffledOptions.forEach((optText) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = optText;
        btn.onclick = () => checkAnswer(optText);
        container.appendChild(btn);
    });

    if (window.MathJax) MathJax.typesetPromise();
}

function checkAnswer(selectedOptionText) {
    if (isAnimating) return;

    let q = questions[currentQuestionIndex];
    let feedback = document.getElementById('feedback');
    let buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);
    isAnimating = true;

    // Memeriksa apakah teks jawaban yang dipilih sama dengan teks jawaban benar
    if (selectedOptionText === q.answerText) {
        // JAWABAN BENAR
        score += 10;
        document.getElementById('score').innerText = score;
        feedback.innerText = "Jawaban Benar! 🎉 Kelinci 3D melompat maju!";
        feedback.style.color = "#27ae60";
        playCorrectSound();

        if (gateMeshes[currentQuestionIndex]) {
            gateMeshes[currentQuestionIndex].children.forEach(m => {
                m.material = new THREE.MeshStandardMaterial({ color: 0x27ae60 });
            });
        }

        targetWaypoint = currentQuestionIndex + 1;

        setTimeout(() => {
            nextQuestion();
        }, 1500);

    } else {
        // JAWABAN SALAH (HUKUMAN PAKU 3D)
        hp--;
        updateHPDisplay();
        feedback.innerText = "Jawaban Salah! ⚠️ Kelinci tertusuk paku 3D!";
        feedback.style.color = "#c0392b";
        playWrongSound();

        spikeGroup.position.set(rabbitGroup.position.x, 0, rabbitGroup.position.z);
        spikeGroup.visible = true;

        setTimeout(() => {
            spikeGroup.visible = false;
            if (hp <= 0) {
                endGame(false, "Game Over! Kelinci 3D kehabisan nyawa.");
            } else {
                targetWaypoint = currentQuestionIndex + 1;
                setTimeout(() => {
                    nextQuestion();
                }, 1000);
            }
        }, 1500);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    isAnimating = false;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        targetWaypoint = waypoints3D.length - 1;
        setTimeout(() => endGame(true, `Selamat! Kelinci 3D berhasil menembus labirin dengan skor ${score}!`), 1500);
    }
}

function endGame(isWin, message) {
    clearInterval(timerInterval);
    stopBGM();

    const overlay = document.getElementById('overlay');
    document.getElementById('overlay-title').innerText = isWin ? "VICTORY! 🏆" : "GAME OVER 💀";
    document.getElementById('overlay-message').innerHTML = `${message}<br><br>Skor Akhir: <b>${score}</b>`;
    document.getElementById('start-btn').innerText = "Main Lagi";
    overlay.style.display = 'flex';
}