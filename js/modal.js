let modalResolver = null;

function createModal() {
    if (document.getElementById("confirmationModal")) {
        return;
    }

    document.body.insertAdjacentHTML(
        "beforeend",
        `
        <div
            id="confirmationModal"
            class="custom-modal hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
        >
            <div class="custom-modal-backdrop"></div>

            <div class="custom-modal-content">
                <div class="custom-modal-icon">
                    ⚠️
                </div>

                <h2 id="modalTitle">
                    Confirmar acción
                </h2>

                <p id="modalDescription">
                    ¿Deseas continuar?
                </p>

                <div class="custom-modal-actions">
                    <button
                        type="button"
                        id="modalCancelButton"
                        class="modal-button modal-cancel"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        id="modalConfirmButton"
                        class="modal-button modal-confirm"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
        `
    );

    const modal =
        document.getElementById("confirmationModal");

    const cancelButton =
        document.getElementById("modalCancelButton");

    const confirmButton =
        document.getElementById("modalConfirmButton");

    const backdrop =
        modal.querySelector(".custom-modal-backdrop");

    cancelButton.addEventListener("click", () => {
        closeModal(false);
    });

    confirmButton.addEventListener("click", () => {
        closeModal(true);
    });

    backdrop.addEventListener("click", () => {
        closeModal(false);
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            !modal.classList.contains("hidden")
        ) {
            closeModal(false);
        }
    });
}

export function confirmAction({
    title = "Confirmar acción",
    message = "¿Deseas continuar?",
    confirmText = "Confirmar"
}) {
    createModal();

    const modal =
        document.getElementById("confirmationModal");

    const titleElement =
        document.getElementById("modalTitle");

    const descriptionElement =
        document.getElementById("modalDescription");

    const confirmButton =
        document.getElementById("modalConfirmButton");

    titleElement.textContent = title;
    descriptionElement.textContent = message;
    confirmButton.textContent = confirmText;

    modal.classList.remove("hidden");

    document.body.classList.add("modal-open");

    confirmButton.focus();

    return new Promise(resolve => {
        modalResolver = resolve;
    });
}

function closeModal(result) {
    const modal =
        document.getElementById("confirmationModal");

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    document.body.classList.remove("modal-open");

    if (modalResolver) {
        modalResolver(result);
        modalResolver = null;
    }
}