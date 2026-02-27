// Базовый класс для всех шахматных фигур
class Piece {
    constructor(color, type, position) {
        this.color = color;
        this.type = type;
        this.position = position;
        this.hasMoved = false;
        this.symbol = PIECE_SYMBOLS[color][type];
    }

    // Получить все возможные ходы фигуры (без проверки шаха)
    getValidMoves(board) {
        throw new Error('Метод getValidMoves должен быть реализован в наследнике');
    }

    // Проверка, находится ли клетка под атакой фигуры
    isAttacking(board, targetRow, targetCol) {
        const moves = this.getValidMoves(board);
        return moves.some(move => move.row === targetRow && move.col === targetCol);
    }

    // Клонирование фигуры
    clone() {
        const PieceClass = this.constructor;
        const clone = new PieceClass(this.color, this.position);
        clone.hasMoved = this.hasMoved;
        return clone;
    }
}

// Пешка
class Pawn extends Piece {
    constructor(color, position) {
        super(color, 'pawn', position);
    }

    getValidMoves(board) {
        const moves = [];
        const direction = PositionUtils.getPawnDirection(this.color);
        const { row, col } = this.position;
        const startRow = PositionUtils.isPawnStartPosition(this.color, row);

        // Ход вперед на 1 клетку
        const oneStepRow = row + direction;
        if (PositionUtils.isValidPosition(oneStepRow, col) && !board[oneStepRow][col]) {
            moves.push({ row: oneStepRow, col });

            // Ход вперед на 2 клетки с начальной позиции
            const twoStepRow = row + direction * 2;
            if (startRow && !board[oneStepRow][col] && !board[twoStepRow][col]) {
                moves.push({ row: twoStepRow, col });
            }
        }

        // Взятие по диагонали
        const captureCols = [col - 1, col + 1];
        captureCols.forEach(captureCol => {
            const captureRow = row + direction;
            if (PositionUtils.isValidPosition(captureRow, captureCol)) {
                const targetPiece = board[captureRow][captureCol];
                if (targetPiece && targetPiece.color !== this.color) {
                    moves.push({ row: captureRow, col: captureCol });
                }
            }
        });

        // TODO: Взятие на проходе (опционально)

        return moves;
    }
}

// Ладья
class Rook extends Piece {
    constructor(color, position) {
        super(color, 'rook', position);
    }

    getValidMoves(board) {
        const moves = [];
        const { row, col } = this.position;
        const directions = [
            { dr: -1, dc: 0 }, // вверх
            { dr: 1, dc: 0 },  // вниз
            { dr: 0, dc: -1 }, // влево
            { dr: 0, dc: 1 }   // вправо
        ];

        directions.forEach(({ dr, dc }) => {
            let currentRow = row + dr;
            let currentCol = col + dc;

            while (PositionUtils.isValidPosition(currentRow, currentCol)) {
                const targetPiece = board[currentRow][currentCol];

                if (!targetPiece) {
                    // Пустая клетка
                    moves.push({ row: currentRow, col: currentCol });
                } else {
                    // Есть фигура
                    if (targetPiece.color !== this.color) {
                        // Фигура противника - можно взять
                        moves.push({ row: currentRow, col: currentCol });
                    }
                    break; // Столкнулись с фигурой - дальше не идем
                }

                currentRow += dr;
                currentCol += dc;
            }
        });

        return moves;
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
            { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
            { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
            { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
            { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
        ];

        knightMoves.forEach(({ dr, dc }) => {
            const newRow = row + dr;
            const newCol = col + dc;

            if (PositionUtils.isValidPosition(newRow, newCol)) {
                const targetPiece = board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== this.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }
}

// Слон
class Bishop extends Piece {
    constructor(color, position) {
        super(color, 'bishop', position);
    }

    getValidMoves(board) {
        const moves = [];
        const { row, col } = this.position;
        const directions = [
            { dr: -1, dc: -1 }, // вверх-влево
            { dr: -1, dc: 1 },  // вверх-вправо
            { dr: 1, dc: -1 },  // вниз-влево
            { dr: 1, dc: 1 }    // вниз-вправо
        ];

        directions.forEach(({ dr, dc }) => {
            let currentRow = row + dr;
            let currentCol = col + dc;

            while (PositionUtils.isValidPosition(currentRow, currentCol)) {
                const targetPiece = board[currentRow][currentCol];

                if (!targetPiece) {
                    moves.push({ row: currentRow, col: currentCol });
                } else {
                    if (targetPiece.color !== this.color) {
                        moves.push({ row: currentRow, col: currentCol });
                    }
                    break;
                }

                currentRow += dr;
                currentCol += dc;
            }
        });

        return moves;
    }
}

// Ферзь
class Queen extends Piece {
    constructor(color, position) {
        super(color, 'queen', position);
    }

    getValidMoves(board) {
        // Ферзь комбинирует ходы ладьи и слона
        const rookMoves = new Rook(this.color, this.position).getValidMoves(board);
        const bishopMoves = new Bishop(this.color, this.position).getValidMoves(board);
        return [...rookMoves, ...bishopMoves];
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

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;

                const newRow = row + dr;
                const newCol = col + dc;

                if (PositionUtils.isValidPosition(newRow, newCol)) {
                    const targetPiece = board[newRow][newCol];
                    if (!targetPiece || targetPiece.color !== this.color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }

        // TODO: Рокировка (опционально)

        return moves;
    }

    // Проверка, находится ли король под шахом
    isInCheck(board) {
        // Проверяем, атакуют ли фигуры противника позицию короля
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.color !== this.color) {
                    if (piece.isAttacking(board, this.position.row, this.position.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

// Экспортируем классы
window.Piece = Piece;
window.Pawn = Pawn;
window.Rook = Rook;
window.Knight = Knight;
window.Bishop = Bishop;
window.Queen = Queen;
window.King = King;// Базовый класс фигуры
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
