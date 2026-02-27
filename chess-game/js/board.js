// Класс для управления шахматной доской
class Board {
    constructor() {
        this.cells = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
    }

    // Инициализация пустой доски
    initializeBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                board[row][col] = null;
            }
        }
        return board;
    }

    // Установка начальной позиции
    setupInitialPosition() {
        // Белые фигуры (1-я и 2-я горизонтали)
        this.cells[7][0] = new Rook('white', { row: 7, col: 0 });
        this.cells[7][1] = new Knight('white', { row: 7, col: 1 });
        this.cells[7][2] = new Bishop('white', { row: 7, col: 2 });
        this.cells[7][3] = new Queen('white', { row: 7, col: 3 });
        this.cells[7][4] = new King('white', { row: 7, col: 4 });
        this.cells[7][5] = new Bishop('white', { row: 7, col: 5 });
        this.cells[7][6] = new Knight('white', { row: 7, col: 6 });
        this.cells[7][7] = new Rook('white', { row: 7, col: 7 });

        for (let col = 0; col < 8; col++) {
            this.cells[6][col] = new Pawn('white', { row: 6, col });
        }

        // Черные фигуры (7-я и 8-я горизонтали)
        this.cells[0][0] = new Rook('black', { row: 0, col: 0 });
        this.cells[0][1] = new Knight('black', { row: 0, col: 1 });
        this.cells[0][2] = new Bishop('black', { row: 0, col: 2 });
        this.cells[0][3] = new Queen('black', { row: 0, col: 3 });
        this.cells[0][4] = new King('black', { row: 0, col: 4 });
        this.cells[0][5] = new Bishop('black', { row: 0, col: 5 });
        this.cells[0][6] = new Knight('black', { row: 0, col: 6 });
        this.cells[0][7] = new Rook('black', { row: 0, col: 7 });

        for (let col = 0; col < 8; col++) {
            this.cells[1][col] = new Pawn('black', { row: 1, col });
        }
    }

    // Получение фигуры по координатам
    getPiece(row, col) {
        if (!PositionUtils.isValidPosition(row, col)) return null;
        return this.cells[row][col];
    }

    // Установка фигуры на доску
    setPiece(row, col, piece) {
        if (!PositionUtils.isValidPosition(row, col)) return false;
        this.cells[row][col] = piece;
        if (piece) {
            piece.position = { row, col };
        }
        return true;
    }

    // Перемещение фигуры
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return null;

        const capturedPiece = this.getPiece(toRow, toCol);
        
        // Перемещаем фигуру
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        // Отмечаем, что фигура двигалась
        piece.hasMoved = true;

        // TODO: Превращение пешки (опционально)

        return capturedPiece;
    }

    // Получение всех легальных ходов для фигуры (с учетом шаха)
    getLegalMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        const allMoves = piece.getValidMoves(this.cells);
        
        // Фильтруем ходы, которые оставляют короля под шахом
        const legalMoves = allMoves.filter(move => {
            return !this.wouldBeInCheck(piece, move.row, move.col);
        });

        return legalMoves;
    }

    // Проверка, будет ли король под шахом после хода
    wouldBeInCheck(piece, toRow, toCol) {
        const { row, col } = piece.position;
        
        // Сохраняем текущее состояние
        const targetPiece = this.getPiece(toRow, toCol);
        
        // Выполняем ход на копии доски
        const boardCopy = new Board();
        boardCopy.cells = PositionUtils.deepCopyBoard(this.cells);
        
        // Перемещаем фигуру
        boardCopy.setPiece(toRow, toCol, boardCopy.getPiece(row, col));
        boardCopy.setPiece(row, col, null);
        
        // Находим короля текущего игрока
        const king = this.findKing(boardCopy, piece.color);
        if (!king) return true;
        
        // Проверяем, находится ли король под атакой
        return this.isSquareAttacked(boardCopy, king.position.row, king.position.col, piece.color);
    }

    // Поиск короля на доске
    findKing(board, color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.cells[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return piece;
                }
            }
        }
        return null;
    }

    // Проверка, атакована ли клетка фигурами противника
    isSquareAttacked(board, row, col, defendingColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board.cells[r][c];
                if (piece && piece.color !== defendingColor) {
                    const moves = piece.getValidMoves(board.cells);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Проверка, находится ли король текущего игрока под шахом
    isInCheck(color) {
        const king = this.findKing(this, color);
        if (!king) return false;
        
        return this.isSquareAttacked(this, king.position.row, king.position.col, color);
    }

    // Проверка на мат
    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Проверяем, есть ли у игрока легальные ходы
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece && piece.color === color) {
                    const legalMoves = this.getLegalMoves(row, col);
                    if (legalMoves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Проверка на пат
    isStalemate(color) {
        if (this.isInCheck(color)) return false;

        // Проверяем, есть ли у игрока легальные ходы
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.cells[row][col];
                if (piece && piece.color === color) {
                    const legalMoves = this.getLegalMoves(row, col);
                    if (legalMoves.length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Очистка выделения
    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
    }

    // Клонирование доски
    clone() {
        const newBoard = new Board();
        newBoard.cells = PositionUtils.deepCopyBoard(this.cells);
        return newBoard;
    }
}

window.Board = Board;// Класс доски
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
