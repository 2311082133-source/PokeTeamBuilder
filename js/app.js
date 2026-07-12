const menuButton = document.getElementById("menuButton");
const mainNavigation = document.getElementById("mainNavigation");

if (menuButton && mainNavigation) {
    menuButton.addEventListener("click", () => {
        const isOpen = mainNavigation.classList.toggle("open");

        menuButton.textContent = isOpen ? "✕" : "☰";
        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    mainNavigation
        .querySelectorAll("a")
        .forEach(link => {
            link.addEventListener("click", () => {
                mainNavigation.classList.remove("open");
                menuButton.textContent = "☰";
            });
        });
}