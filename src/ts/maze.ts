import { Grid } from "./grid";

export type Direction = "up" | "down" | "right" | "left";

// width and height of the camera view
export const RANGE = 9;

export const maze = new Grid(35 /* must be an odd number */);
maze.generateMaze();

// initial position declared here - always the same in all mazes
export const player = {
    x: 0,
    y: 1,
};

export function movePlayer(direction: Direction) {
    let movePossible = true;
    try {
        movePossible =
            movePossible &&
            (direction !== "up" || maze.cells[player.x][player.y - 1] !== "wall");
        movePossible =
            movePossible &&
            (direction !== "down" || maze.cells[player.x][player.y + 1] !== "wall");
        movePossible =
            movePossible &&
            (direction !== "left" || maze.cells[player.x - 1][player.y] !== "wall");
        movePossible =
            movePossible &&
            (direction !== "right" || maze.cells[player.x + 1][player.y] !== "wall");
    } catch {
        // the above statements may throw an error when the player is outside the grid (index out of bounds error)
        // in that case, the move is not possible
        movePossible = false;
    }

    if (!movePossible) return;

    if (direction === "up") player.y--;
    if (direction === "down") player.y++;
    if (direction === "left") player.x--;
    if (direction === "right") player.x++;
}
