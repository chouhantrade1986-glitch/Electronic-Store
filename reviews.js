(function (root) {
  const api = {
    async list(productId, options = {}) {
      const query = new URLSearchParams();
      if (options.sort) query.set("sort", options.sort);
      if (options.stars) query.set("stars", options.stars);
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews?${query}`);
      if (!response.ok) throw new Error("Reviews could not be loaded");
      return response.json();
    },
    async submit(productId, review) {
      const auth = JSON.parse(localStorage.getItem("electromart_auth_v1") || "{}");
      const token = auth.token || auth.accessToken || "";
      if (!token) throw new Error("Sign in to submit a review.");
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: review.rating, headline: review.headline, text: review.text })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Review could not be submitted");
      return body;
    },
    async helpful(productId, reviewId) {
      const auth = JSON.parse(localStorage.getItem("electromart_auth_v1") || "{}");
      const token = auth.token || auth.accessToken || "";
      if (!token) throw new Error("Sign in to vote.");
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews/${encodeURIComponent(reviewId)}/helpful`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Vote could not be saved");
      return body;
    }
  };
  root.ElectroMart = root.ElectroMart || {};
  root.ElectroMart.Reviews = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
