(() => {
  const body = document.body;
  const viewport = document.querySelector(".viewport");
  const startAtProjects = 
    window.location.hash === '#projects-section' || 
    window.location.hash === '#projects-section-list' ||
    window.location.hash === '#projects-section-images';

  // 0 = 全屏铺满；1 = 完全缩进到画框
  let progress = 0;
  let targetProgress = 0;
  let rafId = null;
  let isUnlocked = false; // 是否已解锁页面滚动

  // 首页图片数据
  const heroImages = [
    {
      src: './img/home/1/01.webp',
      location: 'Xi\'an CCBD',
      description: 'by Heatherwick Studio. Photographed in 2024'
    },
    {
      src: './img/home/1/02.webp',
      location: 'Shanghai Tower',
      description: 'Modern Architecture. Photographed in 2024'
    },
    {
      src: './img/home/1/03.webp',
      location: 'Beijing Daxing Airport',
      description: 'by Zaha Hadid Architects. Photographed in 2024'
    },
    {
      src: './img/home/1/04.webp',
      location: 'Chongqing Jiefangbei',
      description: 'Urban Landscape. Photographed in 2024'
    },
    {
      src: './img/home/1/05.webp',
      location: 'Guangzhou Opera House',
      description: 'by Zaha Hadid Architects. Photographed in 2024'
    },
    {
      src: './img/home/1/06.webp',
      location: 'Shenzhen Bay Bridge',
      description: 'Infrastructure Photography. Photographed in 2024'
    },
    {
      src: './img/home/1/07.webp',
      location: 'Hangzhou Olympic Center',
      description: 'Sports Architecture. Photographed in 2024'
    },
    {
      src: './img/home/1/08.webp',
      location: 'Nanjing Zifeng Tower',
      description: 'Skyscraper Photography. Photographed in 2024'
    },
    {
      src: './img/home/1/09.webp',
      location: 'Wuhan Greenland Center',
      description: 'Contemporary Architecture. Photographed in 2024'
    },
    {
      src: './img/home/1/10.webp',
      location: 'Chengdu IFS',
      description: 'Commercial Complex. Photographed in 2024'
    },
    {
      src: './img/home/1/11.webp',
      location: 'Suzhou Museum',
      description: 'by I.M. Pei. Photographed in 2024'
    }
  ];

  let currentImageIndex = 0;
  let imageChangeInterval = null;
  let isPhoto1Active = true; // 标记当前显示的是哪一张图片

  // 更新首页图片和文字（双图交叉淡化）
  function updateHeroImage(index) {
    const heroPhoto1 = document.querySelector('.hero-photo-1');
    const heroPhoto2 = document.querySelector('.hero-photo-2');
    const metaBottomLeft = document.querySelector('.meta-bottom-left p');
    const metaBottomCenter = document.querySelector('.meta-bottom-center p');

    if (!heroPhoto1 || !heroPhoto2 || !metaBottomLeft || !metaBottomCenter) return;

    const imageData = heroImages[index];
    
    if (isPhoto1Active) {
      // 当前显示图片1，准备切换到图片2
      heroPhoto2.src = imageData.src; // 先加载图片2
      heroPhoto2.style.opacity = '1';  // 图片2淡入
      heroPhoto1.style.opacity = '0';  // 图片1淡出
    } else {
      // 当前显示图片2，准备切换到图片1
      heroPhoto1.src = imageData.src; // 先加载图片1
      heroPhoto1.style.opacity = '1';  // 图片1淡入
      heroPhoto2.style.opacity = '0';  // 图片2淡出
    }
    
    // 更新文字
    metaBottomLeft.textContent = imageData.location;
    metaBottomCenter.textContent = imageData.description;
    
    // 切换激活状态
    isPhoto1Active = !isPhoto1Active;
  }

  // 启动自动切换
  function startImageRotation() {
    // 初始显示第一张
    updateHeroImage(0);
    
    // 每3秒切换一次
    imageChangeInterval = setInterval(() => {
      currentImageIndex = (currentImageIndex + 1) % heroImages.length;
      updateHeroImage(currentImageIndex);
    }, 3000);
  }

  // 停止自动切换
  function stopImageRotation() {
    if (imageChangeInterval) {
      clearInterval(imageChangeInterval);
      imageChangeInterval = null;
    }
  }

  // 页面加载后启动图片轮播
  window.addEventListener('load', () => {
    startImageRotation();
  });

  // 如果已经解锁（滚动到下面），可以选择停止轮播
  // 这里我们让它一直轮播，如果你想停止可以取消注释下面的代码
  // window.addEventListener('scroll', () => {
  //   if (window.scrollY > 100 && imageChangeInterval) {
  //     stopImageRotation();
  //   }
  // });

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  function getFrameTarget() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      return { top: 64, bottom: 80, left: 16, right: 16 };
    }
    return { top: 70, bottom: 100, left: 32, right: 32 };
  }

  function applyProgress() {
    const target = getFrameTarget();
    const top = target.top * progress;
    const bottom = target.bottom * progress;
    const left = target.left * progress;
    const right = target.right * progress;

    const shell = document.querySelector(".photo-shell");
    if (!shell) return;

    // 通过 clip-path 缩小可视窗口，图片和白字都保持原位置不动，一起被裁切
    const inset = `${top}px ${right}px ${bottom}px ${left}px`;
    shell.style.clipPath = `inset(${inset})`;
    shell.style.webkitClipPath = `inset(${inset})`;

    // 用于切换文字颜色等（接近收缩完成时认为是 framed）
    body.classList.toggle("is-framed", progress > 0.6);

    // 当动画完成（progress >= 1，即完全收起）时，才解锁页面滚动
    if (progress >= 1 && !isUnlocked) {
      isUnlocked = true;
      body.classList.remove("lock-scroll");
      body.classList.add("unlock-scroll");
      // 正常进入首页时，确保在顶部；从作品页带锚点返回时，不再强制滚到顶部，避免闪一下
      if (!startAtProjects) {
        window.scrollTo(0, 0);
      }
    } else if (progress < 0.98 && isUnlocked) {
      // 往回滚到 98% 以下时重新锁定
      isUnlocked = false;
      body.classList.remove("unlock-scroll");
      body.classList.add("lock-scroll");
      window.scrollTo(0, 0);
    }
  }

  function setProgressImmediate(value) {
    progress = clamp01(value);
    applyProgress();
  }

  function tick() {
    const diff = targetProgress - progress;
    if (Math.abs(diff) < 0.001) {
      setProgressImmediate(targetProgress);
      rafId = null;
      return;
    }

    // 朝目标做一点缓动（越接近越慢），系数小一点更顺滑
    setProgressImmediate(progress + diff * 0.12);
    rafId = requestAnimationFrame(tick);
  }

  function setTargetProgress(value) {
    targetProgress = clamp01(value);
    if (rafId == null) {
      rafId = requestAnimationFrame(tick);
    }
  }

  // 初始状态：正常从顶部进入是全屏；如果带 #projects-section 相关锚点，则直接处于缩小完成并解锁滚动
  if (startAtProjects) {
    progress = 1;
    targetProgress = 1;
    isUnlocked = true;
    body.classList.remove("lock-scroll");
    body.classList.add("unlock-scroll");
    applyProgress();
    // 注意：移除 start-at-projects 的逻辑已经移到视图切换模块统一处理
  } else {
    // 初始为全屏
    setProgressImmediate(0);
  }

  // 点击首页视口区域：切换状态
  viewport.addEventListener("click", (event) => {
    // 只在锁定状态下或在页面顶部时响应点击
    if (!isUnlocked || window.scrollY <= 1) {
      const target = targetProgress < 0.5 ? 1 : 0;
      setTargetProgress(target);
    }
  });

  // 鼠标滚轮触发（包含触摸板手势）：
  // 向下滚动 -> 收起；向上滚动 -> 还原为全屏
  window.addEventListener("wheel", (event) => {
    // 在 Images 视图时，完全不接管滚轮，让图片容器自己滚
    if (document.body.classList.contains('images-mode')) return;
    
    if (Math.abs(event.deltaY) < 0.1) return;

    const factor = 0.0009; // 滚动灵敏度

    // 如果还没解锁滚动，拦截滚轮事件用于控制首页动画
    if (!isUnlocked) {
      event.preventDefault();
      const delta = event.deltaY * factor;
      setTargetProgress(targetProgress + delta);
    }
    // 如果已解锁，在页面顶部向上滚动时，控制动画还原
    else if (window.scrollY <= 1) {
      // 向上滚动：还原全屏
      if (event.deltaY < 0 && targetProgress > 0) {
        event.preventDefault();
        const delta = event.deltaY * factor;
        setTargetProgress(targetProgress + delta);
      }
      // 向下滚动但动画还没完全收起：继续控制动画
      else if (event.deltaY > 0 && targetProgress < 1) {
        event.preventDefault();
        const delta = event.deltaY * factor;
        setTargetProgress(targetProgress + delta);
      }
    }
    // 正常情况下，使用浏览器原生滚动（不拦截）
  }, { passive: false }); // 改为 passive: false 以便可以 preventDefault

  // 触摸设备：手指滑动也触发
  let touchStartY = null;
  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartY = event.touches[0].clientY;
    },
    { passive: true }
  );

  viewport.addEventListener(
    "touchmove",
    (event) => {
      if (touchStartY == null) return;
      const dy = event.touches[0].clientY - touchStartY;
      if (Math.abs(dy) < 5) return;

      const factor = 0.0022;
      // 手指向上滑动（dy < 0） -> progress 增大（收起）
      const delta = -dy * factor;
      setTargetProgress(targetProgress + delta);
    },
    { passive: true }
  );
})();

