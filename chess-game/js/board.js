// Класс доски
class Board {
    constructor() {
        this.cells = Array(8).fill().map(() => Array(8).fill(null));
        this.boardElement = document.getElementById('chessBoard');
        this.selectedCell = null;
        this.validMoves = [];
    }

    // Инициализация начальной позиции
    setupInitialPosition() {
        // Очищаем доску
        this.cells = Array(8).fill().map(() => Array(8).fill(null));

        // Расставляем пешки
        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', { row: 1, col });
            this.cells[6][col] = new Pawn('white', { row: 6, col });
        }

        // Расставляем остальные фигуры
        const backRank = [
            Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook
        ];

        for (let col = 0; col < 8; col++) {
            // Черные фигуры (8-я горизонталь)
            this.cells[0][col] = new backRank[col]('black', { row: 0, col });
            // Белые фигуры (1-я горизонталь)
            this.cells[7][col] = new backRank[col]('white', { row: 7, col });
        }

        this.render();
    }

    // Отрисовка доски
    render() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.notation = Utils.indicesToNotation(row, col);

                const piece = this.cells[row][col];
                if (piece) {
                    cell.textContent = piece.getSymbol();
                }

                // Добавляем классы для выделения
                if (this.selectedCell && 
                    this.selectedCell.row === row && 
                    this.selectedCell.col === col) {
                    cell.classList.add('selected');
                }

                // Подсветка возможных ходов
                if (this.validMoves.some(move => move.row === row && move.col === col)) {
                    if (this.cells[row][col]) {
                        cell.classList.add('valid-capture');
                    } else {
                        cell.classList.add('valid-move');
                    }
                }

                this.boardElement.appendChild(cell);
            }
        }
    }

    // Выбор фигуры
    selectPiece(row, col, currentPlayer) {
        const piece = this.cells[row][col];
        
        if (piece && piece.color === currentPlayer) {
            this.selectedCell = { row, col };
            this.validMoves = piece.getValidMoves(this.cells);
            this.render();
            return true;
        }
        
        return false;
    }

    // Снятие выделения
    deselectPiece() {
        this.selectedCell = null;
        this.validMoves = [];
        this.render();
    }

    // Перемещение фигуры
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.cells[fromRow][fromCol];
        
        if (!piece) return false;

        // Сохраняем информацию о ходе
        const capturedPiece = this.cells[toRow][toCol];
        
        // Перемещаем фигуру
        this.cells[toRow][toCol] = piece;
        this.cells[fromRow][fromCol] = null;
        
        // Обновляем позицию фигуры
        piece.position = { row: toRow, col: toCol };
        piece.hasMoved = true;

        this.deselectPiece();
        
        return {
            piece,
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            captured: capturedPiece
        };
    }

    // Получение короля определенного цвета
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Проверка, находится ли король под шахом
    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;

        // Проверяем, атакует ли какая-либо фигура противника позицию короля
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece && piece.color !== color) {
                    const moves = piece.getValidMoves(this.cells);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    // Проверка на мат
    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Проверяем, есть ли ход, который выводит из-под шаха
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece && piece.color === color) {
                    const moves = piece.getValidMoves(this.cells);
                    
                    for (const move of moves) {
                        // Пробуем сделать ход и проверяем, не остался ли король под шахом
                        const testBoard = new Board();
                        testBoard.cells = Utils.cloneBoard(this.cells);
                        
                        // Временно перемещаем фигуру
                        testBoard.cells[move.row][move.col] = testBoard.cells[row][col];
                        testBoard.cells[row][col] = null;
                        
                        if (!testBoard.isInCheck(color)) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }

    // Подсветка шаха
    highlightCheck() {
        const whiteKing = this.findKing('white');
        const blackKing = this.findKing('black');
        
        if (whiteKing && this.isInCheck('white')) {
            const cell = document.querySelector(`[data-row="${whiteKing.row}"][data-col="${whiteKing.col}"]`);
            if (cell) cell.classList.add('in-check');
        }
        
        if (blackKing && this.isInCheck('black')) {
            const cell = document.querySelector(`[data-row="${blackKing.row}"][data-col="${blackKing.col}"]`);
            if (cell) cell.classList.add('in-check');
        }
    }
}
