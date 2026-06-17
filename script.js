let seeds = parseInt(localStorage.getItem('cucumber_seeds')) || 0;
let unlocked = JSON.parse(localStorage.getItem('cucumber_unlocked')) || ['cucumber'];

function updateSeedDisplay() {
    document.getElementById('seed-count').innerText = seeds;
    localStorage.setItem('cucumber_seeds', seeds);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (screenId === 'screen-catch') startCatchGame();
    if (screenId === 'screen-gaza') startGazaGame();
    if (screenId !== 'screen-video') {
        document.getElementById('video-iframe').src = '';
    }
}

// Video Logic
const videos = [
    { title: 'ריקוד המלפפון הקלאסי', url: 'https://www.youtube.com/embed/eBBx_eh4iig' },
    { title: 'מלפפון רוקד 1', url: 'https://www.youtube.com/embed/GYNrpU2PAZ8' },
    { title: 'מלפפון רוקד 2', url: 'https://www.youtube.com/embed/13DvXLdr_H4' },
    { title: 'שורט מלפפון 1', url: 'https://www.youtube.com/embed/gQ1QRIYOey8' },
    { title: 'שורט מלפפון 2', url: 'https://www.youtube.com/embed/71_zWh6rbqQ' },
    { title: 'מלפפון רוקד 3', url: 'https://www.youtube.com/embed/0Xa7Dp3-eYA' },
    { title: 'שורט מלפפון 3', url: 'https://www.youtube.com/embed/KSOcsDN6nsk' },
    { title: 'שורט מלפפון 4', url: 'https://www.youtube.com/embed/lJH5GkSL-Bk' }
];

const videoList = document.getElementById('video-list');
const videoIframe = document.getElementById('video-iframe');

videos.forEach(video => {
    const btn = document.createElement('button');
    btn.className = 'video-btn';
    btn.innerText = video.title;
    btn.onclick = () => {
        videoIframe.src = video.url;
    };
    videoList.appendChild(btn);
});

// Menu Logic
const mainCucumber = document.getElementById('main-cucumber');
const menuContainer = document.getElementById('menu-container');

mainCucumber.addEventListener('click', (event) => {
    event.stopPropagation();
    if (menuContainer.innerHTML === '') {
        const items = [
            { text: 'ריקוד מלפפונים', action: () => showScreen('screen-video') },
            { text: 'תפוס את המלפפון הנופל', action: () => showScreen('screen-catch') },
            { text: 'ויקיפדיה', action: () => window.open('https://he.wikipedia.org/wiki/%D7%9E%D7%9C%D7%A4%D7%A4%D7%95%D7%9F', '_blank') },
            { text: 'מלפפון עזה', action: () => showScreen('screen-gaza') },
            { text: 'חנות ירקות', action: () => showScreen('screen-shop') }
        ];

        // Positions relative to the container center
        const centerX = 0; // Container itself is positioned correctly
        const centerY = 0;

        items.forEach((item, index) => {
            const angle = (index / items.length) * Math.PI * 2;
            const radius = 220 + Math.random() * 40;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            const div = document.createElement('div');
            div.className = 'menu-item';
            div.innerHTML = `<span>${item.text}</span>`;
            div.style.left = `calc(50% + ${x}px)`;
            div.style.top = `calc(50% + ${y}px)`;
            div.style.transform = 'translate(-50%, -50%)';

            // Create arrow pointing to cucumber
            const arrow = document.createElement('div');
            arrow.className = 'arrow-line';

            // Point towards center (0,0) from (x,y)
            const rotation = Math.atan2(-y, -x);

            arrow.style.width = `${radius - 60}px`;
            arrow.style.left = `calc(50% + ${x}px)`;
            arrow.style.top = `calc(50% + ${y}px)`;
            arrow.style.transform = `rotate(${rotation}rad)`;

            const arrowhead = document.createElement('div');
            arrowhead.style.position = 'absolute';
            arrowhead.style.right = '0';
            arrowhead.style.top = '-4px';
            arrowhead.style.borderTop = '5px solid transparent';
            arrowhead.style.borderBottom = '5px solid transparent';
            arrowhead.style.borderLeft = '10px solid #166534';
            arrow.appendChild(arrowhead);

            div.onclick = (e) => {
                e.stopPropagation();
                item.action();
                menuContainer.innerHTML = '';
            };
            menuContainer.appendChild(arrow);
            menuContainer.appendChild(div);
        });
    } else {
        menuContainer.innerHTML = '';
    }
});

document.body.onclick = () => {
    menuContainer.innerHTML = '';
};

// Back Buttons
document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = () => {
        showScreen('screen-main');
    };
});

