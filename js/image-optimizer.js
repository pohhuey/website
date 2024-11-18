document.addEventListener('DOMContentLoaded', function() {
    // 懒加载图片
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        img.classList.add('lazy-load');
        imageObserver.observe(img);
    });

    // 预加载关键图片
    const preloadImages = [
        'images/hero/hero-small.jpg',
        'images/logo.png'
    ];

    preloadImages.forEach(imagePath => {
        const img = new Image();
        img.src = imagePath;
    });
}); 