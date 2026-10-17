"use strict";

(function () {
  const logic = globalThis.QuoteLogic;
  if (!logic) {
    console.error("QuoteLogic module failed to load.");
    return;
  }

  const {
    QUOTES,
    pickRandomQuote,
    isFavorite,
    toggleFavorite,
    getFavoriteQuotes,
    loadFavorites,
    saveFavorites,
  } = logic;

  let currentQuote = null;
  let favoriteIds = [];

  function getStorage() {
    try {
      return window.localStorage;
    } catch (_err) {
      return null;
    }
  }

  function renderCurrentQuote(elements) {
    if (!currentQuote) {
      return;
    }
    elements.quoteText.textContent = currentQuote.text;
    elements.quoteAuthor.textContent = currentQuote.author;
    renderFavoriteButtonState(elements);
  }

  function renderFavoriteButtonState(elements) {
    if (!currentQuote) {
      return;
    }
    const favorited = isFavorite(favoriteIds, currentQuote.id);
    elements.favoriteBtn.setAttribute("aria-pressed", favorited ? "true" : "false");
    elements.favoriteBtn.textContent = favorited ? "♥ Favorited" : "♡ Favorite";
  }

  function renderFavoritesList(elements) {
    const favoriteQuotes = getFavoriteQuotes(QUOTES, favoriteIds);
    elements.favoritesCount.textContent = String(favoriteQuotes.length);
    elements.favoritesEmpty.hidden = favoriteQuotes.length > 0;
    elements.favoritesList.innerHTML = "";

    for (const quote of favoriteQuotes) {
      const li = document.createElement("li");
      li.className = "favorite-item";

      const contentDiv = document.createElement("div");
      contentDiv.className = "favorite-item-content";

      const textP = document.createElement("p");
      textP.className = "favorite-item-text";
      textP.textContent = `“${quote.text}”`;

      const authorSpan = document.createElement("span");
      authorSpan.className = "favorite-item-author";
      authorSpan.textContent = `— ${quote.author}`;

      contentDiv.appendChild(textP);
      contentDiv.appendChild(authorSpan);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-favorite-btn";
      removeBtn.dataset.quoteId = quote.id;
      removeBtn.setAttribute("aria-label", `Remove quote by ${quote.author} from favorites`);
      removeBtn.textContent = "Remove";

      li.appendChild(contentDiv);
      li.appendChild(removeBtn);
      elements.favoritesList.appendChild(li);
    }
  }

  function initApp() {
    const elements = {
      quoteText: document.getElementById("quote-text"),
      quoteAuthor: document.getElementById("quote-author"),
      newQuoteBtn: document.getElementById("new-quote-btn"),
      favoriteBtn: document.getElementById("favorite-btn"),
      favoritesCount: document.getElementById("favorites-count"),
      favoritesEmpty: document.getElementById("favorites-empty"),
      favoritesList: document.getElementById("favorites-list"),
    };

    if (!elements.quoteText || !elements.newQuoteBtn || !elements.favoriteBtn) {
      return;
    }

    const storage = getStorage();
    favoriteIds = loadFavorites(storage, QUOTES);
    currentQuote = pickRandomQuote(QUOTES, null);

    renderCurrentQuote(elements);
    renderFavoritesList(elements);

    elements.newQuoteBtn.addEventListener("click", () => {
      const currentId = currentQuote ? currentQuote.id : null;
      currentQuote = pickRandomQuote(QUOTES, currentId);
      renderCurrentQuote(elements);
    });

    elements.favoriteBtn.addEventListener("click", () => {
      if (!currentQuote) {
        return;
      }
      favoriteIds = toggleFavorite(favoriteIds, currentQuote.id);
      saveFavorites(getStorage(), favoriteIds);
      renderFavoriteButtonState(elements);
      renderFavoritesList(elements);
    });

    elements.favoritesList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const btn = target.closest(".remove-favorite-btn");
      if (!btn) {
        return;
      }
      const quoteId = btn.dataset.quoteId;
      if (!quoteId) {
        return;
      }
      favoriteIds = toggleFavorite(favoriteIds, quoteId);
      saveFavorites(getStorage(), favoriteIds);
      renderFavoriteButtonState(elements);
      renderFavoritesList(elements);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})();
