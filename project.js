(() => {
  // 项目图片数据（使用 img/program/001 文件夹的所有图片）
  const images = [
    './img/program/001/_MG_4607.webp',
    './img/program/001/_MG_4694.webp',
    './img/program/001/_MG_4896.webp',
    './img/program/001/_MG_5007.webp',
    './img/program/001/_MG_5423.webp',
    './img/program/001/_MG_5482.webp',
    './img/program/001/_MG_5510.webp',
    './img/program/001/_MG_5557.webp',
    './img/program/001/_MG_5568.webp',
    './img/program/001/_MG_5576.webp',
    './img/program/001/_MG_5630.webp',
    './img/program/001/_MG_5678.webp',
    './img/program/001/_MG_5683.webp',
    './img/program/001/_MG_5699.webp',
    './img/program/001/_MG_5708.webp',
    './img/program/001/_MG_5761.webp',
    './img/program/001/_MG_5770.webp',
    './img/program/001/_MG_5792.webp',
    './img/program/001/_MG_5807.webp',
    './img/program/001/_MG_5852.webp',
    './img/program/001/_MG_5938.webp',
    './img/program/001/_MG_5962.webp',
    './img/program/001/_MG_5965.webp',
    './img/program/001/DJI_20250801163053_0327_D.webp',
    './img/program/001/DJI_20250801192504_0405_D.webp',
    './img/program/001/DJI_20250801192521_0406_D.webp',
    './img/program/001/DJI_20250801192701_0415_D.webp',
    './img/program/001/DJI_20250801192722_0418_D.webp',
    './img/program/001/DJI_20250808152424_0510_D.webp',
    './img/program/001/DJI_20250808152910_0524_D.webp',
    './img/program/001/DJI_20250808153215_0532_D.webp',
    './img/program/001/DJI_20250808153606_0541_D.webp',
    './img/program/001/DJI_20250808153628_0542_D.webp',
    './img/program/001/DJI_20250808154231_0555_D.webp',
    './img/program/001/DJI_20250809123531_0604_D.webp'
  ];

  let currentIndex = 0;
  const mainImage = document.getElementById('main-image');
  if (mainImage) {
    // 优先加载首屏主图，但异步解码，减少卡顿
    mainImage.loading = 'eager';
    mainImage.decoding = 'async';
  }
  // 主图外层容器（用于滚轮、点击、拖动等交互）
  const mainImageContainer = document.querySelector('.main-image-container');
  // 三面板轨道与面板图片（用于无缝拖动翻页）
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

    // 点击缩略图切换主图：
    // - 当前图：不处理
    // - 相邻上一张/下一张：走与拖动一致的滑动动画
    // - 其他任意张：直接瞬时跳转
    img.addEventListener('click', () => {
      if (index === currentIndex) return;

      if (index === currentIndex + 1) {
        // 下一张
        animateStep(1);
      } else if (index === currentIndex - 1) {
        // 上一张
        animateStep(-1);
      } else {
        // 其他任意张直接切换
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
    // 不支持 IntersectionObserver 时，直接填充 src
    document.querySelectorAll('.thumbnail').forEach((img, index) => {
      if (!img.src) {
        img.src = images[index];
      }
    });
  }

  // 根据当前索引刷新三面板图片（上一张 / 当前 / 下一张）
  function updateCarouselImages() {
    if (!panelCurrImage) return;

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : null;

    // 中间当前图（同时也是 id="main-image"）
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

  // 切换图片函数：统一更新索引、三面板和缩略图（不再单独做主图 transform 动画）
  function switchImage(index) {
    if (index === currentIndex || index < 0 || index >= images.length) return;
    currentIndex = index;

    // 刷新三面板
    updateCarouselImages();
    
    // 更新缩略图激活状态
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add('active');
        // 滚动到当前缩略图位置
        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  // 键盘导航：左右箭头切换图片（带滑动动画）
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

  // 滚轮导航：在主图容器内滚动切换图片（带滑动动画）
  if (mainImageContainer) {
    let wheelDelta = 0;
    let wheelTimeout = null;
    const wheelThreshold = 50;      // 滚动阈值，越小越灵敏
    const wheelCooldown = 100;      // 冷却时间，减少到100ms让响应更快

    // 滚轮切换（垂直滚动上一张/下一张）
    mainImageContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // 累积滚动量
      wheelDelta += e.deltaY;
      
      // 清除之前的定时器
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      
      // 检查是否达到阈值
      if (Math.abs(wheelDelta) >= wheelThreshold) {
        const direction = wheelDelta > 0 ? 1 : -1;
        
        // 向下滚动 -> 下一张，向上滚动 -> 上一张
        // 使用带动画的翻页函数
        if (direction > 0 && currentIndex < images.length - 1) {
          animateStep(1);
        } else if (direction < 0 && currentIndex > 0) {
          animateStep(-1);
        }
        
        // 重置滚动量
        wheelDelta = 0;
      }
      
      // 设置新的定时器，在停止滚动后重置
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
      // 只处理垂直滚动，转换为横向滚动
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        thumbnailStrip.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  // ========== 手机端 / 桌面端滑动翻页功能（实时跟随手指/鼠标） ==========
  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

  // 计算单张图片对应的轨道滑动宽度（扣除 main-image-container 左右 padding）
  function getSlideWidth() {
    if (!mainImageContainer) return 0;
    const rect = mainImageContainer.getBoundingClientRect();
    const style = window.getComputedStyle(mainImageContainer);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;
    const paddingRight = parseFloat(style.paddingRight) || 0;
    return Math.max(rect.width - paddingLeft - paddingRight, 0);
  }

  const SWIPE_THRESHOLD_RATIO = 0.08; // 轻微拖动即可翻页：阈值为单张宽度的 8%

  // 公用：结束一次 swipe 动画的逻辑（手机 / 电脑共用）
  function finishSwipe(delta) {
    if (!carouselTrack || !mainImageContainer) return;

    const slideWidth = getSlideWidth();
    const threshold = slideWidth * SWIPE_THRESHOLD_RATIO;

    let targetOffset = 0;
    let direction = 0; // -1 上一张；1 下一张

    if (delta < -threshold && currentIndex < images.length - 1) {
      // 向左滑（手指/鼠标从右往左）-> 下一张
      targetOffset = -slideWidth;
      direction = 1;
    } else if (delta > threshold && currentIndex > 0) {
      // 向右滑（手指/鼠标从左往右）-> 上一张
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

  // 从当前图片向前/向后滑动 1 张（用于缩略图点击相邻图片、箭头点击、键盘、滚轮时触发动画）
  function animateStep(direction) {
    if (!carouselTrack || !mainImageContainer) return;
    const slideWidth = getSlideWidth();
    if (!slideWidth) {
      // 兜底：若无法计算宽度，直接跳转
      const targetIndex = currentIndex + direction;
      switchImage(targetIndex);
      return;
    }
    
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    
    // 立即更新缩略图激活状态（动画开始时就更新，不等动画结束）
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
      if (i === newIndex) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } else {
        thumb.classList.remove('active');
      }
    });
    
    // direction > 0 表示下一张，需要向左滑动；反之为正
    const targetOffset = direction > 0 ? -slideWidth : slideWidth;
    
    // 使用更慢的动画速度（0.5s）和更柔和的缓动曲线
    carouselTrack.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    carouselTrack.style.transform = `translateX(${targetOffset}px)`;

    const handleTransitionEnd = () => {
      carouselTrack.removeEventListener('transitionend', handleTransitionEnd);

      // 更新索引和三面板图片
      currentIndex = newIndex;
      updateCarouselImages();

      carouselTrack.style.transition = 'none';
      carouselTrack.style.transform = 'translateX(0px)';
    };

    carouselTrack.addEventListener('transitionend', handleTransitionEnd);
  }
  
  // 手机端：主图采用三面板 + 触摸拖动逻辑，实现无缝翻页（touch 事件）
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

      // 判断是否主要是横向滑动
      if (!isSwiping && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        isSwiping = true;
      }

      if (!isSwiping) return;

      // 阻止页面纵向滚动（本页本身也几乎不滚动）
      e.preventDefault();

      isDragging = true;
      currentTouchX = touch.clientX;

      let effectiveDelta = deltaX;
      // 边缘阻尼：第一张向右拖、最后一张向左拖
      if ((currentIndex === 0 && deltaX > 0) ||
          (currentIndex === images.length - 1 && deltaX < 0)) {
        effectiveDelta = deltaX * 0.3;
      }

      carouselTrack.style.transform = `translateX(${effectiveDelta}px)`;
    }, { passive: false });

    function endTouch() {
      if (!isDragging) {
        // 只是轻点，不切图，直接回中间
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
        direction = 1;  // 向左滑 -> 下一张
      } else if (delta > threshold && currentIndex > 0) {
        direction = -1; // 向右滑 -> 上一张
      }

      if (direction !== 0) {
        const newIndex = currentIndex + direction;
        
        // 立即更新缩略图
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
        // 没达到阈值，回弹
        carouselTrack.style.transition = 'transform 0.2s ease-out';
        carouselTrack.style.transform = 'translateX(0px)';
      }

      isDragging = false;
      isSwiping = false;
    }

    mainImageContainer.addEventListener('touchend', endTouch, { passive: true });
    mainImageContainer.addEventListener('touchcancel', endTouch, { passive: true });
  }

  // 桌面端：鼠标拖动主图实现无缝翻页（和手机端逻辑类似）
  if (!isMobileViewport && mainImageContainer && carouselTrack) {
    let mouseStartX = 0;
    let currentMouseX = 0;
    let isMouseDown = false;
    let isMouseDragging = false;

    mainImageContainer.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // 只响应左键
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

      // 移动超过一定距离才认为是拖动，避免与点击冲突
      if (!isMouseDragging && Math.abs(deltaX) > 5) {
        isMouseDragging = true;
      }

      if (!isMouseDragging) return;

      currentMouseX = e.clientX;

      let effectiveDelta = deltaX;
      // 边缘阻尼
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
        // 只是点击，不做拖动动画，交给原有点击左右区域逻辑处理
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

  // 左右箭头点击触发与拖动一致的滑动翻页效果
  const arrowPrev = document.getElementById('arrow-prev');
  const arrowNext = document.getElementById('arrow-next');

  if (arrowPrev) {
    // 阻止在箭头上按下时触发主图拖动逻辑
    arrowPrev.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    arrowPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      animateStep(-1); // 上一张
    });
  }

  if (arrowNext) {
    arrowNext.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    arrowNext.addEventListener('click', (e) => {
      e.stopPropagation();
      animateStep(1); // 下一张
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
      
      // 横向滑动距离大于纵向，认为是在滑动缩略图栏
      if (Math.abs(deltaX) > deltaY) {
        isThumbSwiping = true;
        // 横向滚动缩略图
        thumbnailStrip.scrollLeft = thumbScrollLeft - deltaX;
      }
    }, { passive: true });

    thumbnailContainer.addEventListener('touchend', (e) => {
      isThumbSwiping = false;
    }, { passive: true });
  }
})();

