(() => {
  // 从 URL 获取项目 ID
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id') ? parseInt(params.get('id'), 10) : null;

  // 获取项目数据
  const project = projectId !== null 
    ? projectsData.find(p => p.id === projectId) 
    : null;

  // 如果没有找到项目，显示错误信息
  if (!project) {
    document.getElementById('page-title').textContent = 'Project Not Found';
    document.getElementById('project-title').textContent = 'Project Not Found';
    document.querySelector('.main-image-container').innerHTML = '<p style="text-align:center;padding:50px;">项目不存在 / Project not found</p>';
    document.querySelector('.thumbnail-strip').style.display = 'none';
    throw new Error('Project not found');
  }

  // 构建图片路径数组（对路径进行 URL 编码以支持中文和空格）
  const images = project.images.map(img => encodeURI(`./img/program/${project.folder}/${img}`));

  // ========== 语言切换功能 ==========
  // 从 localStorage 读取保存的语言偏好
  let currentLang = localStorage.getItem('preferredLanguage') || 'en';
  
  // 初始化语言状态
  function initLanguage() {
    // 根据保存的语言设置 body 类
    if (currentLang === 'zh') {
      document.body.classList.add('lang-zh');
      document.body.classList.remove('lang-en');
    } else {
      document.body.classList.add('lang-en');
      document.body.classList.remove('lang-zh');
    }
  }
  
  initLanguage();

  // 设置项目标题
  function updateProjectTitle() {
    const title = currentLang === 'zh' ? project.title : project.titleEn;
    document.getElementById('page-title').textContent = title;
    document.getElementById('project-title').textContent = title;
  }
  
  updateProjectTitle();

  // ========== 图片浏览功能 ==========
  let currentIndex = 0;
  const mainImage = document.getElementById('main-image');
  if (mainImage) {
    mainImage.loading = 'eager';
    mainImage.decoding = 'async';
  }
  const mainImageContainer = document.querySelector('.main-image-container');
  const carouselTrack = document.getElementById('carousel-track');
  const panelPrev = document.getElementById('panel-prev');
  const panelCurr = document.getElementById('panel-curr');
  const panelNext = document.getElementById('panel-next');
  const panelPrevImage = panelPrev ? panelPrev.querySelector('img') : null;
  const panelCurrImage = panelCurr ? panelCurr.querySelector('img') : null;
  const panelNextImage = panelNext ? panelNext.querySelector('img') : null;
  const thumbnailContainer = document.getElementById('thumbnail-container');

  // 生成缩略图（懒加载优化）
  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.alt = `Image ${index + 1}`;
    img.className = 'thumbnail';
    img.decoding = 'async';
    img.loading = 'lazy';

    // 首屏只加载前 10 张缩略图，其余使用懒加载，减少首屏压力
    if (index < 10) {
      img.src = src;
    } else {
      img.dataset.src = src;
    }
    if (index === 0) {
      img.classList.add('active');
    }

    // 点击缩略图切换主图
    img.addEventListener('click', () => {
      if (index === currentIndex) return;

      if (index === currentIndex + 1) {
        animateStep(1);
      } else if (index === currentIndex - 1) {
        animateStep(-1);
      } else {
        switchImage(index);
      }
    });

    thumbnailContainer.appendChild(img);
  });

  // 使用 IntersectionObserver 懒加载后面的缩略图
  if ('IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset && img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
          }
          observer.unobserve(img);
        }
      });
    }, {
      root: document.querySelector('.thumbnail-strip'),
      rootMargin: '50px',
      threshold: 0.1
    });

    document.querySelectorAll('.thumbnail[data-src]').forEach(img => {
      lazyObserver.observe(img);
    });
  } else {
    document.querySelectorAll('.thumbnail').forEach((img, index) => {
      if (!img.src) {
        img.src = images[index];
      }
    });
  }

  // 根据当前索引刷新三面板图片
  function updateCarouselImages() {
    if (!panelCurrImage) return;

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : null;

    panelCurrImage.src = images[currentIndex];

    if (panelPrevImage) {
      if (prevIndex !== null) {
        panelPrevImage.src = images[prevIndex];
        panelPrevImage.style.visibility = 'visible';
      } else {
        panelPrevImage.src = '';
        panelPrevImage.style.visibility = 'hidden';
      }
    }

    if (panelNextImage) {
      if (nextIndex !== null) {
        panelNextImage.src = images[nextIndex];
        panelNextImage.style.visibility = 'visible';
      } else {
        panelNextImage.src = '';
        panelNextImage.style.visibility = 'hidden';
      }
    }
  }

  // 初始化一次主图三面板
  updateCarouselImages();

  // 切换图片函数
  function switchImage(index) {
    if (index === currentIndex || index < 0 || index >= images.length) return;
    currentIndex = index;

    updateCarouselImages();
    
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  // 键盘导航
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      if (currentIndex > 0) {
        animateStep(-1);
      }
    } else if (e.key === 'ArrowRight') {
      if (currentIndex < images.length - 1) {
        animateStep(1);
      }
    }
  });

  // 滚轮导航
  if (mainImageContainer) {
    let wheelDelta = 0;
    let wheelTimeout = null;
    const wheelThreshold = 50;
    const wheelCooldown = 100;

    mainImageContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      wheelDelta += e.deltaY;
      
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      
      if (Math.abs(wheelDelta) >= wheelThreshold) {
        const direction = wheelDelta > 0 ? 1 : -1;
        
        if (direction > 0 && currentIndex < images.length - 1) {
          animateStep(1);
        } else if (direction < 0 && currentIndex > 0) {
          animateStep(-1);
        }
        
        wheelDelta = 0;
      }
      
      wheelTimeout = setTimeout(() => {
        wheelDelta = 0;
        wheelTimeout = null;
      }, wheelCooldown);
    }, { passive: false });
  }

  // 缩略图栏滚轮横向滚动
  const thumbnailStrip = document.querySelector('.thumbnail-strip');
  if (thumbnailStrip) {
    thumbnailStrip.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        thumbnailStrip.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // ========== 滑动翻页功能 ==========
  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

  function getSlideWidth() {
    if (!mainImageContainer) return 0;
    const rect = mainImageContainer.getBoundingClientRect();
    const style = window.getComputedStyle(mainImageContainer);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    return Math.max(rect.width - paddingLeft - paddingRight, 0);
  }

  const SWIPE_THRESHOLD_RATIO = 0.08;

  function finishSwipe(delta) {
    if (!carouselTrack || !mainImageContainer) return;

    const slideWidth = getSlideWidth();
    const threshold = slideWidth * SWIPE_THRESHOLD_RATIO;

    let targetOffset = 0;
    let direction = 0;

    if (delta < -threshold && currentIndex < images.length - 1) {
      targetOffset = -slideWidth;
      direction = 1;
    } else if (delta > threshold && currentIndex > 0) {
      targetOffset = slideWidth;
      direction = -1;
    }

    carouselTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
    carouselTrack.style.transform = `translateX(${targetOffset}px)`;

    const handleTransitionEnd = () => {
      carouselTrack.removeEventListener('transitionend', handleTransitionEnd);

      if (direction !== 0) {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < images.length) {
          switchImage(newIndex);
        }
      }

      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = 'translateX(0px)';
    };

    carouselTrack.addEventListener('transitionend', handleTransitionEnd);
  }

  function animateStep(direction) {
    if (!carouselTrack || !mainImageContainer) return;
    const slideWidth = getSlideWidth();
    if (!slideWidth) {
      const targetIndex = currentIndex + direction;
      switchImage(targetIndex);
      return;
    }
    
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
      if (i === newIndex) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        thumb.classList.remove('active');
      }
    });
    
    const targetOffset = direction > 0 ? -slideWidth : slideWidth;
    
    carouselTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    carouselTrack.style.transform = `translateX(${targetOffset}px)`;

    const handleTransitionEnd = () => {
      carouselTrack.removeEventListener('transitionend', handleTransitionEnd);
      currentIndex = newIndex;
      updateCarouselImages();
      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = 'translateX(0px)';
    };

    carouselTrack.addEventListener('transitionend', handleTransitionEnd);
  }
  
  // 手机端触摸滑动
  if (isMobileViewport && mainImageContainer && carouselTrack) {
    let touchStartX = 0;
    let touchStartY = 0;
    let currentTouchX = 0;
    let isDragging = false;
    let isSwiping = false;

    mainImageContainer.addEventListener('touchstart', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      currentTouchX = touchStartX;
      isDragging = false;
      isSwiping = false;
      carouselTrack.style.transition = 'none';
    }, { passive: true });

    mainImageContainer.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;

      if (!isSwiping && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isSwiping = true;
      }

      if (!isSwiping) return;

      e.preventDefault();
      isDragging = true;
      currentTouchX = touch.clientX;

      let effectiveDelta = deltaX;
      if ((currentIndex === 0 && deltaX > 0) ||
          (currentIndex === images.length - 1 && deltaX < 0)) {
        effectiveDelta = deltaX * 0.3;
      }

      carouselTrack.style.transform = `translateX(${effectiveDelta}px)`;
    }, { passive: false });

    function endTouch() {
      if (!isDragging) {
        carouselTrack.style.transition = 'transform 0.2s ease-out';
        carouselTrack.style.transform = 'translateX(0px)';
        isSwiping = false;
        return;
      }

      const delta = currentTouchX - touchStartX;
      const slideWidth = getSlideWidth();
      const threshold = slideWidth * SWIPE_THRESHOLD_RATIO;

      let direction = 0;
      if (delta < -threshold && currentIndex < images.length - 1) {
        direction = 1;
      } else if (delta > threshold && currentIndex > 0) {
        direction = -1;
      }

      if (direction !== 0) {
        const newIndex = currentIndex + direction;
        
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, i) => {
          if (i === newIndex) {
            thumb.classList.add('active');
            thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } else {
            thumb.classList.remove('active');
          }
        });

        const targetOffset = direction > 0 ? -slideWidth : slideWidth;
        carouselTrack.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        carouselTrack.style.transform = `translateX(${targetOffset}px)`;

        const handleTransitionEnd = () => {
          carouselTrack.removeEventListener('transitionend', handleTransitionEnd);
          currentIndex = newIndex;
          updateCarouselImages();
          carouselTrack.style.transition = 'none';
          carouselTrack.style.transform = 'translateX(0px)';
        };

        carouselTrack.addEventListener('transitionend', handleTransitionEnd);
      } else {
        carouselTrack.style.transition = 'transform 0.2s ease-out';
        carouselTrack.style.transform = 'translateX(0px)';
      }

      isDragging = false;
      isSwiping = false;
    }

    mainImageContainer.addEventListener('touchend', endTouch, { passive: true });
    mainImageContainer.addEventListener('touchcancel', endTouch, { passive: true });
  }

  // 桌面端鼠标拖动
  if (!isMobileViewport && mainImageContainer && carouselTrack) {
    let mouseStartX = 0;
    let currentMouseX = 0;
    let isMouseDown = false;
    let isMouseDragging = false;

    mainImageContainer.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      isMouseDragging = false;
      mouseStartX = e.clientX;
      currentMouseX = mouseStartX;
      carouselTrack.style.transition = 'none';
      document.body.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;

      const deltaX = e.clientX - mouseStartX;

      if (!isMouseDragging && Math.abs(deltaX) > 5) {
        isMouseDragging = true;
      }

      if (!isMouseDragging) return;

      currentMouseX = e.clientX;

      let effectiveDelta = deltaX;
      if ((currentIndex === 0 && deltaX > 0) ||
          (currentIndex === images.length - 1 && deltaX < 0)) {
        effectiveDelta = deltaX * 0.3;
      }

      carouselTrack.style.transform = `translateX(${effectiveDelta}px)`;
    });

    function endMouseDrag() {
      if (!isMouseDown) return;

      document.body.style.cursor = '';

      if (!isMouseDragging) {
        carouselTrack.style.transition = 'transform 0.2s ease-out';
        carouselTrack.style.transform = 'translateX(0px)';
        isMouseDown = false;
        return;
      }

      const delta = currentMouseX - mouseStartX;
      finishSwipe(delta);

      isMouseDown = false;
      isMouseDragging = false;
    }

    window.addEventListener('mouseup', endMouseDrag);
    window.addEventListener('mouseleave', endMouseDrag);
  }

  // 左右箭头点击
  const arrowPrev = document.getElementById('arrow-prev');
  const arrowNext = document.getElementById('arrow-next');

  if (arrowPrev) {
    arrowPrev.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    arrowPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      animateStep(-1);
    });
  }

  if (arrowNext) {
    arrowNext.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    arrowNext.addEventListener('click', (e) => {
      e.stopPropagation();
      animateStep(1);
    });
  }

  // 缩略图栏滑动切换（手机端）
  if (isMobileViewport && thumbnailContainer) {
    let thumbTouchStartX = 0;
    let thumbTouchStartY = 0;
    let thumbScrollLeft = 0;
    let isThumbSwiping = false;

    thumbnailContainer.addEventListener('touchstart', (e) => {
      thumbTouchStartX = e.touches[0].clientX;
      thumbTouchStartY = e.touches[0].clientY;
      thumbScrollLeft = thumbnailStrip.scrollLeft;
      isThumbSwiping = false;
    }, { passive: true });

    thumbnailContainer.addEventListener('touchmove', (e) => {
      const deltaX = e.touches[0].clientX - thumbTouchStartX;
      const deltaY = Math.abs(e.touches[0].clientY - thumbTouchStartY);
      
      if (Math.abs(deltaX) > deltaY) {
        isThumbSwiping = true;
        thumbnailStrip.scrollLeft = thumbScrollLeft - deltaX;
      }
    }, { passive: true });

    thumbnailContainer.addEventListener('touchend', (e) => {
      isThumbSwiping = false;
    }, { passive: true });
  }
})();
