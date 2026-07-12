import {
    database,
    ref,
    push,
    remove,
    onValue
} from "./firebase.js";

const teamsReference = ref(database, "equipos");

const teamForm = document.getElementById("teamForm");
const teamName = document.getElementById("teamName");
const teamsList = document.getElementById("teamsList");
const teamsLoading = document.getElementById("teamsLoading");
const teamsEmpty = document.getElementById("teamsEmpty");
const teamsMessage = document.getElementById("teamsMessage");

teamForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = teamName.value.trim();

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
            fechaCreacion: new Date().toISOString(),
            pokemon: {}
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
});

onValue(
    teamsReference,
    snapshot => {
        teamsLoading.classList.add("hidden");

        const data = snapshot.val();

        if (!data) {
            teamsList.innerHTML = "";
            teamsEmpty.classList.remove("hidden");
            return;
        }

        teamsEmpty.classList.add("hidden");

        const teams = Object.entries(data).map(
            ([key, value]) => ({
                firebaseKey: key,
                ...value
            })
        );

        renderTeams(teams);
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

function renderTeams(teams) {
    teamsList.innerHTML = teams
        .map(team => {
            const pokemonCount = team.pokemon
                ? Object.keys(team.pokemon).length
                : 0;

            return `
                <article class="team-item">
                    <div class="team-item-header">
                        <div>
                            <h2>${escapeHtml(team.nombre)}</h2>
                            <p>
                                ${pokemonCount} de 6 Pokémon
                            </p>
                        </div>

                        <button
                            type="button"
                            data-delete-team="${team.firebaseKey}"
                        >
                            Eliminar
                        </button>
                    </div>
                </article>
            `;
        })
        .join("");

    document
        .querySelectorAll("[data-delete-team]")
        .forEach(button => {
            button.addEventListener("click", async () => {
                const confirmed = window.confirm(
                    "¿Seguro que quieres eliminar este equipo?"
                );

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
            });
        });
}

function showMessage(message, type) {
    teamsMessage.textContent = message;
    teamsMessage.className =
        `database-message ${type}`;
}

function escapeHtml(value = "") {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
}