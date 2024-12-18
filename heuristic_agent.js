// Heuristic evaluation function
function evaluateBoard(boardAfterMove) {
    let aggregateHeight = 0;
    let completeLines = 0;
    let holes = 0;
    let bumpiness = 0;
    let columnHeights = new Array(nx).fill(0);
    let maxHeightIsLow = true;

    // Calculate aggregate height and column heights
    for (let x = 0; x < nx; x++) {
        for (let y = 0; y < ny; y++) {
            if (boardAfterMove[x][y] !== 0) {
                columnHeights[x] = ny - y;
                aggregateHeight += columnHeights[x];
                if (columnHeights[x] > 5) {
                    maxHeightIsLow = false;
                }
                break;
            }
        }
    }

    // Calculate complete lines
    for (let y = 0; y < ny; y++) {
        var complete = true;
        for (let x = 0; x < nx; x++) {
            if (boardAfterMove[x][y] === 0) {
                complete = false;
                break;
            }
        }
        if (complete)
            completeLines++;
    }

    // Calculate holes
    for (let x = 0; x < nx; x++) {
        let blockFound = false;
        for (let y = 0; y < ny; y++) {
            if (boardAfterMove[x][y] !== 0) {
                blockFound = true;
            } else if (blockFound && boardAfterMove[x][y] === 0) {
                holes++;
            }
        }
    }

    // Calculate bumpiness
    for (let x = 0; x < nx - 1; x++) {
        bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
    }

    let oldLeftColumnHeight = 0;
    for (let y = 0; y < ny; y++) {
        if (blocks[0][y] !== 0) {
            oldLeftColumnHeight = ny - y;
        }
    }

    // Combine features into a heuristic score
    let score = weights.aggregateHeight * aggregateHeight + weights.completeLines * completeLines +
        weights.holes * holes + weights.bumpiness * bumpiness;
    if (maxHeightIsLow && oldLeftColumnHeight < columnHeights[0] && holes === 0 && completeLines === 0) {
        score -= 4;
    }
    return score;
}

// Generate all possible moves for the current piece
function getPossibleMoves(piece) {
    let moves = [];
    // For each rotation of the piece
    for (let dir = 0; dir < 4; dir++) {
        piece.dir = dir;
        // For each horizontal position
        for (let x = -4; x < nx; x++) {
            let fits = true;
            eachblock(piece.type, x, 0, piece.dir, function(x, _) {
                if ((x < 0) || (x >= nx)) {
                    fits = false
                }
            })
            if (!fits) {
                continue;
            }
            let y = getDropPosition(piece, x);
            let new_blocks = structuredClone(blocks);
            eachblock(piece.type, x, y, piece.dir, function(x, y) {
                new_blocks[x][y] = piece.type;
            });
            moves.push({piece: structuredClone(piece), x: x, y: y, board: new_blocks});
        }
    }
    return moves;
}

// Select the best move based on heuristic evaluation
function selectBestMove(piece) {
    let moves = getPossibleMoves(piece);
    let bestMove = null;
    let bestScore = -Infinity;
    moves.forEach(move => {
        let score = evaluateBoard(move.board);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    return bestMove;
}

// Function to get the drop position of the piece
function getDropPosition(piece, x) {
    let y = 0;
    while (!occupied(piece.type, x, y + 1, piece.dir)) {
        y++;
    }
    return y;
}
