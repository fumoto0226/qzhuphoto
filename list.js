// 列表页：11 个作品，年份 + 项目 + 位置

const listProjects = [
  {
    id: 0,
    year: 2025,
    title: "Xi'an CCBD",
    location: "Xi'an",
    image: "./img/home/1/01.webp",
  },
  {
    id: 1,
    year: 2024,
    title: "Shanghai Tower",
    location: "Shanghai",
    image: "./img/home/1/02.webp",
  },
  {
    id: 2,
    year: 2024,
    title: "Beijing Daxing Airport",
    location: "Beijing",
    image: "./img/home/1/03.webp",
  },
  {
    id: 3,
    year: 2023,
    title: "Guangzhou Opera House",
    location: "Guangzhou",
    image: "./img/home/1/04.webp",
  },
  {
    id: 4,
    year: 2023,
    title: "Shenzhen Bay",
    location: "Shenzhen",
    image: "./img/home/1/05.webp",
  },
  {
    id: 5,
    year: 2023,
    title: "Chengdu IFS",
    location: "Chengdu",
    image: "./img/home/1/06.webp",
  },
  {
    id: 6,
    year: 2022,
    title: "Hangzhou Olympic Center",
    location: "Hangzhou",
    image: "./img/home/1/07.webp",
  },
  {
    id: 7,
    year: 2022,
    title: "Nanjing Zifeng Tower",
    location: "Nanjing",
    image: "./img/home/1/08.webp",
  },
  {
    id: 8,
    year: 2022,
    title: "Wuhan Greenland Center",
    location: "Wuhan",
    image: "./img/home/1/09.webp",
  },
  {
    id: 9,
    year: 2022,
    title: "Chongqing Raffles City",
    location: "Chongqing",
    image: "./img/home/1/10.webp",
  },
  {
    id: 10,
    year: 2022,
    title: "Suzhou Museum",
    location: "Suzhou",
    image: "./img/home/1/11.webp",
  },
  {
    id: 11,
    year: 2023,
    title: "Onoma Hotel",
    location: "Hong Kong",
    image: "./img/home/1/01.webp",
  },
  {
    id: 12,
    year: 2023,
    title: "Taipei Modern Residence",
    location: "Taipei",
    image: "./img/home/1/02.webp",
  },
  {
    id: 13,
    year: 2023,
    title: "Macau Waterfront",
    location: "Macau",
    image: "./img/home/1/03.webp",
  },
  {
    id: 14,
    year: 2023,
    title: "Sanya Coastal Resort",
    location: "Sanya",
    image: "./img/home/1/04.webp",
  },
  {
    id: 15,
    year: 2021,
    title: "Seoul Riverside Gallery",
    location: "Seoul",
    image: "./img/home/1/05.webp",
  },
  {
    id: 16,
    year: 2020,
    title: "Singapore Harbour Lounge",
    location: "Singapore",
    image: "./img/home/1/04.webp",
  },
];

let sortAsc = false; // 默认按年份从新到旧（降序）

const tbody = document.getElementById("project-list-body");
const mainImage = document.getElementById("list-main-image");
const yearHeader = document.getElementById("year-header");
const yearArrow = document.getElementById("year-arrow");
const toMapButton = document.getElementById("list-to-map");

function renderRows() {
  const sorted = [...listProjects].sort((a, b) =>
    sortAsc ? a.year - b.year : b.year - a.year
  );

  tbody.innerHTML = "";

  sorted.forEach((project, index) => {
    const tr = document.createElement("tr");
    tr.className = "project-row";
    tr.dataset.projectId = project.id.toString();

    tr.innerHTML = `
      <td class="col-year">${project.year}</td>
      <td class="col-title">${project.title}</td>
      <td class="col-location">${project.location}</td>
    `;

    // 悬浮切换左侧大图
    tr.addEventListener("mouseenter", () => {
      if (mainImage.dataset.currentId === String(project.id)) return;
      const img = new Image();
      img.onload = () => {
        mainImage.src = project.image;
        mainImage.dataset.currentId = String(project.id);
      };
      img.src = project.image;
    });

    // 点击进入作品页面
    tr.addEventListener("click", () => {
      window.location.href = "project.html?from=fullList";
    });

    tbody.appendChild(tr);
  });
}

// 点击年份表头：切换排序方向和箭头
yearHeader.addEventListener("click", () => {
  sortAsc = !sortAsc;
  yearArrow.textContent = sortAsc ? "▲" : "▼";
  renderRows();
});

// 顶部 Map 按钮：返回到首页下方 map 区域
if (toMapButton) {
  toMapButton.addEventListener("click", () => {
    window.location.href = "index.html#projects-section";
  });
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 默认按年份降序排列并渲染
  renderRows();

  // 默认显示最新一条的图片
  const latest = [...listProjects].sort((a, b) => b.year - a.year)[0];
  if (latest) {
    mainImage.src = latest.image;
    mainImage.dataset.currentId = String(latest.id);
  }

  // 首页里“List”按钮跳转到本页
  const listTabOnIndex = document.getElementById("view-list-tab");
  if (listTabOnIndex) {
    listTabOnIndex.addEventListener("click", () => {
      window.location.href = "list.html";
    });
  }
});


