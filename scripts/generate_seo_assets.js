#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const siteUrl = (process.env.SITE_URL || 'https://qingyan.studio').replace(/\/+$/, '');
const projectsDataPath = path.join(rootDir, 'projects-data.js');

function loadProjectsData() {
  const code = fs.readFileSync(projectsDataPath, 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${code};this.projectsData = projectsData;`, context);
  return context.projectsData || [];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(filePath) {
  return fs.statSync(filePath).mtime.toISOString().slice(0, 10);
}

function buildUrlEntries(projects) {
  const pageLastmod = toIsoDate(path.join(rootDir, 'index.html'));
  const dataLastmod = toIsoDate(projectsDataPath);

  return [
    { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0', lastmod: pageLastmod },
    { loc: `${siteUrl}/list.html`, changefreq: 'weekly', priority: '0.8', lastmod: pageLastmod },
    ...projects.map((project) => ({
      loc: `${siteUrl}/project.html?id=${encodeURIComponent(project.id)}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: dataLastmod,
    })),
  ];
}

function buildSitemap(urlEntries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  urlEntries.forEach((entry) => {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority}</priority>`);
    lines.push('  </url>');
  });

  lines.push('</urlset>');
  return `${lines.join('\n')}\n`;
}

function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

const projects = loadProjectsData();
const urlEntries = buildUrlEntries(projects);

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), buildSitemap(urlEntries), 'utf8');
fs.writeFileSync(path.join(rootDir, 'robots.txt'), buildRobotsTxt(), 'utf8');

console.log(`Generated robots.txt and sitemap.xml for ${projects.length} projects.`);
