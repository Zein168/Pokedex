async function loadPokemons() {
  const container = document.getElementById("pokemon-container");
  const limit = 20;
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;

  const response = await fetch(url);
  const data = await response.json();

  for (const item of data.results) {
    const detailsResponse = await fetch(item.url);
    const details = await detailsResponse.json();
    const primaryType = details.types[0].type.name;
    const imgUrl = details.sprites.other["official-artwork"].front_default;

    let typeIcons = "";
    for (const type of details.types) {
      const typeName = type.type.name;
      typeIcons += `<div class="type-icon ${typeName}"></div>`;
    }

    container.innerHTML += `<div class="pokemon-card ${primaryType}">
        <div class="name-id"><h3>#${details.id} ${details.name}</h3></div>
        <div><img src="${imgUrl}" class="dialog-foto ${primaryType}" alt="${details.name}" onclick='openDialog(${JSON.stringify(details)})'></div>

        <div class="type-icon-container">
          ${typeIcons}
        </div>
        </div>`;
  }
}

function openDialog(details) {
  let typeIcons = "";
  for (const type of details.types) {
    const typeName = type.type.name;
    typeIcons += `<div class="type-icon ${typeName}"></div>`;
  }
  const dialog = document.getElementById("pokemon-dialog");
  const content = document.getElementById("dialog-content");

  const name = details.name;
  const id = details.id;
  const image = details.sprites.other?.["official-artwork"]?.front_default;
  const baseExperience = details.base_experience;

  const types = details.types.map(t => t.type.name).join(", ");
  const height = details.height;
  const weight = details.weight;
   
  const abilities = details.abilities.map(a => a.ability.name).join(", ");
  const primaryType = details.types[0].type.name;

  const stats = details.stats.map(s => `
    <li class="stat-item">
      <span class="stat-name">${s.stat.name}</span>
      <div class="stat-bar">
        <div class="stat-fill" style="width: ${Math.min(s.base_stat, 100)}%;"></div>
      </div>
      
    </li>
  `).join("");


  content.innerHTML = `
    <div class=" card-update ">
      <div class="name-id"><h3>#${details.id} ${details.name}</h3></div>
      <div><img class="dialog-foto ${primaryType} foto-update " src="${image}" alt="${name}"></div>
    </div>
      <div class="type-icon-container">
          ${typeIcons}
        </div> 
    <div class="information">
        <div class="tab-buttons">
            <button class="tab-btn active" onclick="showTab('main', this)">main</button>
            <div class="border"></div>
             <button class="tab-btn" onclick="showTab('stats', this)">stats</button>
            <div class="border"></div>
           
            <button class="tab-btn" onclick="showTab('evo', this)">evo-chain</button>
        </div>
    </div>



    <div id="tab-main" class="tab-content">
      <p><span class="label">Height</span> <span class="value">:${height}m</span></p>
      <p><span class="label">Weight</span> <span class="value">:${weight}kg</span></p>
      <p><span class="label">Base experience</span> <span class="value">:${baseExperience}</span></p>
      <p><span class="label">Abilities</span> <span class="value">:${abilities}</span></p>
    </div>



    <div id="tab-stats" class="tab-content" style="display:none;">
     
      <ul class="stats-ul">
        ${stats} 
      </ul>
    </div>

      <div id="tab-evo" class="tab-content" style="display:none;">
        <div id="evo-chain"></div>
      </div>
    `;

  dialog.showModal();
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

async function loadEvolutionChain(details) {
  try {
    const speciesRes = await fetch(details.species.url);
    const speciesData = await speciesRes.json();

    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    const evoChain = [];
    let evo = evoData.chain;

    while (evo) {
      evoChain.push(evo.species.name);
      evo = evo.evolves_to[0];
    }

    const evoContainer = document.getElementById("evo-chain");
    evoContainer.innerHTML = ""; 

    for (const name of evoChain) {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await res.json();
      const image = data.sprites.other["official-artwork"].front_default;

      const img = document.createElement("img");
      img.src = image;
      img.alt = name;
      img.classList.add("evo-image");

      evoContainer.appendChild(img);

     
      if (name !== evoChain[evoChain.length - 1]) {
        const arrow = document.createElement("span");
        arrow.textContent = "→";
        arrow.classList.add("evo-arrow");
        evoContainer.appendChild(arrow);
      }
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
    const primaryType = details.types[0].type.name;
    const imgUrl = details.sprites.other["official-artwork"].front_default;

    const typeIcons = details.types.map(t => `<div class="type-icon ${t.type.name}"></div>`).join("");

    container.innerHTML += `
      <div class="pokemon-card ${primaryType}">
        <div class="name-id"><h3>#${details.id} ${details.name}</h3></div>
        <div><img src="${imgUrl}" class="dialog-foto ${primaryType}" alt="${details.name}" onclick='openDialog(${JSON.stringify(details)})'></div>
        <div class="type-icon-container">${typeIcons}</div>
      </div>`;
  }
}

loadAllPokemon();
