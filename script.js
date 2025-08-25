let recipes = [];
let uniqueTags = [];

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

function getPastelColor() {
  const r = Math.floor(Math.random() * 127 + 128);
  const g = Math.floor(Math.random() * 127 + 128);
  const b = Math.floor(Math.random() * 127 + 128);
  return `rgb(${r}, ${g}, ${b})`;
}

function createParticles() {
  const container = document.querySelector('.particles');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.width = `${Math.random() * 10 + 5}px`;
    particle.style.height = particle.style.width;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.background = Math.random() > 0.5 ? 'lightblue' : 'white';
    particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(particle);
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
          tagEl.style.background = getPastelColor();
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
      tagSpan.style.background = getPastelColor();
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
        <div class="tags">${r.tags.map(t => `<span class="tag" style="background:${getPastelColor()}">${t}</span>`).join('')}</div>
      `;
      box.addEventListener('click', () => window.location.href = `recipe.html?id=${r.id}`);
      fragment.appendChild(box);
    });
    return fragment;
  };
  carousel.appendChild(createBoxes());
  carousel.appendChild(createBoxes()); // Duplicate for infinite loop
}

function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const ingredientsStr = params.get('ingredients');
  if (!ingredientsStr) return;

  const userIngredients = ingredientsStr.split(',').map(t => t.trim().toLowerCase());
  document.getElementById('search-tags').innerHTML = userIngredients.map(t => `<span class="tag" style="background:${getPastelColor()}">${t}</span>`).join(' ');

  const resultsDiv = document.querySelector('.search-results');
  const matchingRecipes = recipes.filter(r => r.tags.every(tag => userIngredients.includes(tag.toLowerCase())));
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

  const tagsDiv = document.querySelector('.tags-horizontal');
  recipe.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.classList.add('tag');
    tag.style.background = getPastelColor();
    tag.textContent = t;
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
}