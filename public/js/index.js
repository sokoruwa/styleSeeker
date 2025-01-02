console.log('Script loaded');
document.addEventListener('DOMContentLoaded', () => {
    const screenContent = document.getElementById('screen-content');
    const powerBtn = document.getElementById('power-btn');
    const tvFrame = document.querySelector('.tv-frame');
    let isPowered = false;

    // Content for different screens
    const content = {
        login: 'Login Page',
        fit_calculator: 'Fit Calculator',
        create_account: 'Create Account'
    };

    async function flickerScreen() {
        const screen = document.querySelector('.tv-screen');
        const flickerTimings = [100, 200, 150, 300, 100, 200, 400];
        
        for (let timing of flickerTimings) {
            await new Promise(resolve => setTimeout(resolve, timing));
            screen.style.transform = `scaleY(${0.8 + Math.random() * 0.4})`;
            screen.style.opacity = 0.7 + Math.random() * 0.3;
        }
        
        screen.style.transform = 'scaleY(1)';
        screen.style.opacity = '1';
        
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    powerBtn.addEventListener('click', async () => {
        if (!isPowered) {
            // Power on sequence
            isPowered = true;
            tvFrame.classList.remove('tv-off');
            tvFrame.classList.add('tv-on');
            
            await flickerScreen();
            screenContent.style.opacity = '1';
            screenContent.innerHTML = 'Select a Page';
        } else {
            // Power off sequence
            isPowered = false;
            screenContent.style.opacity = '0';
            await flickerScreen();
            tvFrame.classList.remove('tv-on');
            tvFrame.classList.add('tv-off');
        }
    });

    // Channel changing functionality
    document.querySelectorAll('.remote-btn').forEach(btn => {
        if (btn.id === 'power-btn') return; // Skip power button
        
        btn.addEventListener('click', () => {
            if (!isPowered) return;
            
            const screen = btn.dataset.screen;
            changeChannel(screen);
            
            // Update channel indicator
            const channelIndicator = document.querySelector('.channel-indicator');
            channelIndicator.textContent = btn.querySelector('span').textContent;
        });
    });

    // Add click event to the TV screen for navigation
    tvFrame.addEventListener('click', () => {
        const currentContent = screenContent.innerHTML;
        if (isPowered && currentContent !== 'Select a Page') {
            for (const [screen, text] of Object.entries(content)) {
                if (text === currentContent) {
                    window.location.href = `${screen}.html`;
                    break;
                }
            }
        }
    });

    function changeChannel(screen) {
        screenContent.style.opacity = '0';
        tvFrame.style.animation = 'channelChange 0.3s ease';
        
        setTimeout(() => {
            screenContent.innerHTML = content[screen];
            screenContent.style.opacity = '1';
            tvFrame.style.animation = '';
        }, 300);
    }

    // Create static effect particles
    function createParticles() {
        const staticEffect = document.querySelector('.tv-static');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            staticEffect.appendChild(particle);
        }
    }

    createParticles();
});
