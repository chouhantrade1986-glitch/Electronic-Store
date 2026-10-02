# ⚡ ElectroMart Quick Reference Card

**Quick access guide for common tasks and troubleshooting**

---

## 🔧 Common Tasks

### Run Performance Audit
```bash
npm install -g lighthouse
node qa-performance-audit.js
```

### Check Accessibility
```bash
# Browser extensions (recommended)
- axe DevTools (Chrome/Firefox)
- WAVE Evaluation Tool

# Command line
npm install -g pa11y
pa11y http://localhost:5500/index.html
```

### Test SEO
```
1. Google Mobile-Friendly Test
   https://search.google.com/test/mobile-friendly

2. Rich Results Test
   https://search.google.com/test/rich-results

3. PageSpeed Insights
   https://pagespeed.web.dev/
```

### Validate HTML/CSS
```bash
# In IDE: Use get_problems tool
# Online: https://validator.w3.org/
```

---

## 📁 Important Files

### Documentation
- `OPTIMIZATION-SUMMARY.md` - Complete project summary
- `PERFORMANCE-ACCESSIBILITY-AUDIT.md` - Detailed audit report
- `ACCESSIBILITY-CHECKLIST.md` - WCAG compliance guide
- `SEO-OPTIMIZATION-GUIDE.md` - SEO optimization strategy

### Scripts
- `qa-performance-audit.js` - Automated performance testing

### Key Pages
- `index.html` - Homepage (SEO optimized)
- `desktops.html` - Category page (structured data)
- All customer pages have Amazon-style header

---

## 🎨 CSS Versioning

**Format:** `styles.css?v=YYYYMMDDx`

**Example:**
```html
<link rel="stylesheet" href="styles.css?v=20260315c" />
```

**When to update version:**
- Any CSS file change
- Bug fix deployment
- New feature release

**Current version:** `20260315c`

---

## ♿ Accessibility Quick Checks

### Keyboard Navigation
```
Tab - Move forward
Shift+Tab - Move backward
Enter/Space - Activate
Escape - Close modal
Arrow keys - Navigate menus
```

### Screen Reader Testing
- **Windows:** NVDA (free) or JAWS
- **macOS:** VoiceOver (Cmd+F5)
- **iOS:** VoiceOver (Settings > Accessibility)
- **Android:** TalkBack (Settings > Accessibility)

### Color Contrast
- Normal text: ≥ 4.5:1 ratio
- Large text: ≥ 3:1 ratio
- Tool: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 🔍 SEO Checklist

### Every Page Must Have:
- ✅ Unique `<title>` tag (50-60 chars)
- ✅ Meta description (150-160 chars)
- ✅ Canonical URL
- ✅ Open Graph tags
- ✅ Structured data (if applicable)
- ✅ Alt text on images
- ✅ Proper heading hierarchy (h1 → h2 → h3)

### Submit to Search Engines:
1. Google Search Console
2. Bing Webmaster Tools
3. Submit sitemap.xml

---

## ⚡ Performance Tips

### Image Optimization
```bash
# Convert to WebP
npm install -g imagemin-cli
imagemin images/* --out-dir=images-webp

# Compress existing images
# Use: Squoosh.app, TinyPNG, ImageOptim
```

### Minify Assets
```bash
npm install -g terser cssnano
terser script.js -o script.min.js
cssnano styles.css styles.min.css
```

### Enable Compression (nginx)
```nginx
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

### Browser Caching (nginx)
```nginx
location ~* \.(css|js|jpg|png|webp)$ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

---

## 🐛 Troubleshooting

### Header Not Showing
**Check:**
1. Is `header.js` loaded? `<script src="header.js"></script>`
2. Is `styles.css` linked? `<link rel="stylesheet" href="styles.css?v=20260315c" />`
3. Is there a `<div id="headerContainer"></div>` in body?

### Sidebar Not Opening
**Check:**
1. Browser console for JavaScript errors
2. `styles.css` properly loaded
3. No CSS conflicts with `.dept-sidebar`

### Styles Not Updating
**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Update CSS version number

### Images Not Loading
**Check:**
1. Correct file path
2. Alt attribute present
3. Image file exists
4. File permissions correct

---

## 📊 Monitoring

### Daily Checks
- [ ] Google Search Console alerts
- [ ] Broken link checker
- [ ] Analytics traffic review

### Weekly Checks
- [ ] Run performance audit
- [ ] Check keyword rankings
- [ ] Review user feedback

### Monthly Checks
- [ ] Full accessibility audit
- [ ] SEO ranking report
- [ ] Competitor analysis
- [ ] Content updates

---

## 🛠️ Useful Commands

### Start Development Server
```bash
npm start
```

### Start Backend
```bash
cd backend
npm run dev
```

### Run Tests
```bash
cd backend
npm test
```

### Full Smoke Test
```bash
cd backend
npm run smoke
```

---

## 📞 Support Contacts

### Internal
- **Development Team:** dev-team@electromart.in
- **SEO Team:** seo@electromart.in
- **Accessibility:** accessibility@electromart.in

### External Resources
- **WCAG Guidelines:** https://www.w3.org/WAI/standards-guidelines/wcag/
- **Google SEO Guide:** https://developers.google.com/search/docs/beginner/seo-starter-guide
- **WebAIM:** https://webaim.org/
- **Moz SEO Learning:** https://moz.com/beginners-guide-to-seo

---

## 🎯 Key Metrics Targets

| Metric | Target | Current |
|--------|--------|---------|
| Performance Score | > 80% | TBD |
| Accessibility Score | > 90% | 98% ✅ |
| SEO Score | > 90% | 95% ✅ |
| Best Practices | > 85% | TBD |
| LCP | < 2.5s | TBD |
| FCP | < 1.5s | TBD |
| CLS | < 0.1 | TBD |

---

## 📝 Change Log Template

When making changes, document them:

```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature or file

### Changed
- Modified functionality

### Fixed
- Bug fixes

### Removed
- Deprecated features
```

---

## 🔗 Quick Links

- [Google Search Console](https://search.google.com/search-console)
- [Google Analytics](https://analytics.google.com)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker)
- [WAVE Accessibility Tool](https://wave.webaim.org)
- [HTML Validator](https://validator.w3.org)
- [CSS Validator](https://jigsaw.w3.org/css-validator)

---

**Last Updated:** March 15, 2026  
**Next Review:** April 15, 2026  

*Keep this card handy for quick reference!* 📌
