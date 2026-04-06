function getStarRating(rating) {
  const starsTotal = 5;
  const starPercentage = (rating / starsTotal) * 100;
  const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;
  return `
    <div class="star-rating" title="${rating.toFixed(1)} out of ${starsTotal} stars">
      <div class="star-rating-top" style="width: ${starPercentageRounded};">
        <span>â˜…</span><span>â˜…</span><span>â˜…</span><span>â˜…</span><span>â˜…</span>
      </div>
      <div class="star-rating-bottom">
        <span>â˜†</span><span>â˜†</span><span>â˜†</span><span>â˜†</span><span>â˜†</span>
      </div>
    </div>
  `;
}