let offset = 0;
const limit = 20;
let allPokemon = []
async function loadPokemons() {
  console.time("Ladezeit");
  const btn = document.getElementById("loadMoreBtn");
  btn.disabled = true;
  showSpinner();
  const container = document.getElementById("pokemon-container");

  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
  const data = await (await fetch(url)).json();

  const detailsList = await Promise.all(
    data.results.map(item => fetch(item.url).then(res => res.json()))
  );

  for (const details  of detailsList) {
    allPokemon.push(details);
    const typeIcons = details.types
      .map(t => `<div class="type-icon ${t.type.name}"></div>`)
      .join("");
    container.innerHTML += pokemonCardTemplate(details, typeIcons);
  }

    offset += limit;
    setTimeout(() => {
    hideSpinner();
    btn.disabled = false;
    console.timeEnd("Ladezeit"); 
    console.log("Offset:", offset, "AllPokemon length:", allPokemon.length);
  }, 1000);
}

function openDialog(details) {
  currentIndex = allPokemon.findIndex(p => p.name === details.name);
  const typeIcons = details.types.map(t => `<div class="type-icon ${t.type.name}"></div>`).join("");
  const stats = details.stats.map(s => `<li class="stat-item"><span class="stat-name">${s.stat.name}</span>
    <div class="stat-bar"><div class="stat-fill" style="width:${Math.min(s.base_stat, 100)}%"></div></div></li>`).join("");

  document.getElementById("dialog-content").innerHTML = dialogTemplate(details, typeIcons, stats);
  document.getElementById("pokemon-dialog").showModal();
  loadEvolutionChain(details);
}


function showTab(tabName, button) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.style.display = "none";
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) activeTab.style.display = "block";
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  button.classList.add("active");
}

function setupDialogClose() {
  const dialog = document.getElementById("pokemon-dialog");
  const content = document.getElementById("dialog-content");

  dialog.addEventListener("click", e => {
    if (!content.contains(e.target) && !e.target.closest('.change-button')) {
      dialog.close();
    }
  });
}

async function fetchEvolutionChain(details) {
  const speciesData = await (await fetch(details.species.url)).json();
  const evoData = await (await fetch(speciesData.evolution_chain.url)).json();

  const evoChain = [];
  let evo = evoData.chain;
  while (evo) {
    evoChain.push(evo.species.name);
    evo = evo.evolves_to[0];
  }
  return evoChain;
}

const evolutionCache = {};

async function loadEvolutionChain(details) {
  try {
    if (evolutionCache[details.name]) {
      document.getElementById("evo-chain").innerHTML = evolutionCache[details.name];
      return;
    }

    const evoChain = await fetchEvolutionChain(details);
    const evoContainer = document.getElementById("evo-chain");
    evoContainer.innerHTML = "";

    for (let i = 0; i < evoChain.length; i++) {
      const name = evoChain[i];
      const data = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)).json();
      const image = data.sprites.other["official-artwork"].front_default;
      evoContainer.innerHTML += evoTemplate(name, image, i === evoChain.length - 1);
    }

    evolutionCache[details.name] = evoContainer.innerHTML;

  } catch (error) {
    console.error("Fehler beim Laden der Evolution Chain:", error);
    document.getElementById("evo-chain").textContent = "Unavailable";
  }
}

function init() {
  loadPokemons();
  setupDialogClose()
}
 
async function searchPokemon() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const container = document.getElementById("pokemon-container");

 let list;
  if (query.length < 3) {
    list = allPokemon;
    filteredPokemon = null;
  } else {
    list = allPokemon.filter(p => p.name.includes(query));
    filteredPokemon = list;
  }

  let html = "";
  list.forEach(details => {
    const typeIcons = details.types
      .map(t => `<div class="type-icon ${t.type.name}"></div>`)
      .join("");
    html += pokemonCardTemplate(details, typeIcons);
  });

  container.innerHTML = html;
}

function showSpinner() {
  document.getElementById("spinner").style.display = "block";
  document.getElementById("pokemon-container").classList.add("hidden");
}

function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("pokemon-container").classList.remove("hidden");
}

async function changePoke(direction) {
  const list = filteredPokemon || allPokemon;
  currentIndex += direction;

  if (currentIndex < 0) currentIndex = list.length - 1;
  if (currentIndex >= list.length) currentIndex = 0;

  const details = list[currentIndex];
  const typeIcons = details.types.map(t => `<div class="type-icon ${t.type.name}"></div>`).join("");
  const stats = details.stats.map(s => `<li class="stat-item"><span class="stat-name">${s.stat.name}</span>
  <div class="stat-bar"><div class="stat-fill" style="width:${Math.min(s.base_stat, 100)}%"></div></div></li>`).join("");

  document.getElementById("dialog-content").innerHTML = dialogTemplate(details, typeIcons, stats);


  await loadEvolutionChain(details);
}

async function onLoadMore() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  await loadPokemons();

  if (query.length >= 3) {
    searchPokemon();
  }
}