console.log("JavaScript is running");

const c = document.querySelector('canvas');
const ctx = c.getContext('2d');
let cw = c.width = window.innerWidth;
let ch = c.height = window.innerHeight;
const bubbles = [];

function createBubble() {
    return {
        x: Math.random() * cw,
        y: ch + 100,
        radius: Math.random() * 50 + 10,
        speed: Math.random() * 3 + 1,
        color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
    };
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fillStyle = bubble.color;
    ctx.fill();
}

function updateBubbles() {
    ctx.clearRect(0, 0, cw, ch);
    
    if (bubbles.length < 50) {
        bubbles.push(createBubble());
    }
    
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.y -= bubble.speed;
        drawBubble(bubble);
        
        if (bubble.y + bubble.radius < 0) {
            bubbles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(updateBubbles);
}

updateBubbles();

window.addEventListener('resize', () => {
    cw = c.width = window.innerWidth;
    ch = c.height = window.innerHeight;
});