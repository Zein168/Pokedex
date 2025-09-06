async function loadPokemons() {
  const container = document.getElementById("pokemon-container");
  const data = await (await fetch('https://pokeapi.co/api/v2/pokemon?limit=20')).json();

  for (const item of data.results) {
    const details = await (await fetch(item.url)).json();
    const typeIcons = details.types.map(t => `<div class="type-icon ${t.type.name}"></div>`).join("");
    container.innerHTML += pokemonCardTemplate(details, typeIcons);
  }
}


function openDialog(details) {
  const typeIcons = details.types.map(t => `<div class="type-icon ${t.type.name}"></div>`).join("");
  const stats = details.stats.map(s => `<li class="stat-item"><span class="stat-name">${s.stat.name}</span><div class="stat-bar"><div class="stat-fill" style="width:${Math.min(s.base_stat,100)}%"></div></div></li>`).join("");
  
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
    if (!content.contains(e.target)) {
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

async function loadEvolutionChain(details) {
  try {
    const evoChain = await fetchEvolutionChain(details);
    const evoContainer = document.getElementById("evo-chain");
    evoContainer.innerHTML = "";

    for (let i = 0; i < evoChain.length; i++) {
      const name = evoChain[i];
      const data = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)).json();
      const image = data.sprites.other["official-artwork"].front_default;
      evoContainer.innerHTML += evoTemplate(name, image, i === evoChain.length - 1);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Evolution Chain:", error);
    document.getElementById("evo-chain").textContent = "Unavailable";
  }
}


function init() {
  loadPokemons();
  setupDialogClose()
}

let allPokemon = [];

async function loadAllPokemon() {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
  const data = await response.json();
  allPokemon = data.results;
}



async function searchPokemon() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const container = document.getElementById("pokemon-container");
  container.innerHTML = "";

  if (!query) return loadPokemons(); 

  const filtered = allPokemon.filter(p => p.name.includes(query));

  for (const item of filtered) {
    const details = await (await fetch(item.url)).json();
    const typeIcons = details.types
      .map(t => `<div class="type-icon ${t.type.name}"></div>`)
      .join("");

    container.innerHTML += pokemonCardTemplate(details, typeIcons);
  }
}


loadAllPokemon();
