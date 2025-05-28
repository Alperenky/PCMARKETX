/**
 * Modern Slider - Slider yönetimi için özel JavaScript dosyası
 */

// Slider görüntülerini yönet
function updateSliderImages(currentSlide) {
  const images = document.querySelectorAll('#sliderRightImage img');
  images.forEach((img, index) => {
    if (index === currentSlide) {
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    } else {
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
    }
  });
}

// Slider başlatma
document.addEventListener('DOMContentLoaded', function() {
  // jQuery'nin yüklendiğinden emin ol
  if (typeof jQuery === 'undefined') {
    console.error('jQuery yüklenemedi!');
    return;
  }

  // Slick Carousel'in yüklendiğinden emin ol
  if (typeof jQuery.fn.slick === 'undefined') {
    console.error('Slick Carousel yüklenemedi!');
    return;
  }

  const $slider = jQuery('.modern-slider');
  if (!$slider.length) {
    console.error('Slider elementi bulunamadı!');
    return;
  }

  // Slider'ı başlat
  $slider.on('init afterChange', function(event, slick, currentSlide) {
    if (typeof currentSlide === 'undefined') {
      currentSlide = 0;
    }
    updateSliderImages(currentSlide);
  });

  // Slider ayarları
  $slider.slick({
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    fade: true,
    cssEase: 'linear',
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-chevron-left"></i></button>',
    nextArrow: '<button type="button" class="slick-next"><i class="fas fa-chevron-right"></i></button>',
    responsive: [
      {
        breakpoint: 992,
        settings: {
          arrows: false
        }
      }
    ]
  });

  // Mouse hover durumunda otomatik geçişi durdur
  $slider.on('mouseenter', function() {
    $slider.slick('slickPause');
  });

  $slider.on('mouseleave', function() {
    $slider.slick('slickPlay');
  });

  // Dokunmatik ekran desteği
  let touchStartX = 0;
  let touchEndX = 0;

  $slider.on('touchstart', function(e) {
    touchStartX = e.originalEvent.touches[0].screenX;
  }, { passive: true });

  $slider.on('touchend', function(e) {
    touchEndX = e.originalEvent.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      $slider.slick('slickNext');
    } else if (touchEndX > touchStartX + swipeThreshold) {
      $slider.slick('slickPrev');
    }
  }
}); 