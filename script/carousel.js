document.addEventListener('DOMContentLoaded', () => {
  const swiper = new Swiper('.swiper', {
    loop: false,
    navigation: { nextEl: '.btn-next', prevEl: '.btn-prev' },
    // mobile-first
    slidesPerView: 1,
    spaceBetween: 16,
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      1024:{ slidesPerView: 3, spaceBetween: 30 }
    },
    observer: true,
    observeParents: true
  });

  const categoryBtns = Array.from(document.querySelectorAll('.categories button'));

  function setActiveCategoryByIndex(activeIdx) {
    const target = categoryBtns.reduce((acc, btn) => {
      const start = parseInt(btn.dataset.index, 10);
      return start <= activeIdx ? btn : acc;
    }, categoryBtns[0]) || categoryBtns[0];

    categoryBtns.forEach(b => b.classList.remove('ativo'));
    target.classList.add('ativo');
  }

  swiper.on('slideChange', () => {
    setActiveCategoryByIndex(swiper.activeIndex);
  });

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      swiper.slideTo(parseInt(btn.dataset.index, 10));
    });
  });

  setActiveCategoryByIndex(swiper.activeIndex);
});
