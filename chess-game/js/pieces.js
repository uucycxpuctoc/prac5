// Базовый класс фигуры
class Piece {
    constructor(color, type, position) {
        this.color = color;
        this.type = type;
        this.position = position; // { row, col }
        this.hasMoved = false;
    }

    getSymbol() {
        return PIECE_SYMBOLS[this.color][this.type];
    }

    // Базовый метод для получения возможных ходов (будет переопределен)
    getValidMoves(board) {
        return [];
    }

    // Проверка, может ли фигура двигаться по прямой (для ладьи, слона, ферзя)
    getLinearMoves(board, directions) {
        const moves = [];
        const { row, col } = this.position;

        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;

            while (Utils.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];

                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }

                newRow += rowDir;
                newCol += colDir;
            }
        }

        return moves;
    }
}

// Пешка
class Pawn extends Piece {
    constructor(color, position) {
        super(color, 'pawn', position);
    }

    getValidMoves(board) {
        const moves = [];
        const { row, col } = this.position;
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // Ход вперед на 1 клетку
        if (Utils.isValidPosition(row + direction, col) && !board[row + direction][col]) {
            moves.push({ row: row + direction, col });

            // Ход вперед на 2 клетки с начальной позиции
            if (row === startRow && 
                Utils.isValidPosition(row + 2 * direction, col) && 
                !board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Взятие по диагонали
        const captureCols = [col - 1, col + 1];
        for (const newCol of captureCols) {
            if (Utils.isValidPosition(row + direction, newCol)) {
                const targetPiece = board[row + direction][newCol];
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push({ row: row + direction, col: newCol });
                }
            }
        }

        return moves;
    }
}

// Ладья
class Rook extends Piece {
    constructor(color, position) {
        super(color, 'rook', position);
    }

    getValidMoves(board) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // вверх, вниз, влево, вправо
        ];
        return this.getLinearMoves(board, directions);
    }
}

// Конь
class Knight extends Piece {
    constructor(color, position) {
        super(color, 'knight', position);
    }

    getValidMoves(board) {
        const moves = [];
        const { row, col } = this.position;
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [rowOffset, colOffset] of knightMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (Utils.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }
}

// Слон
class Bishop extends Piece {
    constructor(color, position) {
        super(color, 'bishop', position);
    }

    getValidMoves(board) {
        const directions = [
            [-1, -1], [-1, 1], [1, -1], [1, 1] // диагонали
        ];
        return this.getLinearMoves(board, directions);
    }
}

// Ферзь
class Queen extends Piece {
    constructor(color, position) {
        super(color, 'queen', position);
    }

    getValidMoves(board) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // вертикаль/горизонталь
            [-1, -1], [-1, 1], [1, -1], [1, 1] // диагонали
        ];
        return this.getLinearMoves(board, directions);
    }
}

// Король
class King extends Piece {
    constructor(color, position) {
        super(color, 'king', position);
    }

    getValidMoves(board) {
        const moves = [];
        const { row, col } = this.position;
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [rowOffset, colOffset] of kingMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (Utils.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }
}
