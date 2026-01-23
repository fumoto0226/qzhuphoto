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
  const thumbnailContainer = document.getElementById('thumbnail-container');

  // 生成缩略图
  images.forEach((src, index) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Image ${index + 1}`;
    img.className = 'thumbnail';
    if (index === 0) {
      img.classList.add('active');
    }

    // 点击缩略图切换主图
    img.addEventListener('click', () => {
      switchImage(index);
    });

    thumbnailContainer.appendChild(img);
  });

  // 切换图片函数
  function switchImage(index) {
    if (index === currentIndex) return;

    currentIndex = index;
    
    // 预加载图片，加载完成后再切换，避免闪烁
    const newImg = new Image();
    newImg.onload = () => {
      mainImage.src = images[index];
    };
    newImg.src = images[index];
    
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

  // 键盘导航：左右箭头切换图片
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      switchImage(prevIndex);
    } else if (e.key === 'ArrowRight') {
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      switchImage(nextIndex);
    }
  });

  // 滚轮导航：在主图区域滚动时切换图片
  let wheelDelta = 0;
  let wheelTimeout = null;
  const wheelThreshold = 50;      // 滚动阈值，越小越灵敏
  const wheelCooldown = 100;      // 冷却时间，减少到100ms让响应更快

  mainImage.parentElement.addEventListener('wheel', (e) => {
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
      if (direction > 0) {
        const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        switchImage(nextIndex);
      } else {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        switchImage(prevIndex);
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
})();

