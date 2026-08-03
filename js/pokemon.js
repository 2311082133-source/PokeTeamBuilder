import { database, ref, set, get, remove } from "./firebase.js";

const API_URL = "https://pokeapi.co/api/v2";

const POKEBOLAS_API_URL = "http://localhost:5198/api/Pokebolas";

const pokemonLoading = document.getElementById("pokemonLoading");

const pokemonMessage = document.getElementById("pokemonMessage");

const pokemonDetail = document.getElementById("pokemonDetail");

document.addEventListener("DOMContentLoaded", loadPokemonDetail);

async function loadPokemonDetail() {
  const params = new URLSearchParams(window.location.search);

  const pokemonId = params.get("id");

  if (!pokemonId) {
    showMessage("No se recibió el identificador del Pokémon.", "error");

    hideLoading();

    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/pokemon/${encodeURIComponent(pokemonId)}`,
    );

    if (!response.ok) {
      throw new Error("Pokémon no encontrado.");
    }

    const pokemon = await response.json();

    renderPokemonDetail(pokemon);

    loadPokebolas();
  } catch (error) {
    console.error(error);

    showMessage("No fue posible cargar la información del Pokémon.", "error");
  } finally {
    hideLoading();
  }
}

function renderPokemonDetail(pokemon) {
  const image =
    pokemon.sprites.other?.["official-artwork"]?.front_default ||
    pokemon.sprites.other?.home?.front_default ||
    pokemon.sprites.front_default ||
    "";

  const types = pokemon.types.map((item) => item.type.name);

  const mainType = types[0] || "normal";

  const abilities = pokemon.abilities
    .map((item) => formatText(item.ability.name))
    .join(", ");

  const stats = pokemon.stats.reduce((result, item) => {
    result[item.stat.name] = item.base_stat;

    return result;
  }, {});

  pokemonDetail.innerHTML = `


        <article class="pokemon-detail-card">


            <div
                class="pokemon-image-section background-${mainType}"
            >


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

                            Información del Pokémon

                        </span>



                        <h1>

                            ${capitalize(pokemon.name)}

                        </h1>


                    </div>




                    <button

                        type="button"

                        id="favoriteButton"

                        class="favorite-button"

                        title="Agregar a favoritos"

                        aria-label="Agregar a favoritos"

                    >

                        ☆

                    </button>



                </div>





                <div class="pokemon-types">


                    ${types
                      .map(
                        (type) => `

                            <span

                                class="type-chip chip-${type}"

                            >

                                ${translateType(type)}

                            </span>

                            `,
                      )
                      .join("")}


                </div>





                <div class="pokemon-data-grid">


                    <div class="data-box">

                        <span>

                            Altura

                        </span>


                        <strong>

                            ${pokemon.height / 10} m

                        </strong>


                    </div>




                    <div class="data-box">

                        <span>

                            Peso

                        </span>


                        <strong>

                            ${pokemon.weight / 10} kg

                        </strong>


                    </div>




                    <div class="data-box">

                        <span>

                            Experiencia base

                        </span>


                        <strong>

                            ${pokemon.base_experience ?? "N/D"}

                        </strong>


                    </div>


                </div>





                <section class="abilities">


                    <h2>

                        Habilidades

                    </h2>



                    <p>

                        ${abilities || "No disponible"}

                    </p>



                </section>





                <section class="stats">


                    <h2>

                        Estadísticas

                    </h2>




                    ${createStat("Vida", stats.hp)}



                    ${createStat("Ataque", stats.attack)}



                    ${createStat("Defensa", stats.defense)}



                    ${createStat("Ataque especial", stats["special-attack"])}



                    ${createStat("Defensa especial", stats["special-defense"])}



                    ${createStat("Velocidad", stats.speed)}



                </section>





                <section

                    id="pokebolasContainer"

                    class="pokebolas-section"

                >

                    <h2>

                        Poké Balls recomendadas

                    </h2>


                    <p>

                        Cargando Poké Balls...

                    </p>


                </section>





                <button

                    type="button"

                    id="addToTeamButton"

                    class="btn btn-primary team-button"

                >

                    Agregar a mi equipo

                </button>




            </div>



        </article>


    `;

  addDetailEvents(pokemon, image, types);
}
async function loadPokebolas() {
  try {
    const response = await fetch(POKEBOLAS_API_URL);

    if (!response.ok) {
      throw new Error("No se pudieron cargar las Poké Balls.");
    }

    const pokebolas = await response.json();

    renderPokebolas(pokebolas);
  } catch (error) {
    console.error("Error cargando Poké Balls:", error);

    const container = document.getElementById("pokebolasContainer");

    if (container) {
      container.innerHTML = `

                <h2>
                    Poké Balls recomendadas
                </h2>

                <p>
                    No fue posible cargar las Poké Balls.
                </p>

            `;
    }
  }
}

function renderPokebolas(pokebolas) {
  const container = document.getElementById("pokebolasContainer");

  if (!container) {
    return;
  }

  container.innerHTML = `


        <h2>

            Poké Balls recomendadas

        </h2>



        <div class="pokebolas-grid">


            ${pokebolas
              .map(
                (ball) => `


                    <article class="pokebola-card">


                        <h3>

                            ${ball.nombre}

                        </h3>



                        <p>

                            ${ball.descripcion ?? "Sin descripción"}

                        </p>



                        <strong>
                            Efectividad:
                            ${ball.efectividad ?? "No especificada"}
                        </strong>



                    </article>


                    `,
              )
              .join("")}


        </div>


    `;
}

function addDetailEvents(pokemon, image, types) {
  const favoriteButton = document.getElementById("favoriteButton");

  const addToTeamButton = document.getElementById("addToTeamButton");

  const favoriteReference = ref(database, `favoritos/${pokemon.id}`);

  checkFavoriteStatus(favoriteReference, favoriteButton);

  favoriteButton.addEventListener("click", async () => {
    try {
      favoriteButton.disabled = true;

      const snapshot = await get(favoriteReference);

      if (snapshot.exists()) {
        await remove(favoriteReference);

        favoriteButton.textContent = "☆";

        favoriteButton.title = "Agregar a favoritos";

        favoriteButton.setAttribute("aria-label", "Agregar a favoritos");

        showMessage(
          `${capitalize(pokemon.name)} fue eliminado de favoritos.`,
          "success",
        );

        return;
      }

      const mainType = types[0] || "normal";

      await set(favoriteReference, {
        pokemonId: pokemon.id,

        nombre: pokemon.name,

        imagen: image,

        tipo: translateType(mainType),

        tipoOriginal: mainType,

        fechaAgregado: new Date().toISOString(),
      });

      favoriteButton.textContent = "★";

      favoriteButton.title = "Eliminar de favoritos";

      favoriteButton.setAttribute("aria-label", "Eliminar de favoritos");

      showMessage(
        `${capitalize(pokemon.name)} fue agregado a favoritos.`,
        "success",
      );
    } catch (error) {
      console.error("Error al actualizar favorito:", error);

      showMessage("No fue posible actualizar favoritos.", "error");
    } finally {
      favoriteButton.disabled = false;
    }
  });

  addToTeamButton.addEventListener("click", () => {
    window.location.href = `equipos.html?pokemonId=${encodeURIComponent(pokemon.id)}`;
  });
}

async function checkFavoriteStatus(favoriteReference, favoriteButton) {
  try {
    const snapshot = await get(favoriteReference);

    const isFavorite = snapshot.exists();

    favoriteButton.textContent = isFavorite ? "★" : "☆";

    favoriteButton.title = isFavorite
      ? "Eliminar de favoritos"
      : "Agregar a favoritos";

    favoriteButton.setAttribute(
      "aria-label",
      isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos",
    );
  } catch (error) {
    console.error("No fue posible comprobar el favorito:", error);
  }
}

function createStat(name, value = 0) {
  const percentage = Math.min((Number(value) / 180) * 100, 100);

  return `


        <div class="stat-row">


            <div class="stat-header">


                <span>

                    ${name}

                </span>


                <strong>

                    ${value}

                </strong>


            </div>




            <div class="stat-bar">


                <div

                    class="stat-progress"

                    style="width:${percentage}%"

                ></div>


            </div>



        </div>


    `;
}

function hideLoading() {
  pokemonLoading.classList.add("hidden");
}

function showMessage(message, type = "info") {
  pokemonMessage.textContent = message;

  pokemonMessage.className = `message ${type}`;
}

function capitalize(text) {
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatText(text = "") {
  return text

    .split("-")

    .map(capitalize)

    .join(" ");
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

    fairy: "Hada",
  };

  return translations[type] || capitalize(type);
}
