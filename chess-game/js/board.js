class Board {
    constructor() {
        this.grid = this.initializeEmptyBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.checkPosition = null; // Позиция короля под шахом
    }

    // Создание пустой доски 8x8
    initializeEmptyBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = Array(8).fill(null);
        }
        return board;
    }

    // Начальная расстановка фигур
    setupInitialPosition() {
        this.grid = this.initializeEmptyBoard();

        // Черные фигуры (верх, row 0-1)
        this.grid[0][0] = new Rook('black', { row: 0, col: 0 });
        this.grid[0][1] = new Knight('black', { row: 0, col: 1 });
        this.grid[0][2] = new Bishop('black', { row: 0, col: 2 });
        this.grid[0][3] = new Queen('black', { row: 0, col: 3 });
        this.grid[0][4] = new King('black', { row: 0, col: 4 });
        this.grid[0][5] = new Bishop('black', { row: 0, col: 5 });
        this.grid[0][6] = new Knight('black', { row: 0, col: 6 });
        this.grid[0][7] = new Rook('black', { row: 0, col: 7 });

        for (let col = 0; col < 8; col++) {
            this.grid[1][col] = new Pawn('black', { row: 1, col });
        }

        // Белые фигуры (низ, row 6-7)
        for (let col = 0; col < 8; col++) {
            this.grid[6][col] = new Pawn('white', { row: 6, col });
        }

        this.grid[7][0] = new Rook('white', { row: 7, col: 0 });
        this.grid[7][1] = new Knight('white', { row: 7, col: 1 });
        this.grid[7][2] = new Bishop('white', { row: 7, col: 2 });
        this.grid[7][3] = new Queen('white', { row: 7, col: 3 });
        this.grid[7][4] = new King('white', { row: 7, col: 4 });
        this.grid[7][5] = new Bishop('white', { row: 7, col: 5 });
        this.grid[7][6] = new Knight('white', { row: 7, col: 6 });
        this.grid[7][7] = new Rook('white', { row: 7, col: 7 });

        this.selectedPiece = null;
        this.validMoves = [];
        this.checkPosition = null;
    }

    // Получить фигуру по координатам
    getPiece(row, col) {
        return Utils.isValidPosition(row, col) ? this.grid[row][col] : null;
    }

    // Установить фигуру
    setPiece(row, col, piece) {
        if (Utils.isValidPosition(row, col)) {
            this.grid[row][col] = piece;
            if (piece) {
                piece.position = { row, col };
            }
        }
    }

    // Переместить фигуру
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece) return false;

        // Сохраняем для истории
        const captured = this.getPiece(toRow, toCol);

        // Перемещаем
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        piece.hasMoved = true;

        // Проверка на превращение пешки
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.promotePawn(toRow, toCol, piece.color);
        }

        return captured;
    }

    // Превращение пешки (по умолчанию в ферзя)
    promotePawn(row, col, color) {
        const queen = new Queen(color, { row, col });
        this.setPiece(row, col, queen);
    }

    // Получить все фигуры определенного цвета
    getPiecesByColor(color) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.color === color) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }

    // Найти короля
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.grid[row][col];
                if (piece && piece.color === color && piece.type === 'king') {
                    return { row, col, piece };
                }
            }
        }
        return null;
    }

    // Проверка, находится ли король под шахом
    isInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        const opponentPieces = this.getPiecesByColor(opponentColor);

        // Проверяем, атакует ли какая-либо фигура противника позицию короля
        for (const piece of opponentPieces) {
            const moves = piece.getValidMoves(this.grid);
            if (moves.some(move => move.row === king.row && move.col === king.col)) {
                this.checkPosition = { row: king.row, col: king.col };
                return true;
            }
        }

        this.checkPosition = null;
        return false;
    }

    // Проверка, будет ли король под шахом после хода
    wouldBeInCheck(piece, toRow, toCol) {
        // Симулируем ход на копии доски
        const boardCopy = new Board();
        boardCopy.grid = Utils.copyBoard(this.grid);
        
        const fromPos = piece.position;
        const targetPiece = boardCopy.getPiece(toRow, toCol);
        
        // Выполняем ход
        boardCopy.setPiece(toRow, toCol, boardCopy.getPiece(fromPos.row, fromPos.col));
        boardCopy.setPiece(fromPos.row, fromPos.col, null);
        
        // Проверяем шах для цвета фигуры
        return boardCopy.isInCheck(piece.color);
    }

    // Получить все легальные ходы для фигуры (с учетом шаха)
    getLegalMoves(piece) {
        if (!piece) return [];
        
        const allMoves = piece.getValidMoves(this.grid);
        
        // Фильтруем ходы, которые оставляют короля под шахом
        return allMoves.filter(move => !this.wouldBeInCheck(piece, move.row, move.col));
    }

    // Проверка на мат
    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        const pieces = this.getPiecesByColor(color);
        for (const piece of pieces) {
            const legalMoves = this.getLegalMoves(piece);
            if (legalMoves.length > 0) return false;
        }

        return true; // Нет легальных ходов, но король под шахом -> мат
    }

    // Проверка на пат
    isStalemate(color) {
        if (this.isInCheck(color)) return false;

        const pieces = this.getPiecesByColor(color);
        for (const piece of pieces) {
            const legalMoves = this.getLegalMoves(piece);
            if (legalMoves.length > 0) return false;
        }

        return true; // Нет легальных ходов, король не под шахом -> пат
    }
}

window.Board = Board;
