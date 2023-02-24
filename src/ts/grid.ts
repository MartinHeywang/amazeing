export type Cell = "empty" | "wall" | "start" | "exit";

export class Grid {
    size: number;
    cells: Cell[][];

    constructor(size: number) {
        this.size = size;
        this.cells = [];

        this.emptyGrid();
    }

    emptyGrid() {
        this.cells = [];
        for (let x = 0; x < this.size; x++) {
            this.cells[x] ||= [];

            for (let y = 0; y < this.size; y++) {
                this.cells[x][y] = "empty";
            }
        }
    }

    // creates a wall all around the grid
    enclose() {
        if (this.size < 1) return;

        this.emptyGrid();

        const repeatArray = <T>(times: number, element: T) => {
            const result: T[] = [];
            for (let i = 0; i < times; i++) {
                result.push(element);
            }
            return result;
        };
        this.cells[0] = repeatArray(this.size, "wall");
        this.cells[this.cells.length - 1] = repeatArray(this.size, "wall");

        for (let i = 1; i < this.cells.length - 1; i++) {
            this.cells[i][0] = "wall";
            this.cells[i][this.size - 1] = "wall";
        }
    }

    generateMaze() {
        // using a recursive algorithm for the generation

        type Slice = { minX: number; maxX: number; minY: number; maxY: number };

        const randomInteger = (min: number, max: number) => {
            const a = Math.ceil(min);
            const b = Math.floor(max);
            return Math.floor(Math.random() * (b - a)) + a;
        };

        const recursiveSubFunction = (slice: Slice) => {

            // we are dividing the maze into two parts at a random point
            // by generating a wall, with a hole anywhere in the wall
            // and we're calling this function recursively on the two sides of the wall
            // until we can't create a wall anymore (if the slice is too small)

            if (slice.maxX - slice.minX < 3 || slice.maxY - slice.minY < 3) return;
            
            const direction =
                slice.maxY - slice.minY > slice.maxX - slice.minX
                    ? "horizontal"
                    : "vertical";

            const wallLength =
                direction === "horizontal"
                    ? slice.maxX - slice.minX
                    : slice.maxY - slice.minY;

            // the hole can be anywhere in the slice
            let holeX = randomInteger(slice.minX, slice.maxX);
            let holeY = randomInteger(slice.minY, slice.maxY);

            /*
            the coordinates of the hole determines where the wall itself should be
            (horizontal -> equation of the wall is y = holeY,
                vertical -> equation of the wall is x = holeX)

            but the wall cannot be anywhere, so there are constraints on the coordinates of the hole
            that we are fixing right below.
            */

            /*
            we assume that the width and the height (nb of cells) is odd,
            that's to say maxX - minX and maxY - minY are both odd

            that way, we can divide the current slice into two slices that respect this hypothesis
            (for example, 9 cells can be divided into 3 + 1 [width of the wall] + 5)

            this hypothesis is required because we are trying to avoid having "rooms" in the maze,
            that's to say slices that are two cells wide or two cells tall where we can't create walls
            -> with this hypothesis, small slices can only be 1 or 3 wide, no problem in sight here
            */

            if (direction === "vertical") {
                // -> vertical wall -> holeX determines the position of the wall

                // holeX - minX must be odd -> to make sure we create "odd-wide" slices
                if ((holeX - slice.minX) % 2 !== 1) {
                    holeX += Math.random() < 0.5 ? -1 : 1;
                }

                // special cases : the wall can't stick to the sides
                if (holeX <= slice.minX) {
                    holeX = slice.minX + 1;
                }
                if (holeX >= slice.maxX - 1) {
                    // maxX is odd, as our hypothesis states
                    // maxX is excluded of the slice (like length in arrays)
                    // so maxX - 2 is odd too and does not stick to the right side of the labyrinth
                    // also, because we ensured that slices have a width larger than 2 cells
                    // we the wall won't stick to the left side too
                    holeX = slice.maxX - 2;
                }

                /*
                holeY for **horizontal** walls must be odd
                so, to make sure that the holes from the vertical walls won't be closed by the horizontal walls
                    -> and thus to make sure the maze is solvable

                we ensure here that holeY for vertical walls is even
                */
                if ((holeY - slice.minY) % 2 !== 0) {
                    holeY += Math.random() < 0.5 ? -1 : 1;
                    holeY = Math.min(holeY, slice.maxY - 1);
                }
            }
            if (direction === "horizontal") {
                // see vertical if clause for more information

                // holeY - minY must be odd
                if ((holeY - slice.minY) % 2 !== 1) {
                    holeY += Math.random() < 0.5 ? -1 : 1;
                }
                if (holeY <= slice.minY) {
                    holeY = slice.minY + 1;
                }
                if (holeY >= slice.maxY - 1) {
                    holeY = slice.maxY - 2;
                }

                // holeX - minX must be even
                if ((holeX - slice.minX) % 2 !== 0) {
                    holeX += Math.random() < 0.5 ? -1 : 1;
                    holeX = Math.min(holeX, slice.maxX - 1);
                }
            }

            const wallPosition = direction === "horizontal" ? holeY : holeX;
            const holePosition = direction === "horizontal" ? holeX : holeY;

            // finally, alter the grid
            const offset = direction === "horizontal" ? slice.minX : slice.minY;
            for (let l = offset; l < offset + wallLength; l++) {
                if (l === holePosition) continue;

                const x = direction === "horizontal" ? l : wallPosition;
                const y = direction === "horizontal" ? wallPosition : l;

                this.cells[x][y] = "wall";
            }

            // recursively call the function on the smaller slices

            const firstSubSlice = {
                minX: slice.minX,
                minY: slice.minY,
                maxX: direction === "horizontal" ? slice.maxX : wallPosition,
                maxY: direction === "horizontal" ? wallPosition : slice.maxY,
            };
            const secondSubSlice = {
                minX: direction === "horizontal" ? slice.minX : wallPosition + 1,
                minY: direction === "horizontal" ? wallPosition + 1 : slice.minY,
                maxX: slice.maxX,
                maxY: slice.maxY,
            };

            recursiveSubFunction(firstSubSlice);
            recursiveSubFunction(secondSubSlice);
        };

        this.emptyGrid(); // ensures that all cells are correctly initialized
        this.enclose();

        // call the recursive function with the full maze as the "slice"
        recursiveSubFunction({
            minX: 1,
            maxX: this.size - 1,
            minY: 1,
            maxY: this.size - 1,
        });


        this.cells[0][1] = "start";
        this.cells[this.size - 1][this.size - 2] = "exit";
    }
}
