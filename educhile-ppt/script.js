document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // SELECTORS & STATE
    // -------------------------------------------------------------
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    let currentSlide = 1;
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentSlideNum = document.getElementById('current-slide-num');
    const totalSlidesNum = document.getElementById('total-slides-num');
    const progressBar = document.getElementById('progress-bar');
    
    // Autoplay variables
    const autoplayBtn = document.getElementById('autoplay-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    let autoplayInterval = null;
    const autoplayDuration = 6000; // 6 seconds per slide
    
    // Fullscreen selector
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Print mode selector
    const printModeBtn = document.getElementById('print-mode-btn');

    // Swipe gestures state
    let touchStartX = 0;
    let touchEndX = 0;

    // -------------------------------------------------------------
    // CORE NAVIGATION LOGIC
    // -------------------------------------------------------------
    function updatePresentation() {
        // Hide all slides and show current
        slides.forEach((slide, idx) => {
            if (idx + 1 === currentSlide) {
                slide.classList.add('active');
                slide.scrollTop = 0; // Reset scroll position within slide
            } else {
                slide.classList.remove('active');
            }
        });

        // Update indicators
        currentSlideNum.textContent = currentSlide;
        
        // Progress bar percentage calculation
        const progressPercentage = ((currentSlide - 1) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // BMC V2 Animation trigger: if we hit slide 10, trigger highlights
        if (currentSlide === 10) {
            triggerV2Animation();
        }
    }

    function goToSlide(slideIndex) {
        if (slideIndex < 1) slideIndex = 1;
        if (slideIndex > totalSlides) slideIndex = totalSlides;
        
        currentSlide = slideIndex;
        updatePresentation();
    }

    function nextSlide() {
        if (currentSlide < totalSlides) {
            goToSlide(currentSlide + 1);
        } else {
            // If autoplay is running and we reach the end, wrap to start
            if (autoplayInterval) {
                goToSlide(1);
            }
        }
    }

    function prevSlide() {
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1);
        }
    }

    // -------------------------------------------------------------
    // BMC ANIMATION HIGHLIGHT
    // -------------------------------------------------------------
    function triggerV2Animation() {
        const newItems = document.querySelectorAll('.bmc-grid.v2-canvas .new-item');
        newItems.forEach((item, index) => {
            // Apply staggered glow entries
            item.style.animation = 'none';
            // Force repaint
            item.offsetHeight; 
            item.style.animation = `flashHighlight 3s infinite ease-in-out`;
            item.style.animationDelay = `${index * 0.15}s`;
        });
    }

    // -------------------------------------------------------------
    // CONTROL DECK EVENT LISTENERS
    // -------------------------------------------------------------
    prevBtn.addEventListener('click', () => {
        stopAutoplay();
        prevSlide();
    });

    nextBtn.addEventListener('click', () => {
        stopAutoplay();
        nextSlide();
    });

    // -------------------------------------------------------------
    // INDEX INTERACTIVE NAVIGATION
    // -------------------------------------------------------------
    document.querySelectorAll('.index-card').forEach(card => {
        card.addEventListener('click', () => {
            const targetSlide = parseInt(card.getAttribute('data-target'), 10);
            if (targetSlide) {
                goToSlide(targetSlide);
            }
        });
    });

    // -------------------------------------------------------------
    // AUTOPLAY PLAYBACK
    // -------------------------------------------------------------
    function startAutoplay() {
        if (autoplayInterval) return;
        
        autoplayBtn.classList.add('active');
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        
        autoplayInterval = setInterval(() => {
            nextSlide();
        }, autoplayDuration);
    }

    function stopAutoplay() {
        if (!autoplayInterval) return;
        
        clearInterval(autoplayInterval);
        autoplayInterval = null;
        
        autoplayBtn.classList.remove('active');
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }

    autoplayBtn.addEventListener('click', () => {
        if (autoplayInterval) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    // -------------------------------------------------------------
    // FULLSCREEN HANDLER
    // -------------------------------------------------------------
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error al intentar activar pantalla completa: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Track fullscreen state to toggle active button color
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenBtn.classList.add('active');
        } else {
            fullscreenBtn.classList.remove('active');
        }
    });

    // -------------------------------------------------------------
    // PRINT MODE & PDF EXPORT
    // -------------------------------------------------------------
    function togglePrintMode() {
        stopAutoplay();
        const isPrintMode = document.body.classList.toggle('print-mode');
        
        if (isPrintMode) {
            printModeBtn.classList.add('active');
            alert('Modo Impresión activado.\n1. Presiona Ctrl + P en tu teclado.\n2. Asegúrate de configurar la orientación en Horizontal (Landscape).\n3. Activa "Gráficos de fondo" en más configuraciones para ver los colores y efectos.\n4. Presiona P o haz clic en la impresora nuevamente para salir.');
        } else {
            printModeBtn.classList.remove('active');
            updatePresentation(); // Reset viewport
        }
    }

    printModeBtn.addEventListener('click', togglePrintMode);

    // -------------------------------------------------------------
    // KEYBOARD NAVIGATION
    // -------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        // If body is in print mode, ignore slideshow controls except for toggling print mode back off
        if (document.body.classList.contains('print-mode')) {
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                togglePrintMode();
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
            case 'PageDown':
                stopAutoplay();
                nextSlide();
                e.preventDefault();
                break;
            
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'Backspace':
            case 'PageUp':
                stopAutoplay();
                prevSlide();
                e.preventDefault();
                break;
            
            case 'Home':
                stopAutoplay();
                goToSlide(1);
                e.preventDefault();
                break;
            
            case 'End':
                stopAutoplay();
                goToSlide(totalSlides);
                e.preventDefault();
                break;
            
            case 'f':
            case 'F':
                toggleFullscreen();
                e.preventDefault();
                break;

            case 'p':
            case 'P':
                togglePrintMode();
                e.preventDefault();
                break;
        }
    });

    // -------------------------------------------------------------
    // SWIPE GESTURES FOR MOBILE/TABLET
    // -------------------------------------------------------------
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50; // Minimum swipe distance
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) < threshold) return;

        stopAutoplay();
        if (diff < 0) {
            // Swiped left -> next
            nextSlide();
        } else {
            // Swiped right -> prev
            prevSlide();
        }
    }

    // Initialize View
    totalSlidesNum.textContent = totalSlides;
    updatePresentation();
});
