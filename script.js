async function loadPokemons() {
  const container = document.getElementById("pokemon-container");
  const limit = 10;
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
      typeIcons += `<img class="type-icon" src="icons/${typeName}.svg" alt="${typeName}">`;
    }

    container.innerHTML += `
      <div class="pokemon-card ${primaryType}">
        <h3>#${details.id} ${details.name}</h3>
        <img src="${imgUrl}" class="dialog-foto" alt="${details.name}" onclick='openDialog(${JSON.stringify(details)})'>
        <div class="type-icon-container">
          ${typeIcons}
        </div>
      </div>
    `;
  }
}

function openDialog(details) {
  const dialog = document.getElementById("pokemon-dialog");
  const content = document.getElementById("dialog-content");

  const name = details.name;
  const id = details.id;
  const image = details.sprites.other?.["official-artwork"]?.front_default;


  const types = details.types.map(t => t.type.name).join(", ");
  const height = details.height;
  const weight = details.weight;
  const abilities = details.abilities.map(a => `<li>${a.ability.name}</li>`).join("");
  const stats = details.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join("");
  const primaryType = details.types[0].type.name;

  content.innerHTML = `<div class="pokemon-card ${primaryType}">
    <h2>#${id} ${name}</h2>
    <div><img class="dialog-foto" src="${image}" alt="${name}"></div>
    </div>
    <div>
      <button onclick="showTab('info')">Info</button>
      <button onclick="showTab('abilities')">Abilities</button>
      <button onclick="showTab('stats')">Stats</button>
    </div>

    <div id="tab-info" class="tab-content">
      <p><strong>Type:</strong> ${types}</p>
      <p><strong>Height:</strong> ${height}</p>
      <p><strong>Weight:</strong> ${weight}</p>
    </div>

    <div id="tab-abilities" class="tab-content" style="display:none;">
      <p><strong>Abilities:</strong></p>
      <ul class="stats-ul" >${abilities}</ul>
    </div>

    <div id="tab-stats" class="tab-content" style="display:none;">
      <p><strong>Base Stats:</strong></p>
      <ul class="stats-ul">${stats}</ul>
    </div>
  `;

  dialog.showModal();
}

function showTab(tabName) {
  const tabs = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => tab.style.display = "none");

  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) activeTab.style.display = "block";
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



function init() {
  loadPokemons();
  setupDialogClose() 
}
