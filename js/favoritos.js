import {
    database,
    ref,
    remove,
    onValue
} from "./firebase.js";

const favoritesReference = ref(database, "favoritos");

const favoritesGrid =
    document.getElementById("favoritesGrid");

const favoritesLoading =
    document.getElementById("favoritesLoading");

const favoritesEmpty =
    document.getElementById("favoritesEmpty");

const favoritesMessage =
    document.getElementById("favoritesMessage");

onValue(
    favoritesReference,
    snapshot => {
        favoritesLoading.classList.add("hidden");

        const data = snapshot.val();

        if (!data) {
            favoritesGrid.innerHTML = "";
            favoritesEmpty.classList.remove("hidden");
            return;
        }

        favoritesEmpty.classList.add("hidden");

        const favorites = Object.entries(data).map(
            ([key, value]) => ({
                firebaseKey: key,
                ...value
            })
        );

        renderFavorites(favorites);
    },
    error => {
        console.error(error);

        favoritesLoading.classList.add("hidden");

        showMessage(
            "No fue posible cargar los favoritos.",
            "error"
        );
    }
);

function renderFavorites(favorites) {
    favoritesGrid.innerHTML = favorites
        .map(favorite => `
            <article class="favorite-item">
                <div class="favorite-image-box">
                    <img
                        src="${escapeHtml(favorite.imagen)}"
                        alt="Imagen de ${escapeHtml(favorite.nombre)}"
                    >
                </div>

                <div class="favorite-content">
                    <h2>${escapeHtml(favorite.nombre)}</h2>

                    <p class="favorite-type">
                        Tipo: ${escapeHtml(favorite.tipo)}
                    </p>

                    <div class="favorite-actions">
                        <button
                            type="button"
                            class="favorite-details"
                            data-details-id="${favorite.pokemonId}"
                        >
                            Ver detalles
                        </button>

                        <button
                            type="button"
                            class="favorite-delete"
                            data-delete-key="${favorite.firebaseKey}"
                            aria-label="Eliminar favorito"
                        >
                            🗑
                        </button>
                    </div>
                </div>
            </article>
        `)
        .join("");

    addFavoriteEvents();
}

function addFavoriteEvents() {
    document
        .querySelectorAll("[data-details-id]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const pokemonId = button.dataset.detailsId;

                window.location.href =
                    `pokemon.html?id=${encodeURIComponent(pokemonId)}`;
            });
        });

    document
        .querySelectorAll("[data-delete-key]")
        .forEach(button => {
            button.addEventListener("click", async () => {
                const confirmed = window.confirm(
                    "¿Seguro que quieres eliminar este Pokémon de favoritos?"
                );

                if (!confirmed) {
                    return;
                }

                try {
                    const favoriteKey =
                        button.dataset.deleteKey;

                    await remove(
                        ref(
                            database,
                            `favoritos/${favoriteKey}`
                        )
                    );

                    showMessage(
                        "Favorito eliminado correctamente.",
                        "success"
                    );
                } catch (error) {
                    console.error(error);

                    showMessage(
                        "No fue posible eliminar el favorito.",
                        "error"
                    );
                }
            });
        });
}

function showMessage(message, type) {
    favoritesMessage.textContent = message;
    favoritesMessage.className =
        `database-message ${type}`;
}

function escapeHtml(value = "") {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
}