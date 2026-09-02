#!/usr/bin/env node

/**
 * ElectroMart Performance Testing Script
 * 
 * This script runs automated performance tests using Lighthouse
 * and generates detailed reports for all key pages.
 * 
 * Usage:
 *   npm install -g lighthouse
 *   node qa-performance-audit.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://127.0.0.1:5500',
  outputDir: './qa-reports/performance',
  pages: [
    { name: 'homepage', path: '/index.html' },
    { name: 'desktops', path: '/desktops.html' },
    { name: 'laptops', path: '/laptop.html' },
    { name: 'cart', path: '/cart.html' },
    { name: 'checkout', path: '/checkout.html' },
    { name: 'account', path: '/account.html' },
    { name: 'products', path: '/products.html' },
    { name: 'brands', path: '/brands.html' },
  ],
  thresholds: {
    performance: 80,
    accessibility: 90,
    bestPractices: 85,
    seo: 90,
  },
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

console.log('🚀 Starting ElectroMart Performance Audit...\n');
console.log(`📊 Testing ${CONFIG.pages.length} pages\n`);
console.log(`🎯 Performance Threshold: ${CONFIG.thresholds.performance}%`);
console.log(`♿ Accessibility Threshold: ${CONFIG.thresholds.accessibility}%\n`);
console.log('─'.repeat(60) + '\n');

const results = [];

// Test each page
CONFIG.pages.forEach((page, index) => {
  const url = `${CONFIG.baseUrl}${page.path}`;
  const outputFile = path.join(CONFIG.outputDir, `${page.name}-report.json`);
  
  console.log(`[${index + 1}/${CONFIG.pages.length}] Testing: ${page.name.toUpperCase()}`);
  console.log(`URL: ${url}`);
  
  try {
    // Run Lighthouse audit
    const command = `lighthouse "${url}" \
      --output=json \
      --output-path="${outputFile}" \
      --quiet \
      --chrome-flags="--headless"`;
    
    console.log('⏳ Running Lighthouse...');
    execSync(command, { stdio: 'pipe' });
    
    // Read and parse results
    const reportData = fs.readFileSync(outputFile, 'utf8');
    const report = JSON.parse(reportData);
    
    // Extract scores
    const categories = report.categories;
    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    };
    
    // Check thresholds
    const passed = {
      performance: scores.performance >= CONFIG.thresholds.performance,
      accessibility: scores.accessibility >= CONFIG.thresholds.accessibility,
      bestPractices: scores.bestPractices >= CONFIG.thresholds.bestPractices,
      seo: scores.seo >= CONFIG.thresholds.seo,
    };
    
    // Display results
    console.log('\n📈 Results:');
    console.log(`  Performance:     ${scores.performance}% ${passed.performance ? '✅' : '❌'}`);
    console.log(`  Accessibility:   ${scores.accessibility}% ${passed.accessibility ? '✅' : '❌'}`);
    console.log(`  Best Practices:  ${scores.bestPractices}% ${passed.bestPractices ? '✅' : '❌'}`);
    console.log(`  SEO:             ${scores.seo}% ${passed.seo ? '✅' : '❌'}`);
    
    // Core Web Vitals
    if (report.audits) {
      const fcp = report.audits['first-contentful-paint'];
      const lcp = report.audits['largest-contentful-paint'];
      const cls = report.audits['cumulative-layout-shift'];
      const tbt = report.audits['total-blocking-time'];
      
      if (fcp) console.log(`\n  Core Web Vitals:`);
      if (fcp) console.log(`    FCP: ${fcp.displayValue}`);
      if (lcp) console.log(`    LCP: ${lcp.displayValue}`);
      if (cls) console.log(`    CLS: ${cls.displayValue}`);
      if (tbt) console.log(`    TBT: ${tbt.displayValue}`);
    }
    
    // Save summary
    results.push({
      page: page.name,
      url: url,
      scores: scores,
      passed: passed,
      timestamp: new Date().toISOString(),
    });
    
    console.log('\n' + '─'.repeat(60) + '\n');
    
  } catch (error) {
    console.error(`❌ Error testing ${page.name}:`, error.message);
    console.log('─'.repeat(60) + '\n');
  }
});

// Generate summary report
const summaryReport = {
  timestamp: new Date().toISOString(),
  totalPages: CONFIG.pages.length,
  pagesTested: results.length,
  averageScores: {
    performance: Math.round(results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length),
    accessibility: Math.round(results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length),
    bestPractices: Math.round(results.reduce((sum, r) => sum + r.scores.bestPractices, 0) / results.length),
    seo: Math.round(results.reduce((sum, r) => sum + r.scores.seo, 0) / results.length),
  },
  results: results,
  thresholds: CONFIG.thresholds,
};

const summaryPath = path.join(CONFIG.outputDir, 'summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));

// Display final summary
console.log('\n' + '='.repeat(60));
console.log('📊 PERFORMANCE AUDIT SUMMARY');
console.log('='.repeat(60) + '\n');

console.log(`Pages Tested: ${results.length}/${CONFIG.pages.length}\n`);

console.log('Average Scores:');
console.log(`  Performance:     ${summaryReport.averageScores.performance}%`);
console.log(`  Accessibility:   ${summaryReport.averageScores.accessibility}%`);
console.log(`  Best Practices:  ${summaryReport.averageScores.bestPractices}%`);
console.log(`  SEO:             ${summaryReport.averageScores.seo}%\n`);

// Identify failing pages
const failingPages = results.filter(r => 
  !r.passed.performance || 
  !r.passed.accessibility || 
  !r.passed.bestPractices || 
  !r.passed.seo
);

if (failingPages.length > 0) {
  console.log('⚠️  Pages Below Threshold:');
  failingPages.forEach(page => {
    console.log(`  - ${page.page.toUpperCase()}`);
    if (!page.passed.performance) console.log(`    ❌ Performance: ${page.scores.performance}%`);
    if (!page.passed.accessibility) console.log(`    ❌ Accessibility: ${page.scores.accessibility}%`);
    if (!page.passed.bestPractices) console.log(`    ❌ Best Practices: ${page.scores.bestPractices}%`);
    if (!page.passed.seo) console.log(`    ❌ SEO: ${page.scores.seo}%`);
  });
  console.log();
} else {
  console.log('✅ All pages meet performance thresholds!\n');
}

console.log(`📁 Detailed reports saved to: ${CONFIG.outputDir}/`);
console.log(`📄 Summary report: ${summaryPath}\n`);

console.log('💡 Recommendations:');
console.log('  1. Review failing pages and optimize images');
console.log('  2. Minify CSS/JS files');
console.log('  3. Enable compression on server');
console.log('  4. Implement CDN for static assets');
console.log('  5. Add lazy loading for below-fold content\n');

console.log('='.repeat(60));
console.log('✅ Audit Complete!');
console.log('='.repeat(60) + '\n');

// Exit with error code if any page failed
const hasFailures = failingPages.length > 0;
process.exit(hasFailures ? 1 : 0);
