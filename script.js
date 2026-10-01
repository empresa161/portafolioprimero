document.addEventListener('DOMContentLoaded', () => {

    /* MODO OSCURO */
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }

    let themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = document.body.classList.contains('dark') ? '☀️' : '🌙';
        document.body.appendChild(themeToggle);
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    });

    /* FILTROS DE PORTAFOLIO */
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.cat === filter;
                card.classList.toggle('hidden-item', !match);
            });
        });
    });
 
    /* NAVBAR */
    const nav = document.querySelector('nav');
    const toggleNav = () => {
        if (window.scrollY > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    };
    toggleNav();
    window.addEventListener('scroll', toggleNav);
 
    /* MODAL DE PROYECTO */
    const modal = document.getElementById('project-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalClose = document.getElementById('modal-close');
 
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            modalTag.textContent = card.dataset.tag || '';
            modalTitle.textContent = card.dataset.title || '';
            modalDesc.textContent = card.dataset.desc || '';
 
            const pdf = card.dataset.pdf;
            const video = card.dataset.video;
            const imagen = card.dataset.image;
            
            modalImage.innerHTML = '';
            modalImage.style.backgroundImage = 'none';

            if (pdf) {
                modalImage.innerHTML = `
                <iframe
                    src="${pdf}"
                    title="${card.dataset.title || 'PDF'}"
                    style="width:100%; height:100%; min-height:700px; border:none;">
                </iframe>`;
            } else if (video) {
                modalImage.innerHTML = `
                <video
                    src="${video}"
                    controls
                    autoplay
                    style="width:100%; height:100%; object-fit:contain; background:#000;">
                </video>`;
            } else if (imagen) {
                const imgElement = document.createElement('img');
                imgElement.src = imagen;
                imgElement.alt = card.dataset.title || 'Proyecto';
                imgElement.style.width = '100%';
                imgElement.style.height = '100%';
                imgElement.style.objectFit = 'contain';
                modalImage.appendChild(imgElement);
            } else {
                const bg = card.querySelector('.card-image').style.backgroundImage;
                if (bg && bg !== 'none') {
                    const urlMatch = bg.match(/url\(['"]?(.*?)['"]?\)/);
                    if (urlMatch && urlMatch[1]) {
                        const imgElement = document.createElement('img');
                        imgElement.src = urlMatch[1];
                        imgElement.style.width = '100%';
                        imgElement.style.height = '100%';
                        imgElement.style.objectFit = 'contain';
                        modalImage.appendChild(imgElement);
                    }
                } else {
                    modalImage.textContent = '[Imagen no disponible]';
                }
            }
    
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });
 
    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if(modalImage) modalImage.innerHTML = '';
    };

    if(modalClose) modalClose.addEventListener('click', closeModal);
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
 
    /* ==========================================
       CARRUSEL DEFINITIVO (CENTRADO + FLUIDO)
       ========================================== */
    const track = document.getElementById('carousel-track');
    const dotsWrap = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const carouselContainer = document.getElementById('carousel');
    
    if (track && dotsWrap && prevBtn && nextBtn && carouselContainer) {
        const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
        const totalOriginal = originalSlides.length;

        if (totalOriginal > 0) {
            track.style.paddingLeft = '0';

            // Duplicar elementos a ambos lados para el loop infinito
            originalSlides.forEach(slide => track.appendChild(slide.cloneNode(true)));
            originalSlides.slice().reverse().forEach(slide => track.insertBefore(slide.cloneNode(true), track.firstChild));

            const allSlides = track.querySelectorAll('.carousel-slide');
            let index = totalOriginal; 
            let isTransitioning = false;
            let autoplayInterval;

            // Mantener opacidad al 100% en todas
            allSlides.forEach(slide => {
                slide.style.opacity = '1';
                slide.style.transform = 'scale(1)';
            });

            // Generar puntos de navegación
            dotsWrap.innerHTML = '';
            for (let i = 0; i < totalOriginal; i++) {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', () => {
                    if (isTransitioning) return;
                    index = totalOriginal + i;
                    updateCarousel(true);
                    resetAutoplay();
                });
                dotsWrap.appendChild(dot);
            }
            const dots = dotsWrap.querySelectorAll('.dot');

            function getSlideWidth() {
                const firstSlide = allSlides[0];
                return firstSlide ? firstSlide.offsetWidth : 0;
            }

            function updateCarousel(withTransition = true) {
                const slideWidth = getSlideWidth();
                const gap = 30; // 30px de separación según CSS
                const containerWidth = carouselContainer.offsetWidth;

                if (withTransition) {
                    track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                    isTransitioning = true;
                } else {
                    track.style.transition = 'none';
                }

                // Cálculo exacto en píxeles para centrar matemáticamente la tarjeta activa
                const centerOffset = (containerWidth - slideWidth) / 2;
                const moveX = centerOffset - (index * (slideWidth + gap));
                
                track.style.transform = `translateX(${moveX}px)`;

                // Actualizar clases activas y puntos
                allSlides.forEach((slide, i) => {
                    let realIdx = (i - totalOriginal) % totalOriginal;
                    if (realIdx < 0) realIdx += totalOriginal;
                    
                    let activeRealIdx = (index - totalOriginal) % totalOriginal;
                    if (activeRealIdx < 0) activeRealIdx += totalOriginal;

                    slide.classList.toggle('active-slide', realIdx === activeRealIdx);
                    slide.style.opacity = '1';
                    slide.style.transform = 'scale(1)';
                });

                let activeDot = (index - totalOriginal) % totalOriginal;
                if (activeDot < 0) activeDot += totalOriginal;
                
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === activeDot);
                });
            }

            // Bucle infinito invisible al terminar la transición
            track.addEventListener('transitionend', () => {
                isTransitioning = false;
                
                if (index >= totalOriginal * 2) {
                    track.style.transition = 'none';
                    index = totalOriginal + (index % totalOriginal);
                    const slideWidth = getSlideWidth();
                    const gap = 30;
                    const centerOffset = (carouselContainer.offsetWidth - slideWidth) / 2;
                    track.style.transform = `translateX(${centerOffset - (index * (slideWidth + gap))}px)`;
                }
                
                if (index < totalOriginal) {
                    track.style.transition = 'none';
                    index = totalOriginal + ((index % totalOriginal + totalOriginal) % totalOriginal);
                    const slideWidth = getSlideWidth();
                    const gap = 30;
                    const centerOffset = (carouselContainer.offsetWidth - slideWidth) / 2;
                    track.style.transform = `translateX(${centerOffset - (index * (slideWidth + gap))}px)`;
                }
            });

            function nextSlide() {
                if (isTransitioning) return;
                index++;
                updateCarousel(true);
            }

            function prevSlide() {
                if (isTransitioning) return;
                index--;
                updateCarousel(true);
            }

            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoplay();
            });

            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoplay();
            });

            function startAutoplay() {
                autoplayInterval = setInterval(nextSlide, 9000);
            }

            function resetAutoplay() {
                clearInterval(autoplayInterval);
                startAutoplay();
            }

            carouselContainer.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
            carouselContainer.addEventListener('mouseleave', startAutoplay);

            // Inicializar
            updateCarousel(false);
            startAutoplay();
        }
    }

});