// ========== 项目展示区域交互 ==========
(() => {
  // 项目数据（包含经纬度和分类）
  const projects = [
    { id: 0,  year: 2025, title: "Xi'an CCBD",                description: "by Heatherwick Studio. Photographed in 2024", image: "./img/home/1/01.webp", coordinates: [108.9398, 34.3416], location: "Xi'an", categories: ['architecture', 'commercial'] },
    { id: 1,  year: 2024, title: "Shanghai Tower",            description: "Modern Skyscraper. Photographed in 2024",     image: "./img/home/1/02.webp", coordinates: [121.5050, 31.2333], location: "Shanghai", categories: ['architecture', 'workspace'] },
    { id: 2,  year: 2024, title: "Beijing Daxing Airport",    description: "by Zaha Hadid Architects. Photographed in 2024", image: "./img/home/1/03.webp", coordinates: [116.4106, 39.5098], location: "Beijing", categories: ['architecture', 'commercial'] },
    { id: 3,  year: 2023, title: "Guangzhou Opera House",     description: "Contemporary Architecture. Photographed in 2024", image: "./img/home/1/04.webp", coordinates: [113.3250, 23.1167], location: "Guangzhou", categories: ['architecture', 'interior'] },
    { id: 4,  year: 2023, title: "Shenzhen Bay",              description: "Coastal Development. Photographed in 2024",  image: "./img/home/1/05.webp", coordinates: [113.9456, 22.5159], location: "Shenzhen", categories: ['architecture', 'residential'] },
    { id: 5,  year: 2023, title: "Chengdu IFS",               description: "Urban Complex. Photographed in 2024",        image: "./img/home/1/06.webp", coordinates: [104.0668, 30.6624], location: "Chengdu", categories: ['commercial', 'interior'] },
    { id: 6,  year: 2022, title: "Hangzhou Olympic Center",   description: "Sports Architecture. Photographed in 2024",  image: "./img/home/1/07.webp", coordinates: [120.2151, 30.2741], location: "Hangzhou", categories: ['architecture'] },
    { id: 7,  year: 2022, title: "Nanjing Zifeng Tower",      description: "Iconic Landmark. Photographed in 2024",      image: "./img/home/1/08.webp", coordinates: [118.7789, 32.0609], location: "Nanjing", categories: ['architecture', 'workspace'] },
    { id: 8,  year: 2022, title: "Wuhan Greenland Center",    description: "Under Construction. Photographed in 2024",   image: "./img/home/1/09.webp", coordinates: [114.2734, 30.5810], location: "Wuhan", categories: ['architecture', 'commercial'] },
    { id: 9,  year: 2022, title: "Chongqing Raffles City",    description: "Horizontal Skyscraper. Photographed in 2024", image: "./img/home/1/10.webp", coordinates: [106.5804, 29.5657], location: "Chongqing", categories: ['architecture', 'residential'] },
    { id:10,  year: 2022, title: "Suzhou Museum",             description: "by I.M. Pei. Photographed in 2024",          image: "./img/home/1/11.webp", coordinates: [120.6199, 31.3159], location: "Suzhou", categories: ['architecture', 'small-scale'] },
    { id:11,  year: 2023, title: "Onoma Hotel",               description: "Hospitality Project. Photographed in 2023",  image: "./img/home/1/01.webp", coordinates: [114.1772, 22.3027], location: "Hong Kong", categories: ['hospitality', 'interior'] },
    { id:12,  year: 2023, title: "Taipei Modern Residence",   description: "Residential Project. Photographed in 2023",  image: "./img/home/1/02.webp", coordinates: [121.5654, 25.0330], location: "Taipei", categories: ['residential', 'small-scale'] },
    { id:13,  year: 2023, title: "Macau Waterfront",          description: "Retail & Leisure. Photographed in 2023",     image: "./img/home/1/03.webp", coordinates: [113.5439, 22.1987], location: "Macau", categories: ['commercial', 'architecture'] },
    { id:14,  year: 2023, title: "Sanya Coastal Resort",      description: "Resort Hotel. Photographed in 2023",         image: "./img/home/1/04.webp", coordinates: [109.5119, 18.2528], location: "Sanya", categories: ['hospitality', 'residential'] },
    { id:15,  year: 2021, title: "Seoul Riverside Gallery",   description: "Gallery by the river. Photographed in 2021", image: "./img/home/1/05.webp", coordinates: [126.9780, 37.5665], location: "Seoul", categories: ['small-scale', 'interior'] },
    { id:16,  year: 2020, title: "Singapore Harbour Lounge",  description: "Harbour-side lounge. Photographed in 2020",  image: "./img/home/1/06.webp", coordinates: [103.8198, 1.3521],  location: "Singapore", categories: ['hospitality', 'interior'] },
  ];

  const previewImage = document.getElementById("preview-image");
  const previewTitle = document.getElementById("preview-title");
  const previewDescription = document.getElementById("preview-description");

  // 初始化 Mapbox 地图
  mapboxgl.accessToken = 'pk.eyJ1IjoiZnVtb3RvIiwiYSI6ImNtYXhqbGZ4bDBiOWwybHB3a3R5dmk3Z2kifQ.vXgn2UF6HVT0cnnQRmLO1A';
  
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', // 使用白色浅色样式
    center: [113.5, 30.5], // 初始中心点（中国中部）
    zoom: 4.5, // 缩小一点以显示更多城市
    projection: 'mercator' // 使用墨卡托投影（平面地图），不是 globe（地球）
  });

  // 禁用地图旋转和倾斜
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();

  const markers = [];

  // 地图加载完成后添加标记
  map.on('load', () => {
    initializeMarkers();
  });
  
  // 初始化地图标记
  function initializeMarkers() {
    // 清除现有标记
    markers.forEach(({ marker }) => marker.remove());
    markers.length = 0;
    
    // 获取当前筛选的项目
    const category = window.getCurrentCategory ? window.getCurrentCategory() : 'all';
    const filteredProjects = window.getFilteredProjects ? window.getFilteredProjects(projects, category) : projects;
    
    filteredProjects.forEach((project, index) => {
      // 创建自定义标记元素
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.width = index === 0 ? '20px' : '16px';
      el.style.height = index === 0 ? '20px' : '16px';
      el.style.backgroundColor = index === 0 ? '#2a4cd7' : '#4a6cf7';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 8px rgba(74, 108, 247, 0.4)';
      el.style.opacity = index === 0 ? '1' : '0.4'; // 初始只有第一个点完全不透明
      el.style.transition = 'width 0.3s ease, height 0.3s ease, background-color 0.3s ease, opacity 0.3s ease';
      el.style.pointerEvents = 'auto'; // 确保鼠标事件响应灵敏

      // 悬浮标记时立即切换项目预览（无延迟）
      el.addEventListener('mouseenter', () => {
        switchProject(project.id);
        updateMarkerStyles(project.id);
      }, { passive: true });

      // 创建 Mapbox 标记
      const marker = new mapboxgl.Marker(el)
        .setLngLat(project.coordinates)
        .addTo(map);

      // 点击标记时跳转到作品页面
      el.addEventListener('click', () => {
        window.location.href = 'project.html?from=map';
      });

      markers.push({ marker, el, projectId: project.id });
    });

    // 初始激活第一个项目
    if (markers.length > 0) {
      markers[0].el.classList.add('active');
      switchProject(filteredProjects[0].id);
    }
  }
  
  // 监听分类变化事件
  document.addEventListener('categoryChanged', () => {
    initializeMarkers();
  });

  // 切换项目
  function switchProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // 先预加载图片，加载完成后再切换，避免闪白
    const img = new Image();
    img.onload = () => {
      previewImage.src = project.image;
      previewTitle.textContent = project.title;
      previewDescription.textContent = project.description;
    };
    img.src = project.image;

    // 更新标记的激活状态
    markers.forEach(({ el, projectId: pid }) => {
      if (pid === projectId) {
        el.classList.add('active');
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = '#2a4cd7';
        el.style.opacity = '1'; // 选中的点完全不透明
      } else {
        el.classList.remove('active');
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.backgroundColor = '#4a6cf7';
        el.style.opacity = '0.4'; // 未选中的点半透明
      }
    });

    // 不移动地图，保持当前视角
  }

  // 右侧列表视图与项目预览联动（根据项目数据自动渲染，并按年份排序）
  const mapListBody = document.querySelector('#map-list-container tbody');
  
  function renderListView() {
    if (!mapListBody) return;
    
    // 获取当前筛选的项目
    const category = window.getCurrentCategory ? window.getCurrentCategory() : 'all';
    const filteredProjects = window.getFilteredProjects ? window.getFilteredProjects(projects, category) : projects;
    const sorted = [...filteredProjects].sort((a, b) => b.year - a.year); // 年份从大到小
    
    mapListBody.innerHTML = '';

    sorted.forEach((project) => {
      const tr = document.createElement('tr');
      tr.dataset.projectId = String(project.id);
      tr.innerHTML = `
        <td class="col-year">${project.year}</td>
        <td class="col-title">${project.title}</td>
        <td class="col-location">${project.location}</td>
      `;

      // 悬浮时切换左侧缩略图和项目信息（和地图点效果一致）
      tr.addEventListener('mouseenter', () => {
        switchProject(project.id);
      });

      // 点击进入作品页面（从首页右侧 List 进入）
      tr.addEventListener('click', () => {
        window.location.href = 'project.html?from=indexList';
      });

      mapListBody.appendChild(tr);
    });
    
    // 如果有项目，显示第一个
    if (sorted.length > 0) {
      switchProject(sorted[0].id);
    }
  }
  
  // 初始渲染
  if (mapListBody) {
    renderListView();
  }
  
  // 监听分类变化事件
  document.addEventListener('categoryChanged', () => {
    renderListView();
  });

  // Images 视图缩略图网格
  const imagesGrid = document.getElementById('images-grid');
  
  function renderImagesView() {
    if (!imagesGrid) return;
    
    // 获取当前筛选的项目
    const category = window.getCurrentCategory ? window.getCurrentCategory() : 'all';
    const filteredProjects = window.getFilteredProjects ? window.getFilteredProjects(projects, category) : projects;
    const sortedForImages = [...filteredProjects].sort((a, b) => b.year - a.year);
    
    imagesGrid.innerHTML = '';
    
    sortedForImages.forEach((project) => {
      const card = document.createElement('div');
      card.className = 'image-card';
      card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" />
        <div class="image-card-overlay">
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
      `;

      // 点击进入作品页面（从 Images 视图进入）
      card.addEventListener('click', () => {
        window.location.href = 'project.html?from=indexImages';
      });

      imagesGrid.appendChild(card);
    });
  }
  
  // 初始渲染
  if (imagesGrid) {
    renderImagesView();
  }
  
  // 监听分类变化事件
  document.addEventListener('categoryChanged', () => {
    renderImagesView();
  });
})();

// ========== 首页右上角 Map / List 右侧视图切换 ==========
(() => {
  const mapTab = document.querySelector('.view-tab[data-view="map"]');
  const listTab = document.getElementById('view-list-tab');
  const imagesTab = document.getElementById('view-images-tab');
  const mapContainer = document.getElementById('map-container');
  const listContainer = document.getElementById('map-list-container');
  const projectsContainer = document.querySelector('.projects-container');
  const imagesGrid = document.getElementById('images-grid');

  if (!mapTab || !listTab || !imagesTab || !mapContainer || !listContainer || !projectsContainer || !imagesGrid) return;

  // 显示地图视图
  function showMap() {
    mapTab.classList.add('active');
    listTab.classList.remove('active');
    imagesTab.classList.remove('active');
    projectsContainer.style.display = 'flex';
    mapContainer.style.display = 'block';
    listContainer.style.display = 'none';
    imagesGrid.style.display = 'none';
    document.body.classList.remove('images-mode');
  }

  // 显示列表视图（仅右侧区域切换，左侧预览保持不变）
  function showList() {
    mapTab.classList.remove('active');
    listTab.classList.add('active');
    imagesTab.classList.remove('active');
    projectsContainer.style.display = 'flex';
    mapContainer.style.display = 'none';
    listContainer.style.display = 'block';
    imagesGrid.style.display = 'none';
    document.body.classList.remove('images-mode');
  }

  // 显示 Images 视图：隐藏左右两个板块，只显示全宽网格
  function showImages() {
    mapTab.classList.remove('active');
    listTab.classList.remove('active');
    imagesTab.classList.add('active');
    projectsContainer.style.display = 'none';
    imagesGrid.style.display = 'grid';
    document.body.classList.add('images-mode');
  }

  mapTab.addEventListener('click', () => {
    showMap();
    if (window.location.hash.startsWith('#projects-section')) {
      window.location.hash = '#projects-section';
    }
  });
  listTab.addEventListener('click', () => {
    showList();
    if (window.location.hash.startsWith('#projects-section')) {
      window.location.hash = '#projects-section-list';
    }
  });
  imagesTab.addEventListener('click', () => {
    showImages();
    if (window.location.hash.startsWith('#projects-section')) {
      window.location.hash = '#projects-section-images';
    }
  });

  // 初始根据 hash 决定是地图、列表还是 Images 视图
  const hash = window.location.hash;
  const isReturningToProjects = hash === '#projects-section' || hash === '#projects-section-list' || hash === '#projects-section-images';
  
  function initializeView() {
    if (hash === '#projects-section-list') {
      showList();
    } else if (hash === '#projects-section-images') {
      showImages();
    } else if (hash === '#projects-section') {
      showMap();
    } else {
      // 正常进入首页，默认显示 Map
      showMap();
    }
  }
  
  if (isReturningToProjects) {
    // 带锚点返回时，等 load 后再执行视图切换并移除隐藏
    window.addEventListener('load', () => {
      initializeView();
      // 视图切换完成后立即显示页面
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('start-at-projects');
      });
    });
  } else {
    // 正常进入首页，直接初始化视图
    initializeView();
  }
})();

// ========== 项目分类筛选 ==========
(() => {
  const categoryBtn = document.getElementById('category-btn');
  const categoryDropdown = document.getElementById('category-dropdown');
  const categoryMenu = document.getElementById('category-menu');
  const categoryItems = document.querySelectorAll('.category-item');
  
  let currentCategory = 'all';
  
  if (!categoryBtn || !categoryDropdown || !categoryMenu) return;
  
  // 点击分类按钮展开/收起菜单
  categoryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    categoryDropdown.classList.toggle('open');
  });
  
  // 点击页面其他地方关闭菜单
  document.addEventListener('click', () => {
    categoryDropdown.classList.remove('open');
  });
  
  // 阻止菜单内部点击事件冒泡
  categoryMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // 分类项点击事件
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;
      
      // 更新选中状态
      categoryItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // 更新按钮文字
      categoryBtn.textContent = item.textContent;
      
      // 关闭菜单
      categoryDropdown.classList.remove('open');
      
      // 应用筛选
      currentCategory = category;
      filterProjects(category);
    });
  });
  
  // 筛选项目函数
  function filterProjects(category) {
    // 触发自定义事件，通知其他模块更新筛选
    const event = new CustomEvent('categoryChanged', { detail: { category } });
    document.dispatchEvent(event);
  }
  
  // 导出当前分类，供其他模块使用
  window.getCurrentCategory = () => currentCategory;
  window.getFilteredProjects = (projectsList, category) => {
    if (category === 'all') return projectsList;
    return projectsList.filter(p => p.categories && p.categories.includes(category));
  };
})();

