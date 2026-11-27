(function (root) {
  function getToken() {
    if (root.ElectroMartAuth && root.ElectroMartAuth.getToken) return root.ElectroMartAuth.getToken();
    try {
      const auth = JSON.parse(localStorage.getItem("electromart_auth_v1") || "{}");
      const token = auth.token || auth.accessToken || auth.credentials?.token || "";
      return String(token).startsWith("em_token_") ? "" : token;
    } catch (_) { return ""; }
  }
  async function request(path, options = {}) {
    const token = getToken();
    const response = await fetch(path, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "The request could not be completed.");
    return body;
  }
  const api = {
    async list(productId, options = {}) {
      const query = new URLSearchParams();
      if (options.sort) query.set("sort", options.sort);
      if (options.stars) query.set("stars", options.stars);
      return request(`/api/products/${encodeURIComponent(productId)}/reviews?${query}`);
    },
    async submit(productId, review) {
      const token = getToken();
      if (!token) throw new Error("Sign in to submit a review.");
      return request(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: review.rating, headline: review.headline, text: review.text })
      });
    },
    async helpful(productId, reviewId) {
      const token = getToken();
      if (!token) throw new Error("Sign in to vote.");
      return request(`/api/products/${encodeURIComponent(productId)}/reviews/${encodeURIComponent(reviewId)}/helpful`, { method: "POST" });
    },
    questions(productId, options = {}) {
      const query = new URLSearchParams();
      if (options.q) query.set("q", options.q);
      return request(`/api/products/${encodeURIComponent(productId)}/questions?${query}`);
    },
    submitQuestion(productId, question) {
      return request(`/api/products/${encodeURIComponent(productId)}/questions`, { method: "POST", body: JSON.stringify({ question }) });
    },
    submitAnswer(productId, questionId, answer) {
      return request(`/api/products/${encodeURIComponent(productId)}/questions/${encodeURIComponent(questionId)}/answers`, { method: "POST", body: JSON.stringify({ answer }) });
    },
    questionHelpful(productId, questionId, helpful = true) {
      return request(`/api/products/${encodeURIComponent(productId)}/questions/${encodeURIComponent(questionId)}/helpful`, { method: "POST", body: JSON.stringify({ helpful }) });
    }
  };
  root.ElectroMart = root.ElectroMart || {};
  root.ElectroMart.Reviews = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
