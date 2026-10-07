const fs = require('fs');
const path = require('path');

const target = path.join('C:', 'Users', 'Admin', 'Documents', 'GitHub', 'Electronic-Store', 'script.js');
let raw = fs.readFileSync(target, 'utf8');
const isCrlf = raw.includes('\r\n');
let code = raw.replace(/\r\n/g, '\n');

const heroRegex = /function buildHeroSlides\(sourceProducts\) \{[\s\S]*?return slides\.slice\(0, 3\);\n\}/;

const replacement = `function buildHeroSlides(sourceProducts) {
  const activeLang = (localStorage.getItem("electromart_lang_v1") || localStorage.getItem("electromart_lang") || "en").toLowerCase();
  const heroT = (window.EM_TRANSLATIONS && window.EM_TRANSLATIONS[activeLang]) ? window.EM_TRANSLATIONS[activeLang] : {};
  const slides = [];
  const creatorItems = getHomeCollectionProducts(sourceProducts, "creator-studio");
  if (creatorItems.length) {
    const featuredCreator = creatorItems[0];
    slides.push({
      id: "creator-studio-launch",
      eyebrow: heroT.just_launched || "Just launched",
      title: heroT.hero_creator_title || "Creator Studio setups built for editing, streaming, and sharper desks",
      description: \`\${creatorItems.length} \${heroT.live_now || "live now"}. \${featuredCreator?.name || "Creator Studio"}\`,
      pills: ["Creator Studio", \`\${heroT.starting_at || "From"} \${money(getStartingPrice(creatorItems))}\`, \`\${getHomeRatingBadge(creatorItems)} \${heroT.top_rating || "top rated"}\`],
      stats: [
        { label: heroT.live_now || "Live picks", value: \`\${creatorItems.length}\` },
        { label: heroT.starting_at || "Starting at", value: money(getStartingPrice(creatorItems)) },
        { label: heroT.top_rating || "Top rating", value: getHomeRatingBadge(creatorItems) }
      ],
      actions: [
        { href: "creator-studio.html", label: heroT.explore_creator_studio || "Explore Creator Studio", secondary: false },
        { href: featuredCreator ? \`product-detail.html?id=\${encodeURIComponent(featuredCreator.id)}\` : "products.html?search=creator", label: heroT.view_featured_pick || "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop("creator-studio", featuredCreator)
    });
  }

  const categories = new Map();
  sourceProducts.forEach((item) => {
    if (item.segment === "b2b") {
      return;
    }
    const category = normalizeHomeCategory(item.category);
    if (!category) {
      return;
    }
    const bucket = categories.get(category) || [];
    bucket.push(item);
    categories.set(category, bucket);
  });

  const ranked = Array.from(categories.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, creatorItems.length ? 2 : 3);

  if (!ranked.length && !slides.length) {
    return [];
  }

  ranked.forEach(([category, items], index) => {
    const featured = items
      .slice()
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))[0];
    const label = getReadableCategoryLabel(category);
    slides.push({
      id: \`\${category}-\${index}\`,
      eyebrow: index === 0 && !creatorItems.length ? (heroT.todays_headline_offer || "Today’s headline offer") : (heroT.trending_right_now || "Trending right now"),
      title: \`\${label} \${heroT.deals_fast_checkout || "deals built for fast checkout"}\`,
      description: \`\${items.length} \${heroT.live_now || "live now"}. \${featured?.name || label}\`,
      pills: [label, featured?.brand || "ElectroMart", \`\${heroT.starting_at || "From"} \${money(getStartingPrice(items))}\`],
      stats: [
        { label: heroT.live_now || "Live now", value: \`\${items.length}\` },
        { label: heroT.starting_at || "Starting at", value: money(getStartingPrice(items)) },
        { label: heroT.top_rating || "Top rating", value: getHomeRatingBadge(items) }
      ],
      actions: [
        { href: getCategoryLandingLink(category), label: \`\${label} \${heroT.shop_now_prefix || "Shop"}\`, secondary: false },
        { href: featured ? \`product-detail.html?id=\${encodeURIComponent(featured.id)}\` : "products.html", label: heroT.view_featured_pick || "View featured pick", secondary: true }
      ],
      backgroundImage: getHeroBackdrop(category, featured)
    });
  });
  return slides.slice(0, 3);
}`;

if (heroRegex.test(code)) {
  code = code.replace(heroRegex, replacement);
  if (isCrlf) code = code.replace(/\n/g, '\r\n');
  fs.writeFileSync(target, code, 'utf8');
  console.log('Successfully replaced buildHeroSlides in script.js');
} else {
  console.error('heroRegex did not match');
}
