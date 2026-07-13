import {
    database,
    ref,
    push,
    set,
    get,
    remove,
    onValue
} from "./firebase.js";

import {
    confirmAction
} from "./modal.js";

const API_URL = "https://pokeapi.co/api/v2";

const teamsReference =
    ref(database, "equipos");

const teamForm =
    document.getElementById("teamForm");

const teamName =
    document.getElementById("teamName");

const teamsList =
    document.getElementById("teamsList");

const teamsLoading =
    document.getElementById("teamsLoading");

const teamsEmpty =
    document.getElementById("teamsEmpty");

const teamsMessage =
    document.getElementById("teamsMessage");

const pendingPokemonPanel =
    document.getElementById("pendingPokemonPanel");

const pendingPokemonContent =
    document.getElementById("pendingPokemonContent");

let currentTeams = [];
let pendingPokemon = null;

document.addEventListener(
    "DOMContentLoaded",
    initializeTeamsPage
);

teamForm.addEventListener(
    "submit",
    createTeam
);

function initializeTeamsPage() {
    listenToTeams();
    loadPendingPokemon();
}

async function createTeam(event) {
    event.preventDefault();

    const name =
        teamName.value.trim();

    if (name.length < 3) {
        showMessage(
            "El nombre debe contener al menos tres caracteres.",
            "error"
        );

        return;
    }

    try {
        await push(teamsReference, {
            nombre: name,
            fechaCreacion:
                new Date().toISOString()
        });

        teamForm.reset();

        showMessage(
            "Equipo creado correctamente.",
            "success"
        );
    } catch (error) {
        console.error(error);

        showMessage(
            "No fue posible crear el equipo.",
            "error"
        );
    }
}

function listenToTeams() {
    onValue(
        teamsReference,
        snapshot => {
            teamsLoading.classList.add("hidden");

            const data = snapshot.val();

            if (!data) {
                currentTeams = [];
                teamsList.innerHTML = "";
                teamsEmpty.classList.remove("hidden");

                renderPendingPokemon();
                return;
            }

            teamsEmpty.classList.add("hidden");

            currentTeams = Object.entries(data)
                .map(([key, value]) => ({
                    firebaseKey: key,
                    ...value
                }))
                .sort((a, b) =>
                    new Date(b.fechaCreacion || 0) -
                    new Date(a.fechaCreacion || 0)
                );

            renderTeams();
            renderPendingPokemon();
        },
        error => {
            console.error(error);

            teamsLoading.classList.add("hidden");

            showMessage(
                "No fue posible cargar los equipos.",
                "error"
            );
        }
    );
}