// Game 1: Catch the Falling Cucumber
let catchActive = false;
function startCatchGame() {
    if (catchActive) return;
    catchActive = true;
    const canvas = document.getElementById('catch-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('catch-score');
    canvas.width = 600;
    canvas.height = 400;

    let score = 0;
    let paddle = { x: 250, y: 380, w: 100, h: 15 };
    let items = [];
    let speed = 3;

    function spawnItem() {
        const types = ['🥒'];
        if (unlocked.includes('eggplant')) types.push('🍆');
        if (unlocked.includes('carrot')) types.push('🥕');
        const type = types[Math.floor(Math.random() * types.length)];
        items.push({ x: Math.random() * (canvas.width - 30), y: -30, type: type });
    }

    function update() {
        if (!document.getElementById('screen-catch').classList.contains('active')) {
            catchActive = false;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
        ctx.fill();

        items.forEach((item, index) => {
            item.y += speed;
            ctx.font = '30px Arial';
            ctx.fillText(item.type, item.x, item.y);

            if (item.y > paddle.y && item.y < paddle.y + paddle.h && item.x + 20 > paddle.x && item.x < paddle.x + paddle.w) {
                items.splice(index, 1);
                score++;
                let reward = 1;
                if (item.type === '🍆') reward = 5;
                if (item.type === '🥕') reward = 3;
                seeds += reward;
                speed += 0.05;
                scoreElement.innerText = score;
                updateSeedDisplay();
            } else if (item.y > canvas.height + 30) {
                items.splice(index, 1);
            }
        });

        if (Math.random() < 0.03) spawnItem();
        requestAnimationFrame(update);
    }

    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' && paddle.x > 0) paddle.x -= 30;
        if (e.key === 'ArrowRight' && paddle.x < canvas.width - paddle.w) paddle.x += 30;
    };

    update();
}

// Game 2: Cucumber the Gaza
let gazaActive = false;
function startGazaGame() {
    if (gazaActive) return;
    gazaActive = true;
    const container = document.getElementById('gaza-game-container');
    const plane = document.getElementById('plane');
    const bg = document.getElementById('gaza-background');
    let planeX = 0;
    let direction = 1;

    function movePlane() {
        if (!document.getElementById('screen-gaza').classList.contains('active')) {
            gazaActive = false;
            return;
        }
        planeX += 4 * direction;
        if (planeX > 750 || planeX < 0) direction *= -1;
        plane.style.left = planeX + 'px';
        plane.style.transform = direction === 1 ? 'scaleX(-1)' : 'scaleX(1)';
        requestAnimationFrame(movePlane);
    }
    movePlane();

    const handleKey = (e) => {
        if (e.code === 'Space' && document.getElementById('screen-gaza').classList.contains('active')) {
            dropCucumber();
        }
    };
    window.addEventListener('keypress', handleKey);

    function dropCucumber() {
        const cuke = document.createElement('div');
        cuke.className = 'falling-cucumber';
        cuke.innerText = unlocked.includes('eggplant') && Math.random() > 0.7 ? '🍆' : '🥒';
        cuke.style.left = (planeX + 10) + 'px';
        cuke.style.top = '100px';
        container.appendChild(cuke);

        let top = 100;
        let scale = 1;
        const fall = setInterval(() => {
            top += 7;
            scale -= 0.012;
            cuke.style.top = top + 'px';
            cuke.style.transform = `scale(${Math.max(0.1, scale)})`;

            if (top > 440) {
                clearInterval(fall);
                explode(cuke.offsetLeft + 15, top);
                cuke.remove();
            }
        }, 20);
    }

    function explode(x, y) {
        const exp = document.createElement('div');
        exp.className = 'explosion';
        exp.innerText = '💥';
        exp.style.left = x + 'px';
        exp.style.top = y + 'px';
        container.appendChild(exp);

        bg.classList.add('burned');
        setTimeout(() => bg.classList.remove('burned'), 2000);

        seeds += 10;
        updateSeedDisplay();

        setTimeout(() => exp.remove(), 500);
    }
}

// Shop
function updateShop() {
    document.querySelectorAll('.shop-item').forEach(item => {
        const type = item.dataset.item;
        const price = parseInt(item.dataset.price);
        const btn = item.querySelector('.buy-btn');
        if (unlocked.includes(type)) {
            btn.innerText = 'בבעלותך';
            btn.disabled = true;
        } else if (seeds < price) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = (e) => {
        const item = e.target.closest('.shop-item');
        const type = item.dataset.item;
        const price = parseInt(item.dataset.price);

        if (seeds >= price) {
            seeds -= price;
            unlocked.push(type);
            localStorage.setItem('cucumber_unlocked', JSON.stringify(unlocked));
            updateSeedDisplay();
            updateShop();
        }
    };
});

setInterval(updateShop, 1000);
updateSeedDisplay();
