document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    let noClickCount = 0;
    const noThreshold = 3;
    let petalInterval;
    
    // --- Elements ---
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const angryOverlay = document.getElementById('angryOverlay');
    const closeOverlayBtn = document.getElementById('closeOverlay');
    const celebrationSound = document.getElementById('celebrationSound');
    const petalContainer = document.getElementById('petalContainer');

    // --- New Music Elements ---
    const musicBtn = document.getElementById('musicControl');
    const bgMusic = document.getElementById('bgMusic');
    
    const trickyGifts = document.querySelectorAll('.tricky-gift');
    const realGift = document.getElementById('realGift');
    
    // --- Petal Animation Function ---
    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        
        // Randomize size, position, and animation duration
        const size = Math.random() * 20 + 10 + 'px'; // 10px to 30px
        const left = Math.random() * 100 + 'vw';
        const duration = Math.random() * 3 + 2 + 's'; // 2s to 5s fall speed
        const delay = Math.random() * 2 + 's';

        petal.style.width = size;
        petal.style.height = size;
        petal.style.left = left;
        petal.style.animationDuration = duration;
        petal.style.animationDelay = delay;
        // Randomize color slightly
        const colors = ['#FF007F', '#FF6F61', '#E91E63', '#C2185B'];
        petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        petalContainer.appendChild(petal);

        // Remove petal after animation to keep DOM clean
        setTimeout(() => {
            petal.remove();
        }, 6000); // 6s (max duration + buffer)
    }

    function startPetals() {
        // Create a petal every 100ms
        petalInterval = setInterval(createPetal, 100);
    }

    function stopPetals() {
        clearInterval(petalInterval);
        // Optional: clear existing petals instantly? No, let them fall naturally.
    }


    // --- Stage Switching Logic ---
    function switchStage(fromStageId, toStageId, delay = 0) {
        setTimeout(() => {
            document.getElementById(fromStageId).classList.remove('active');
            setTimeout(() => {
                document.getElementById(toStageId).classList.add('active');
            }, 800); 
        }, delay);
    }

    // --- "No" Button Logic ---
    function moveButton() {
        const container = document.querySelector('.buttons-container');
        const containerRect = container.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();
        
        const maxX = containerRect.width - btnRect.width;
        const maxY = containerRect.height - btnRect.height;
        
        const randomX = Math.random() * maxX;
        const randomY = Math.random() * maxY;
        
        noBtn.style.left = `${randomX}px`;
        noBtn.style.top = `${randomY}px`;
    }

    function handleNoInteraction(e) {
        e.preventDefault();
        // Check if on desktop (absolute position)
        if(getComputedStyle(noBtn).position === 'absolute') {
            noClickCount++;
            if(noClickCount > noThreshold) {
                angryOverlay.classList.remove('hidden');
                
                // Play Angry Sound (Force Load First)
                const angrySound = document.getElementById('angrySound');
                if(angrySound) {
                    angrySound.load(); // <--- THIS LINE HELPS
                    angrySound.volume = 1.0;
                    angrySound.play().catch(e => console.log("Sound blocked by browser"));
                }
                
                // Pause romantic music
                const bgMusic = document.getElementById('bgMusic');
                if(bgMusic) bgMusic.pause();

            } else {
                moveButton();
            }
        }
    }

    noBtn.addEventListener('mouseover', handleNoInteraction);
    noBtn.addEventListener('click', handleNoInteraction);

    closeOverlayBtn.addEventListener('click', () => {
        angryOverlay.classList.add('hidden');
        noClickCount = 0;
        
        // Resume romantic music
        const bgMusic = document.getElementById('bgMusic');
        const musicBtn = document.getElementById('musicControl');
        if(bgMusic && musicBtn.classList.contains('playing')) {
            bgMusic.play();
        }
    });
    // --- "Yes" Button Logic ---
    yesBtn.addEventListener('click', () => {
        // 1. Play Sound
        celebrationSound.volume = 0.5;
        celebrationSound.play().catch(e => console.log("Audio requires interaction first"));

        // 2. Start Rose Petals
        startPetals();
        
        // 3. Move to Message Stage
        switchStage('stage1', 'stage2');

        // 4. Wait longer (8 seconds total) before moving to Gifts
        // 5 seconds standard + 3 seconds extra = 8000ms
        setTimeout(() => {
            stopPetals(); // Stop generating new petals
            switchStage('stage2', 'stage3');
        }, 8000); 
    });


    // --- Gift Selection Logic ---
    function moveGift(gift) {
        const container = document.querySelector('.gifts-grid');
        const maxX = container.offsetWidth - gift.offsetWidth;
        const maxY = container.offsetHeight - gift.offsetHeight;
        
        gift.style.left = Math.random() * maxX + 'px';
        gift.style.top = Math.random() * maxY + 'px';
    }

    trickyGifts.forEach(gift => {
        gift.addEventListener('mouseover', () => {
            if(window.innerWidth > 768) { // Only move on desktop
                moveGift(gift);
            }
        });
    });

    realGift.addEventListener('click', () => {
        // Final celebration confetti
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
        switchStage('stage3', 'stage4');
    });

    // --- Music Control Logic ---
    musicBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicBtn.classList.add('playing');
            musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            bgMusic.pause();
            musicBtn.classList.remove('playing');
            musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
        }
    });

    // Optional: Start music automatically when she clicks YES (if not already playing)
    yesBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.volume = 0.4; // Set volume slightly lower so it's not too loud
            bgMusic.play().catch(e => console.log("Auto-play prevented"));
            musicBtn.classList.add('playing');
            musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    });
});


// --- ULTIMATE AUDIO UNLOCKER ---
// This runs on click, touch, OR mouse movement to unlock sound as early as possible
function unlockAudio() {
    const angrySound = document.getElementById('angrySound');
    const celebrationSound = document.getElementById('celebrationSound');
    const bgMusic = document.getElementById('bgMusic');

    // Helper function to silently play and pause
    const silentPlay = (audio) => {
        if(audio) {
            audio.muted = true; // Mute so it's silent
            audio.play().then(() => {
                audio.pause(); 
                audio.currentTime = 0;
                audio.muted = false; // Unmute for real use
            }).catch(e => console.log("Audio unlock waiting for interaction"));
        }
    };

    silentPlay(angrySound);
    silentPlay(celebrationSound);
    
    // Remove the listeners once unlocked so we don't spam
    document.body.removeEventListener('click', unlockAudio);
    document.body.removeEventListener('touchstart', unlockAudio);
    // Note: Most browsers still require a CLICK, but we try everything
}

// Listen for ANY interaction
document.body.addEventListener('click', unlockAudio);
document.body.addEventListener('touchstart', unlockAudio);
document.body.addEventListener('keydown', unlockAudio);
