const REVIEW_STORAGE_KEY = "electromart_reviews_v1";

const reviewForm = document.getElementById("reviewForm");
const reviewProduct = document.getElementById("reviewProduct");
const reviewRating = document.getElementById("reviewRating");
const reviewText = document.getElementById("reviewText");
const reviewList = document.getElementById("reviewList");

function loadReviews() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveReviews(list) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    return;
  }
}

function renderReviews() {
  const reviews = loadReviews();
  if (reviews.length === 0) {
    reviewList.innerHTML = "<p>No reviews yet. Be the first to add one.</p>";
    return;
  }

  reviewList.innerHTML = reviews
    .map((item) => {
      return `
        <article>
          <h3>${item.product}</h3>
          <p><strong>Rating:</strong> ${item.rating}/5</p>
          <p>${item.text}</p>
        </article>
      `;
    })
    .join("");
}

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const product = reviewProduct.value.trim();
  const rating = Number(reviewRating.value);
  const text = reviewText.value.trim();

  if (!product || !rating || !text) {
    return;
  }

  const reviews = loadReviews();
  reviews.unshift({ product, rating, text });
  saveReviews(reviews);

  reviewForm.reset();
  renderReviews();
});

renderReviews();