async function loadPendingPokemon() {
    const params =
        new URLSearchParams(window.location.search);

    const pokemonId =
        params.get("pokemonId");

    if (!pokemonId) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/pokemon/${encodeURIComponent(pokemonId)}`
        );

        if (!response.ok) {
            throw new Error(
                "No se encontró el Pokémon."
            );
        }

        const pokemon =
            await response.json();

        pendingPokemon = {
            pokemonId: pokemon.id,
            nombre: pokemon.name,
            imagen:
                pokemon.sprites.other?.["official-artwork"]
                    ?.front_default ||
                pokemon.sprites.front_default ||
                "",
            tipo:
                pokemon.types[0]?.type?.name ||
                "normal"
        };

        renderPendingPokemon();
    } catch (error) {
        console.error(error);

        showMessage(
            "No fue posible cargar el Pokémon seleccionado.",
            "error"
        );
    }
}

function renderPendingPokemon() {
    if (!pendingPokemon) {
        pendingPokemonPanel.classList.add("hidden");
        return;
    }

    pendingPokemonPanel.classList.remove("hidden");

    const availableTeams = currentTeams
        .map(team => {
            const pokemonCount =
                team.pokemon
                    ? Object.keys(team.pokemon).length
                    : 0;

            const alreadyExists =
                Boolean(
                    team.pokemon?.[
                        pendingPokemon.pokemonId
                    ]
                );

            const isFull =
                pokemonCount >= 6;

            let buttonText =
                "Agregar a este equipo";

            if (alreadyExists) {
                buttonText =
                    "Ya está en el equipo";
            } else if (isFull) {
                buttonText =
                    "Equipo completo";
            }

            return `
                <button
                    type="button"
                    class="pending-team-option"
                    data-add-to-team="${team.firebaseKey}"
                    ${alreadyExists || isFull ? "disabled" : ""}
                >
                    <span>${escapeHtml(team.nombre)}</span>

                    <small>
                        ${pokemonCount}/6 Pokémon
                    </small>

                    <strong>
                        ${buttonText}
                    </strong>
                </button>
            `;
        })
        .join("");

    pendingPokemonContent.innerHTML = `
        <div class="pending-pokemon-header">
            <img
                src="${escapeHtml(pendingPokemon.imagen)}"
                alt="Imagen de ${escapeHtml(pendingPokemon.nombre)}"
            >

            <div>
                <span class="database-label">
                    Pokémon seleccionado
                </span>

                <h2>
                    ${capitalize(pendingPokemon.nombre)}
                </h2>

                <p>
                    Selecciona el equipo en el que deseas
                    agregarlo.
                </p>
            </div>

            <a
                href="pokedex.html"
                class="pending-cancel-link"
            >
                Cancelar
            </a>
        </div>

        <div class="pending-team-list">
            ${
                availableTeams ||
                `
                <div class="pending-no-teams">
                    Primero debes crear un equipo.
                </div>
                `
            }
        </div>
    `;

    document
        .querySelectorAll("[data-add-to-team]")
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    await addPokemonToTeam(
                        button.dataset.addToTeam
                    );
                }
            );
        });
}

async function addPokemonToTeam(teamKey) {
    if (!pendingPokemon) {
        return;
    }

    try {
        const teamSnapshot = await get(
            ref(database, `equipos/${teamKey}`)
        );

        if (!teamSnapshot.exists()) {
            throw new Error(
                "El equipo ya no existe."
            );
        }

        const team =
            teamSnapshot.val();

        const pokemon =
            team.pokemon || {};

        if (
            pokemon[pendingPokemon.pokemonId]
        ) {
            showMessage(
                "Ese Pokémon ya pertenece al equipo.",
                "error"
            );

            return;
        }

        if (
            Object.keys(pokemon).length >= 6
        ) {
            showMessage(
                "El equipo ya tiene seis Pokémon.",
                "error"
            );

            return;
        }

        await set(
            ref(
                database,
                `equipos/${teamKey}/pokemon/${pendingPokemon.pokemonId}`
            ),
            {
                ...pendingPokemon,
                fechaAgregado:
                    new Date().toISOString()
            }
        );

        showMessage(
            `${capitalize(pendingPokemon.nombre)} fue agregado al equipo.`,
            "success"
        );

        pendingPokemon = null;
        pendingPokemonPanel.classList.add("hidden");

        window.history.replaceState(
            {},
            document.title,
            "equipos.html"
        );
    } catch (error) {
        console.error(error);

        showMessage(
            "No fue posible agregar el Pokémon al equipo.",
            "error"
        );
    }
}

function renderTeams() {
    teamsList.innerHTML = currentTeams
        .map(team => {
            const pokemonEntries =
                team.pokemon
                    ? Object.entries(team.pokemon)
                    : [];

            const pokemonCards =
                pokemonEntries
                    .map(
                        ([pokemonKey, pokemon]) => `
                            <article class="team-pokemon-card">
                                <img
                                    src="${escapeHtml(pokemon.imagen)}"
                                    alt="Imagen de ${escapeHtml(pokemon.nombre)}"
                                >

                                <div>
                                    <strong>
                                        ${capitalize(pokemon.nombre)}
                                    </strong>

                                    <span>
                                        ${capitalize(pokemon.tipo)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    data-remove-pokemon="${pokemonKey}"
                                    data-team-key="${team.firebaseKey}"
                                    data-pokemon-name="${escapeHtml(pokemon.nombre)}"
                                    title="Quitar del equipo"
                                >
                                    ✕
                                </button>
                            </article>
                        `
                    )
                    .join("");

            return `
                <article class="team-item">

                    <div class="team-item-header">
                        <div>
                            <h2>
                                ${escapeHtml(team.nombre)}
                            </h2>

                            <p>
                                ${pokemonEntries.length} de 6 Pokémon
                            </p>
                        </div>

                        <button
                            type="button"
                            class="delete-team-button"
                            data-delete-team="${team.firebaseKey}"
                            data-team-name="${escapeHtml(team.nombre)}"
                        >
                            Eliminar equipo
                        </button>
                    </div>

                    <div class="team-pokemon-grid">
                        ${
                            pokemonCards ||
                            `
                            <div class="team-empty-pokemon">
                                Este equipo todavía no tiene Pokémon.
                            </div>
                            `
                        }
                    </div>

                </article>
            `;
        })
        .join("");

    addTeamEvents();
}

function addTeamEvents() {
    document
        .querySelectorAll("[data-delete-team]")
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const confirmed =
                        await confirmAction({
                            title:
                                "Eliminar equipo",
                            message:
                                `¿Seguro que quieres eliminar el equipo "${button.dataset.teamName}"?`,
                            confirmText:
                                "Eliminar"
                        });

                    if (!confirmed) {
                        return;
                    }

                    try {
                        await remove(
                            ref(
                                database,
                                `equipos/${button.dataset.deleteTeam}`
                            )
                        );

                        showMessage(
                            "Equipo eliminado correctamente.",
                            "success"
                        );
                    } catch (error) {
                        console.error(error);

                        showMessage(
                            "No fue posible eliminar el equipo.",
                            "error"
                        );
                    }
                }
            );
        });

    document
        .querySelectorAll("[data-remove-pokemon]")
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const confirmed =
                        await confirmAction({
                            title:
                                "Quitar Pokémon",
                            message:
                                `¿Deseas quitar a ${capitalize(button.dataset.pokemonName)} de este equipo?`,
                            confirmText:
                                "Quitar"
                        });

                    if (!confirmed) {
                        return;
                    }

                    try {
                        await remove(
                            ref(
                                database,
                                `equipos/${button.dataset.teamKey}/pokemon/${button.dataset.removePokemon}`
                            )
                        );

                        showMessage(
                            "Pokémon eliminado del equipo.",
                            "success"
                        );
                    } catch (error) {
                        console.error(error);

                        showMessage(
                            "No fue posible quitar el Pokémon.",
                            "error"
                        );
                    }
                }
            );
        });
}

function showMessage(
    message,
    type = "info"
) {
    teamsMessage.textContent = message;
    teamsMessage.className =
        `database-message ${type}`;

    window.setTimeout(() => {
        teamsMessage.textContent = "";
        teamsMessage.className =
            "database-message";
    }, 4500);
}

function capitalize(text = "") {
    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}

function escapeHtml(value = "") {
    const element =
        document.createElement("div");

    element.textContent =
        String(value);

    return element.innerHTML;
}