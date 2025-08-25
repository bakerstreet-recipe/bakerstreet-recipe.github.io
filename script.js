let recipes = [];
let uniqueTags = [];
const colorPalette = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFB3', '#BAE1FF', '#D4A5A5', '#FFD3B6', '#FFAAA5', '#C7CEEA', '#B5EAD7'];

fetch('recipes.json')
  .then(res => res.json())
  .then(data => {
    recipes = data.recipes;
    uniqueTags = [...new Set(recipes.flatMap(r => r.tags))].sort();
    initPage();
  });

function initPage() {
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path === '/' || path === '') {
    initHome();
  } else if (path.endsWith('search.html')) {
    initSearch();
  } else if (path.endsWith('recipe.html')) {
    initRecipe();
  }
}

function getConsistentColor(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
}

function createParticles() {
  const container = document.querySelector('.particles');
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    container.appendChild(particle);
    
    // Animate particle
    const duration = Math.random() * 5 + 5; // 5-10s
    const move = () => {
      const x = Math.random() * 100 - 50; // -50 to 50px
      const y = Math.random() * 100 - 50; // -50 to 50px
      particle.animate([
        { transform: 'translate(0, 0)', opacity: 0.7 },
        { transform: `translate(${x}px, ${y}px)`, opacity: 0.3 },
        { transform: 'translate(0, 0)', opacity: 0.7 }
      ], {
        duration: duration * 1000,
        easing: 'ease-in-out',
        iterations: Infinity
      });
    };
    move();
  }
}

function initHome() {
  createParticles();

  const tagContainer = document.querySelector('.tags-container');
  const input = document.querySelector('.input');
  const popup = document.querySelector('.tag-popup');
  let selectedTags = [];

  input.addEventListener('input', (e) => {
    const value = e.target.value.trim().toLowerCase();
    if (value.length > 0) {
      const matching = uniqueTags.filter(t => t.toLowerCase().includes(value) && !selectedTags.includes(t));
      if (matching.length > 0) {
        popup.innerHTML = '';
        matching.forEach(t => {
          const tagEl = document.createElement('div');
          tagEl.classList.add('tag');
          tagEl.style.background = getConsistentColor(t);
          tagEl.textContent = t;
          tagEl.addEventListener('click', () => {
            addTag(t);
            input.value = '';
            popup.style.display = 'none';
          });
          popup.appendChild(tagEl);
        });
        popup.style.display = 'block';
      } else {
        popup.style.display = 'none';
      }
    } else {
      popup.style.display = 'none';
    }
  });

  function addTag(tag) {
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
      const tagSpan = document.createElement('span');
      tagSpan.classList.add('tag');
      tagSpan.style.background = getConsistentColor(tag);
      tagSpan.innerHTML = `${tag}<span> x</span>`;
      tagSpan.querySelector('span').addEventListener('click', () => {
        tagSpan.remove();
        selectedTags = selectedTags.filter(s => s !== tag);
      });
      tagContainer.appendChild(tagSpan);
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && selectedTags.length > 0) {
      window.location.href = `search.html?ingredients=${selectedTags.join(',')}`;
    }
  });

  const carousel = document.querySelector('.carousel');
  const randomRecipes = [...recipes].sort(() => 0.5 - Math.random()).slice(0, 5);
  const createBoxes = () => {
    const fragment = document.createDocumentFragment();
    randomRecipes.forEach(r => {
      const box = document.createElement('div');
      box.classList.add('recipe-box');
      box.innerHTML = `
        <img src="${r.image}" alt="${r.name}">
        <h3>${r.name}</h3>
        <div class="tags">${r.tags.map(t => `<span class="tag" style="background:${getConsistentColor(t)}">${t}</span>`).join('')}</div>
      `;
      box.addEventListener('click', () => window.location.href = `recipe.html?id=${r.id}`);
      fragment.appendChild(box);
    });
    return fragment;
  };
  carousel.appendChild(createBoxes());
  carousel.appendChild(createBoxes());
}

function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const ingredientsStr = params.get('ingredients');
  if (!ingredientsStr) return;

  const userIngredients = ingredientsStr.split(',').map(t => t.trim().toLowerCase());
  document.getElementById('search-tags').innerHTML = userIngredients.map(t => `<span class="tag" style="background:${getConsistentColor(t)}">${t}</span>`).join(' ');

  const resultsDiv = document.querySelector('.search-results');
  const matchingRecipes = recipes.filter(r => userIngredients.every(ui => r.tags.map(t => t.toLowerCase()).includes(ui)));
  if (matchingRecipes.length === 0) {
    resultsDiv.innerHTML = '<div class="no-results">No Results Found</div>';
  } else {
    matchingRecipes.forEach(r => {
      const box = document.createElement('div');
      box.classList.add('result-box');
      box.innerHTML = `<h3>${r.name}</h3><p>Ingredients: ${r.tags.join(', ')}</p>`;
      box.addEventListener('click', () => window.location.href = `recipe.html?id=${r.id}`);
      resultsDiv.appendChild(box);
    });
  }
}

function initRecipe() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  document.querySelector('.recipe-image').src = recipe.image;
  document.querySelector('.recipe-name').textContent = recipe.name;

  document.querySelector('.prep-time').textContent = recipe.prepTime;
  document.querySelector('.cook-time').textContent = recipe.cookTime;
  document.querySelector('.servings').textContent = recipe.servings;
  document.querySelector('.difficulty').textContent = recipe.difficulty;

  const tagsDiv = document.querySelector('.tags-horizontal');
  recipe.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.classList.add('tag');
    tag.style.background = getConsistentColor(t);
    tag.textContent = t;
    tag.addEventListener('click', () => {
      window.location.href = `search.html?ingredients=${t}`;
    });
    tagsDiv.appendChild(tag);
  });

  const ingList = document.querySelector('.ingredient-list');
  recipe.ingredients.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    ingList.appendChild(li);
  });

  const stepsList = document.querySelector('.steps-list');
  recipe.steps.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    stepsList.appendChild(li);
  });

  const related = recipes.filter(r => r.id !== id && r.tags.some(t => recipe.tags.includes(t))).slice(0, 3);
  const relatedCarousel = document.querySelector('.related-carousel');
  related.forEach(rel => {
    const box = document.createElement('div');
    box.classList.add('related-box');
    box.innerHTML = `
      <img src="${rel.image}" alt="${rel.name}">
      <h3>${rel.name}</h3>
    `;
    box.addEventListener('click', () => window.location.href = `recipe.html?id=${rel.id}`);
    relatedCarousel.appendChild(box);
  });

  document.querySelector('.back-button').addEventListener('click', () => history.back());
}
