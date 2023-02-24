import { maze, player, movePlayer, Direction, RANGE } from "./maze";

const mazeView = document.querySelector<HTMLDivElement>(".maze-view")!;
const mazeElement = document.querySelector<HTMLDivElement>(".maze")!;

const moveButtons = document.querySelectorAll<HTMLButtonElement>(
    ".controls__move-button"
);

function updateGrid() {
    mazeElement.innerHTML = "";

    mazeView.style.setProperty("--maze-size", maze.size.toString());
    mazeView.style.setProperty(
        "--cell-size",
        `${Math.min(mazeElement.clientWidth / RANGE, 45)}px`
    );
    mazeView.style.setProperty("--range", RANGE.toString());

    for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell", `cell--${maze.cells[x][y]}`);

            mazeElement.appendChild(cell);
        }
    }

    updatePlayer();
}

function updatePlayer() {
    // right now, we are not moving the player at all
    // but just the maze behind it in the opposite direction

    mazeView.style.setProperty("--player-x", player.x.toString());
    mazeView.style.setProperty("--player-y", player.y.toString());
}

moveButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const direction = btn.dataset.direction!;

        movePlayer(direction as Direction);
        updatePlayer();
    });
});

window.addEventListener("keydown", (event) => {
    const key = event.key;
    if(!key.startsWith("Arrow")) return;

    event.preventDefault();
    const direction = key.substring(5).toLowerCase() as Direction;

    movePlayer(direction);
    updatePlayer();
})

window.addEventListener("resize", updateGrid);
updateGrid();
