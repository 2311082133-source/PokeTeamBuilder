import {
    database,
    ref,
    set,
    get,
    remove
} from "./firebase.js";

const API_URL = "https://pokeapi.co/api/v2";

const INITIAL_LIMIT = 20;
const LOAD_MORE_LIMIT = 20;

const searchForm = document.getElementById("searchForm");
const pokemonSearch = document.getElementById("pokemonSearch");
const typeFilter = document.getElementById("typeFilter");
const pokemonGrid = document.getElementById("pokemonGrid");
const pokedexLoading = document.getElementById("pokedexLoading");
const pokedexFeedback = document.getElementById("pokedexFeedback");
const noResults = document.getElementById("noResults");
const loadMoreContainer = document.getElementById("loadMoreContainer");
const loadMoreButton = document.getElementById("loadMoreButton");

let currentOffset = 0;
let isLoading = false;
let currentMode = "list";

document.addEventListener("DOMContentLoaded", () => {
    loadInitialPokemon();
});

/* =========================
   BUSCADOR
========================= */

searchForm.addEventListener("submit", async event => {
    event.preventDefault();

    const value = pokemonSearch.value
        .trim()
        .toLowerCase();

    typeFilter.value = "";

    if (!value) {
        await resetPokedex();
        return;
    }

    await searchPokemon(value);
});

pokemonSearch.addEventListener(
    "input",
    debounce(async event => {
        const value = event.target.value
            .trim()
            .toLowerCase();

        if (!value) {
            await resetPokedex();
            return;
        }

        if (value.length >= 2 || /^\d+$/.test(value)) {
            typeFilter.value = "";
            await searchPokemon(value);
        }
    }, 500)
);

/* =========================
   FILTRO POR TIPO
========================= */

typeFilter.addEventListener("change", async event => {
    const selectedType = event.target.value;

    pokemonSearch.value = "";

    if (!selectedType) {
        await resetPokedex();
        return;
    }

    await loadPokemonByType(selectedType);
});

/* =========================
   CARGAR MÁS
========================= */

loadMoreButton.addEventListener("click", async () => {
    if (isLoading || currentMode !== "list") {
        return;
    }

    currentOffset += LOAD_MORE_LIMIT;

    await loadPokemonList(
        LOAD_MORE_LIMIT,
        currentOffset,
        true
    );
});

/* =========================
   EVENTOS DE LAS TARJETAS
========================= */

pokemonGrid.addEventListener("click", async event => {
    const detailsButton = event.target.closest(
        "[data-details-id]"
    );

    if (detailsButton) {
        const pokemonId = detailsButton.dataset.detailsId;

        window.location.href =
            `pokemon.html?id=${encodeURIComponent(pokemonId)}`;

        return;
    }

    const favoriteButton = event.target.closest(
        "[data-favorite-id]"
    );

    if (favoriteButton) {
        const pokemonId =
            favoriteButton.dataset.favoriteId;

        await toggleFavorite(
            pokemonId,
            favoriteButton
        );

        return;
    }

    const teamButton = event.target.closest(
        "[data-team-id]"
    );

    if (teamButton) {
        const pokemonId = teamButton.dataset.teamId;

        window.location.href =
            `equipos.html?pokemonId=${encodeURIComponent(pokemonId)}`;
    }
});

/* =========================
   CARGA INICIAL
========================= */

async function loadInitialPokemon() {
    currentOffset = 0;
    currentMode = "list";

    await loadPokemonList(
        INITIAL_LIMIT,
        currentOffset,
        false
    );
}

async function resetPokedex() {
    currentOffset = 0;
    currentMode = "list";

    clearFeedback();
    noResults.classList.add("hidden");

    await loadPokemonList(
        INITIAL_LIMIT,
        currentOffset,
        false
    );
}

/* =========================
   LISTA DE POKÉMON
========================= */

