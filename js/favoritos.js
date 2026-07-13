import {
    database,
    ref,
    remove,
    onValue
} from "./firebase.js";

import {
    confirmAction
} from "./modal.js";

const favoritesReference =
    ref(database, "favoritos");

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

        const favorites =
            Object.entries(data)
                .map(([key, value]) => ({
                    firebaseKey: key,
                    ...value
                }))
                .sort((a, b) =>
                    new Date(b.fechaAgregado || 0) -
                    new Date(a.fechaAgregado || 0)
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
    favoritesGrid.innerHTML =
        favorites
            .map(favorite => `
                <article class="favorite-item">

                    <div class="favorite-image-box">
                        <img
                            src="${escapeHtml(favorite.imagen)}"
                            alt="Imagen de ${escapeHtml(favorite.nombre)}"
                        >
                    </div>

                    <div class="favorite-content">

                        <h2>
                            ${escapeHtml(favorite.nombre)}
                        </h2>

                        <p class="favorite-type">
                            Tipo:
                            ${escapeHtml(
                                favorite.tipo ||
                                "No disponible"
                            )}
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
                                data-pokemon-name="${escapeHtml(favorite.nombre)}"
                                aria-label="Eliminar favorito"
                                title="Eliminar favorito"
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
            button.addEventListener(
                "click",
                () => {
                    window.location.href =
                        `pokemon.html?id=${encodeURIComponent(
                            button.dataset.detailsId
                        )}`;
                }
            );
        });

    document
        .querySelectorAll("[data-delete-key]")
        .forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const confirmed =
                        await confirmAction({
                            title:
                                "Eliminar favorito",
                            message:
                                `¿Seguro que quieres eliminar a ${capitalize(button.dataset.pokemonName)} de favoritos?`,
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
                                `favoritos/${button.dataset.deleteKey}`
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
                }
            );
        });
}

function showMessage(message, type) {
    favoritesMessage.textContent =
        message;

    favoritesMessage.className =
        `database-message ${type}`;

    window.setTimeout(() => {
        favoritesMessage.textContent = "";
        favoritesMessage.className =
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