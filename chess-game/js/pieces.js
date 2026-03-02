// Базовый класс фигуры
class Piece {
    constructor(color, type, position) {
        this.color = color;      // 'white' или 'black'
        this.type = type;        // 'king', 'queen', 'rook', 'bishop', 'knight', 'pawn'
        this.position = position; // { row, col }
        this.hasMoved = false;    // Для рокировки и пешки
    }

    // Получить возможные ходы (без проверки шаха)
    getValidMoves(board) {
        // Должен быть переопределен в наследниках
        return [];
    }

    // Проверка, что фигура противника
    isOpponent(piece) {
        return piece && piece.color !== this.color;
    }

    // Проверка, что клетка пуста или содержит фигуру противника
    isEmptyOrOpponent(cell) {
        return cell === null || this.isOpponent(cell);
    }

    // Клонирование фигуры
    clone() {
        return new Piece(this.color, this.type, { ...this.position });
    }
}

// Пешка
class Pawn extends Piece {
    constructor(color, position) {
        super(color, 'pawn', position);
    }

    getValidMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1; // Белые вверх (уменьшение row), черные вниз
        const startRow = this.color === 'white' ? 6 : 1;   // Белые начинают с row 6 (2-я горизонталь), черные с row 1 (7-я)
        const row = this.position.row;
        const col = this.position.col;

        // Ход на 1 вперед
        const oneStepRow = row + direction;
        if (Utils.isValidPosition(oneStepRow, col) && board[oneStepRow][col] === null) {
            moves.push({ row: oneStepRow, col, type: 'move' });

            // Ход на 2 вперед с начальной позиции
            if (row === startRow) {
                const twoStepRow = row + direction * 2;
                if (board[twoStepRow][col] === null && board[oneStepRow][col] === null) {
                    moves.push({ row: twoStepRow, col, type: 'move' });
                }
            }
        }

        // Взятие по диагонали
        const captureCols = [col - 1, col + 1];
        for (const c of captureCols) {
            if (Utils.isValidPosition(oneStepRow, c)) {
                const target = board[oneStepRow][c];
                if (target && this.isOpponent(target)) {
                    moves.push({ row: oneStepRow, col: c, type: 'capture' });
                }
            }
        }

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
        const directions = [
            { dr: -1, dc: 0 }, // вверх
            { dr: 1, dc: 0 },  // вниз
            { dr: 0, dc: -1 }, // влево
            { dr: 0, dc: 1 }   // вправо
        ];

        for (const { dr, dc } of directions) {
            let step = 1;
            while (true) {
                const newRow = this.position.row + dr * step;
                const newCol = this.position.col + dc * step;
                if (!Utils.isValidPosition(newRow, newCol)) break;

                const target = board[newRow][newCol];
                if (target === null) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (this.isOpponent(target)) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                    break; // Не можем перепрыгнуть
                } else {
                    break; // Своя фигура
                }
                step++;
            }
        }
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
        const knightMoves = [
            { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
            { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
            { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
            { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
        ];

        for (const { dr, dc } of knightMoves) {
            const newRow = this.position.row + dr;
            const newCol = this.position.col + dc;
            if (Utils.isValidPosition(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (target === null) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (this.isOpponent(target)) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
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
        const moves = [];
        const directions = [
            { dr: -1, dc: -1 }, // вверх-влево
            { dr: -1, dc: 1 },  // вверх-вправо
            { dr: 1, dc: -1 },  // вниз-влево
            { dr: 1, dc: 1 }    // вниз-вправо
        ];

        for (const { dr, dc } of directions) {
            let step = 1;
            while (true) {
                const newRow = this.position.row + dr * step;
                const newCol = this.position.col + dc * step;
                if (!Utils.isValidPosition(newRow, newCol)) break;

                const target = board[newRow][newCol];
                if (target === null) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (this.isOpponent(target)) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                    break;
                } else {
                    break;
                }
                step++;
            }
        }
        return moves;
    }
}

// Ферзь
class Queen extends Piece {
    constructor(color, position) {
        super(color, 'queen', position);
    }

    getValidMoves(board) {
        // Комбинация ладьи и слона
        const rook = new Rook(this.color, this.position);
        const bishop = new Bishop(this.color, this.position);
        return [...rook.getValidMoves(board), ...bishop.getValidMoves(board)];
    }
}

// Король
class King extends Piece {
    constructor(color, position) {
        super(color, 'king', position);
    }

    getValidMoves(board) {
        const moves = [];
        const kingMoves = [
            { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
            { dr: 0, dc: -1 },                     { dr: 0, dc: 1 },
            { dr: 1, dc: -1 },  { dr: 1, dc: 0 },  { dr: 1, dc: 1 }
        ];

        for (const { dr, dc } of kingMoves) {
            const newRow = this.position.row + dr;
            const newCol = this.position.col + dc;
            if (Utils.isValidPosition(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (target === null) {
                    moves.push({ row: newRow, col: newCol, type: 'move' });
                } else if (this.isOpponent(target)) {
                    moves.push({ row: newRow, col: newCol, type: 'capture' });
                }
            }
        }

        // TODO: Рокировка (опционально)
        return moves;
    }
}

// Фабрика для создания фигур
class PieceFactory {
    static createPiece(type, color, position) {
        const pos = typeof position === 'string' ? Utils.fromAlgebraic(position) : position;
        switch (type) {
            case 'pawn': return new Pawn(color, pos);
            case 'rook': return new Rook(color, pos);
            case 'knight': return new Knight(color, pos);
            case 'bishop': return new Bishop(color, pos);
            case 'queen': return new Queen(color, pos);
            case 'king': return new King(color, pos);
            default: return null;
        }
    }
}

// Делаем классы доступными глобально
window.Piece = Piece;
window.Pawn = Pawn;
window.Rook = Rook;
window.Knight = Knight;
window.Bishop = Bishop;
window.Queen = Queen;
window.King = King;
window.PieceFactory = PieceFactory;
