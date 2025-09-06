function pokemonCardTemplate(details, typeIcons) {
  const primaryType = details.types[0].type.name;
  const imgUrl = details.sprites.other["official-artwork"].front_default;
  return `
    <div class="pokemon-card ${primaryType}">
      <div class="name-id"><h3>#${details.id} ${details.name}</h3></div>
      <div class="dialog-foto-container"><img src="${imgUrl}" class="dialog-foto ${primaryType}" alt="${details.name}" onclick='openDialog(${JSON.stringify(details)})'></div>
      <div class="type-icon-container">${typeIcons}</div>
    </div>`;
}

function dialogTemplate(details, typeIcons, stats) {
  const pType = details.types[0].type.name;
  const img = details.sprites.other?.["official-artwork"]?.front_default;
  const ab = details.abilities.map(a => a.ability.name).join(", ");
  return `
  <div class="card-update"><div class="name-id"><h3>#${details.id} ${details.name}</h3></div>
  <img class="dialog-foto ${pType}" src="${img}" alt="${details.name}"></div>
  <div class="type-icon-container">${typeIcons}</div>
  <div class="information"><div class="tab-buttons">
  <button class="tab-btn active" onclick="showTab('main', this)">main</button><div class="border"></div>
  <button class="tab-btn" onclick="showTab('stats', this)">stats</button><div class="border"></div>
  <button class="tab-btn" onclick="showTab('evo', this)">evo-chain</button></div></div>
  <div id="tab-main" class="tab-content"><p><span class="label">Height</span><span class="value">:${details.height}m</span></p>
  <p><span class="label">Weight</span><span class="value">:${details.weight}kg</span></p>
  <p><span class="label">Base experience</span><span class="value">:${details.base_experience}</span></p>
  <p><span class="label">Abilities</span><span class="value">:${ab}</span></p></div>
  <div id="tab-stats" class="tab-content" style="display:none;"><ul class="stats-ul">${stats}</ul></div>
  <div id="tab-evo" class="tab-content" style="display:none;"><div id="evo-chain"></div></div>`;
}


function evoTemplate(name, image, isLast) {
  return `
    <img src="${image}" alt="${name}" class="evo-image">
    ${!isLast ? '<span class="evo-arrow">→</span>' : ''}
  `;
}