async function loadPokemonList(
    limit,
    offset,
    append
) {
    if (isLoading) {
        return;
    }

    setLoading(true);

    if (!append) {
        pokemonGrid.innerHTML = "";
    }

    try {
        const response = await fetch(
            `${API_URL}/pokemon?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error(
                "No fue posible cargar la lista."
            );
        }

        const data = await response.json();

        const pokemonDetails = await Promise.all(
            data.results.map(item =>
                fetchPokemonDetails(item.url)
            )
        );

        renderPokemonCards(
            pokemonDetails,
            append
        );

        await updateFavoriteButtons();

        showFeedback(
            `${pokemonGrid.children.length} Pokémon mostrados.`,
            "info"
        );

        loadMoreContainer.classList.remove("hidden");
        noResults.classList.add("hidden");
    } catch (error) {
        console.error(error);

        showFeedback(
            "Ocurrió un error al consultar PokéAPI.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

/* =========================
   BÚSQUEDA POR NOMBRE O ID
========================= */

async function searchPokemon(value) {
    if (isLoading) {
        return;
    }

    currentMode = "search";
    setLoading(true);

    pokemonGrid.innerHTML = "";
    loadMoreContainer.classList.add("hidden");
    noResults.classList.add("hidden");

    clearFeedback();

    try {
        const response = await fetch(
            `${API_URL}/pokemon/${encodeURIComponent(value)}`
        );

        if (!response.ok) {
            throw new Error(
                "Pokémon no encontrado."
            );
        }

        const pokemon = await response.json();

        renderPokemonCards(
            [pokemon],
            false
        );

        await updateFavoriteButtons();

        showFeedback(
            `Encontramos a ${capitalize(pokemon.name)}.`,
            "success"
        );
    } catch (error) {
        console.error(error);

        pokemonGrid.innerHTML = "";
        noResults.classList.remove("hidden");

        showFeedback(
            "No se encontró un Pokémon con ese nombre o número.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

/* =========================
   POKÉMON POR TIPO
========================= */

async function loadPokemonByType(type) {
    if (isLoading) {
        return;
    }

    currentMode = "type";
    setLoading(true);

    pokemonGrid.innerHTML = "";
    loadMoreContainer.classList.add("hidden");
    noResults.classList.add("hidden");

    clearFeedback();

    try {
        const response = await fetch(
            `${API_URL}/type/${encodeURIComponent(type)}`
        );

        if (!response.ok) {
            throw new Error(
                "No fue posible consultar el tipo."
            );
        }

        const data = await response.json();

        const pokemonList = data.pokemon
            .map(item => item.pokemon)
            .filter(item => {
                const id =
                    getPokemonIdFromUrl(item.url);

                return id <= 1025;
            })
            .slice(0, 40);

        const pokemonDetails = await Promise.all(
            pokemonList.map(item =>
                fetchPokemonDetails(item.url)
            )
        );

        renderPokemonCards(
            pokemonDetails,
            false
        );

        await updateFavoriteButtons();

        showFeedback(
            `${pokemonDetails.length} Pokémon de tipo ${translateType(type)}.`,
            "info"
        );

        if (pokemonDetails.length === 0) {
            noResults.classList.remove("hidden");
        }
    } catch (error) {
        console.error(error);

        noResults.classList.remove("hidden");

        showFeedback(
            "No fue posible cargar los Pokémon de ese tipo.",
            "error"
        );
    } finally {
        setLoading(false);
    }
}

/* =========================
   CONSULTAS A POKÉAPI
========================= */

async function fetchPokemonDetails(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Error al obtener detalles."
        );
    }

    return response.json();
}

async function getPokemonById(pokemonId) {
    const response = await fetch(
        `${API_URL}/pokemon/${encodeURIComponent(pokemonId)}`
    );

    if (!response.ok) {
        throw new Error(
            "No se pudo consultar el Pokémon."
        );
    }

    return response.json();
}

/* =========================
   RENDERIZADO DE TARJETAS
========================= */

function renderPokemonCards(
    pokemonList,
    append
) {
    const cards = pokemonList
        .filter(Boolean)
        .map((pokemon, index) =>
            createPokemonCard(
                pokemon,
                index
            )
        )
        .join("");

    if (append) {
        pokemonGrid.insertAdjacentHTML(
            "beforeend",
            cards
        );
    } else {
        pokemonGrid.innerHTML = cards;
    }
}

function createPokemonCard(
    pokemon,
    index
) {
    const image =
        pokemon.sprites.other?.["official-artwork"]
            ?.front_default ||
        pokemon.sprites.other?.home?.front_default ||
        pokemon.sprites.front_default ||
        "";

    const types = pokemon.types.map(
        item => item.type.name
    );

    const mainType =
        types[0] || "normal";

    return `
        <article
            class="pokemon-card"
            style="animation-delay: ${Math.min(
                index * 35,
                350
            )}ms"
            data-pokemon-id="${pokemon.id}"
        >
            <div
                class="pokemon-card-top background-${mainType}"
            >
                <span class="pokemon-number">
                    #${String(pokemon.id).padStart(3, "0")}
                </span>

                <button
                    type="button"
                    class="favorite-card-button"
                    data-favorite-id="${pokemon.id}"
                    title="Agregar a favoritos"
                    aria-label="Agregar ${pokemon.name} a favoritos"
                >
                    ☆
                </button>

                <img
                    src="${image}"
                    alt="Imagen de ${pokemon.name}"
                    class="pokemon-card-image"
                    loading="lazy"
                >
            </div>

            <div class="pokemon-card-body">

                <h2>
                    ${capitalize(pokemon.name)}
                </h2>

                <div class="pokemon-types">
                    ${types
                        .map(type => `
                            <span
                                class="type-chip chip-${type}"
                            >
                                ${translateType(type)}
                            </span>
                        `)
                        .join("")}
                </div>

                <div class="pokemon-card-actions">

                    <button
                        type="button"
                        class="details-button"
                        data-details-id="${pokemon.id}"
                    >
                        Ver detalles
                    </button>

                    <button
                        type="button"
                        class="team-card-button"
                        data-team-id="${pokemon.id}"
                        title="Agregar al equipo"
                        aria-label="Agregar ${pokemon.name} al equipo"
                    >
                        ＋
                    </button>

                </div>
            </div>
        </article>
    `;
}

/* =========================
   FAVORITOS CON FIREBASE
========================= */

async function toggleFavorite(
    pokemonId,
    button
) {
    const favoriteReference = ref(
        database,
        `favoritos/${pokemonId}`
    );

    try {
        button.disabled = true;

        const snapshot = await get(
            favoriteReference
        );

        if (snapshot.exists()) {
            await remove(favoriteReference);

            button.textContent = "☆";
            button.title =
                "Agregar a favoritos";

            showFeedback(
                "Pokémon eliminado de favoritos.",
                "success"
            );

            return;
        }

        const pokemon =
            await getPokemonById(pokemonId);

        const image =
            pokemon.sprites.other?.["official-artwork"]
                ?.front_default ||
            pokemon.sprites.other?.home?.front_default ||
            pokemon.sprites.front_default ||
            "";

        const mainType =
            pokemon.types[0]?.type?.name ||
            "normal";

        await set(favoriteReference, {
            pokemonId: pokemon.id,
            nombre: pokemon.name,
            imagen: image,
            tipo: translateType(mainType),
            tipoOriginal: mainType,
            fechaAgregado:
                new Date().toISOString()
        });

        button.textContent = "★";
        button.title =
            "Eliminar de favoritos";

        showFeedback(
            `${capitalize(pokemon.name)} fue agregado a favoritos.`,
            "success"
        );
    } catch (error) {
        console.error(
            "Error al actualizar favorito:",
            error
        );

        showFeedback(
            "No fue posible actualizar favoritos.",
            "error"
        );
    } finally {
        button.disabled = false;
    }
}

async function updateFavoriteButtons() {
    try {
        const favoritesSnapshot = await get(
            ref(database, "favoritos")
        );

        const favorites =
            favoritesSnapshot.val() || {};

        document
            .querySelectorAll(
                "[data-favorite-id]"
            )
            .forEach(button => {
                const pokemonId =
                    button.dataset.favoriteId;

                const isFavorite =
                    Boolean(favorites[pokemonId]);

                button.textContent =
                    isFavorite ? "★" : "☆";

                button.title = isFavorite
                    ? "Eliminar de favoritos"
                    : "Agregar a favoritos";
            });
    } catch (error) {
        console.error(
            "No fue posible comprobar los favoritos:",
            error
        );
    }
}

/* =========================
   FUNCIONES AUXILIARES
========================= */

function getPokemonIdFromUrl(url) {
    const parts = url
        .split("/")
        .filter(Boolean);

    return Number(
        parts[parts.length - 1]
    );
}

function setLoading(show) {
    isLoading = show;

    pokedexLoading.classList.toggle(
        "hidden",
        !show
    );

    loadMoreButton.disabled = show;

    if (show) {
        noResults.classList.add("hidden");
    }
}

function showFeedback(
    message,
    type = "info"
) {
    pokedexFeedback.textContent = message;

    pokedexFeedback.className =
        `pokedex-feedback ${type}`;
}

function clearFeedback() {
    pokedexFeedback.textContent = "";

    pokedexFeedback.className =
        "pokedex-feedback";
}

function capitalize(text) {
    if (!text) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

function translateType(type) {
    const translations = {
        normal: "Normal",
        fire: "Fuego",
        water: "Agua",
        electric: "Eléctrico",
        grass: "Planta",
        ice: "Hielo",
        fighting: "Lucha",
        poison: "Veneno",
        ground: "Tierra",
        flying: "Volador",
        psychic: "Psíquico",
        bug: "Bicho",
        rock: "Roca",
        ghost: "Fantasma",
        dragon: "Dragón",
        dark: "Siniestro",
        steel: "Acero",
        fairy: "Hada"
    };

    return (
        translations[type] ||
        capitalize(type)
    );
}

function debounce(
    callback,
    delay
) {
    let timeoutId;

    return (...args) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}