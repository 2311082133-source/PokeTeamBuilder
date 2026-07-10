const searchForm = document.getElementById("searchForm");
const pokemonInput = document.getElementById("pokemonInput");
const pokemonResult = document.getElementById("pokemonResult");
const searchMessage = document.getElementById("searchMessage");
const loading = document.getElementById("loading");

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const searchValue = pokemonInput.value
        .trim()
        .toLowerCase();

    if (!searchValue) {
        showMessage("Escribe el nombre o número de un Pokémon.", "error");
        return;
    }

    await searchPokemon(searchValue);
});

async function searchPokemon(searchValue) {
    showLoading(true);
    clearResult();
    clearMessage();

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(searchValue)}`
        );

        if (!response.ok) {
            throw new Error("Pokémon no encontrado");
        }

        const pokemon = await response.json();

        renderPokemon(pokemon);
        showMessage("Pokémon encontrado correctamente.", "success");
    } catch (error) {
        console.error(error);

        showMessage(
            "No se encontró el Pokémon. Revisa el nombre o número.",
            "error"
        );
    } finally {
        showLoading(false);
    }
}

function renderPokemon(pokemon) {
    const image =
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default;

    const types = pokemon.types
        .map(item => item.type.name);

    const mainType = types[0];

    const abilities = pokemon.abilities
        .map(item => item.ability.name)
        .join(", ");

    const stats = pokemon.stats.reduce((result, item) => {
        result[item.stat.name] = item.base_stat;
        return result;
    }, {});

    pokemonResult.innerHTML = `
        <article class="pokemon-detail-card type-${mainType}">

            <div class="pokemon-image-section">
                <span class="pokemon-number">
                    #${String(pokemon.id).padStart(3, "0")}
                </span>

                <img
                    src="${image}"
                    alt="Imagen de ${pokemon.name}"
                    class="pokemon-image"
                >
            </div>

            <div class="pokemon-information">

                <div class="pokemon-title">
                    <div>
                        <span class="pokemon-small-label">
                            Pokémon encontrado
                        </span>

                        <h2>${capitalize(pokemon.name)}</h2>
                    </div>

                    <button
                        class="favorite-button"
                        type="button"
                        title="Agregar a favoritos"
                    >
                        ☆
                    </button>
                </div>

                <div class="pokemon-types">
                    ${types.map(type => `
                        <span class="type-badge type-${type}">
                            ${capitalize(type)}
                        </span>
                    `).join("")}
                </div>

                <div class="pokemon-data-grid">

                    <div class="data-box">
                        <span>Altura</span>
                        <strong>${pokemon.height / 10} m</strong>
                    </div>

                    <div class="data-box">
                        <span>Peso</span>
                        <strong>${pokemon.weight / 10} kg</strong>
                    </div>

                    <div class="data-box">
                        <span>Experiencia</span>
                        <strong>${pokemon.base_experience ?? "N/D"}</strong>
                    </div>

                </div>

                <div class="abilities">
                    <h3>Habilidades</h3>
                    <p>${formatText(abilities)}</p>
                </div>

                <div class="stats">
                    <h3>Estadísticas</h3>

                    ${createStat("Vida", stats.hp)}
                    ${createStat("Ataque", stats.attack)}
                    ${createStat("Defensa", stats.defense)}
                    ${createStat("Ataque especial", stats["special-attack"])}
                    ${createStat("Defensa especial", stats["special-defense"])}
                    ${createStat("Velocidad", stats.speed)}
                </div>

                <button type="button" class="btn btn-primary team-button">
                    Agregar a mi equipo
                </button>

            </div>

        </article>
    `;
}

function createStat(name, value) {
    const percentage = Math.min((value / 180) * 100, 100);

    return `
        <div class="stat-row">
            <div class="stat-header">
                <span>${name}</span>
                <strong>${value}</strong>
            </div>

            <div class="stat-bar">
                <div
                    class="stat-progress"
                    style="width: ${percentage}%"
                ></div>
            </div>
        </div>
    `;
}

function showLoading(show) {
    loading.classList.toggle("hidden", !show);
}

function clearResult() {
    pokemonResult.innerHTML = "";
}

function showMessage(message, type) {
    searchMessage.textContent = message;
    searchMessage.className = `message ${type}`;
}

function clearMessage() {
    searchMessage.textContent = "";
    searchMessage.className = "message";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatText(text) {
    return text
        .split(", ")
        .map(value =>
            value
                .split("-")
                .map(capitalize)
                .join(" ")
        )
        .join(", ");
}