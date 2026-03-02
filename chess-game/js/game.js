class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.capturedWhite = [];
        this.capturedBlack = [];
        this.selectedPosition = null;
        
        this.boardElement = document.getElementById('chessboard');
        this.turnIndicator = document.getElementById('current-turn');
        this.moveListElement = document.getElementById('move-list');
        this.checkMessageElement = document.getElementById('check-message');
        this.gameOverMessageElement = document.getElementById('game-over-message');
        this.undoBtn = document.getElementById('undo-btn');
        this.resignBtn = document.getElementById('resign-btn');
        
        this.init();
    }

    init() {
        this.board.setupInitialPosition();
        this.renderBoard();
        this.attachEventListeners();
        this.updateTurnIndicator();
        this.updateButtons();
        this.updateCapturedPieces();
    }

    attachEventListeners() {
        // Делегирование событий на доску
        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        
        document.getElementById('new-game-btn').addEventListener('click', () => this.newGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('resign-btn').addEventListener('click', () => this.resign());
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.position = Utils.toAlgebraic(row, col);
                
                const piece = this.board.getPiece(row, col);
                if (piece) {
                    cell.textContent = Utils.getPieceSymbol(piece);
                    cell.classList.add(piece.color === 'white' ? 'white-piece' : 'black-piece');
                }
                
                // Подсветка возможных ходов
                if (this.board.validMoves) {
                    const move = this.board.validMoves.find(m => m.row === row && m.col === col);
                    if (move) {
                        cell.classList.add(move.type === 'capture' ? 'highlight-capture' : 'highlight-move');
                    }
                }
                
                // Подсветка шаха
                if (this.board.checkPosition && 
                    this.board.checkPosition.row === row && 
                    this.board.checkPosition.col === col) {
                    cell.classList.add('check');
                }
                
                this.boardElement.appendChild(cell);
            }
        }
    }

    handleCellClick(e) {
        if (this.gameOver) return;

        const cell = e.target.closest('.cell');
        if (!cell) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const piece = this.board.getPiece(row, col);

        // Если есть выбранная фигура и клик по подсвеченной клетке - ход
        if (this.selectedPosition && this.isValidMove(row, col)) {
            this.makeMove(this.selectedPosition.row, this.selectedPosition.col, row, col);
        } 
        // Иначе выбор фигуры
        else if (piece && piece.color === this.currentPlayer && !this.gameOver) {
            this.selectPiece(row, col);
        } else {
            this.deselectPiece();
        }
    }

    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentPlayer) return;

        this.deselectPiece(); // Снимаем предыдущее выделение
        
        this.selectedPosition = { row, col };
        
        // Получаем легальные ходы (с учетом шаха)
        const legalMoves = this.board.getLegalMoves(piece);
        this.board.validMoves = legalMoves;
        
        this.renderBoard();
        
        // Добавляем класс выделения
        const selectedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (selectedCell) selectedCell.classList.add('selected');
    }

    deselectPiece() {
        this.selectedPosition = null;
        this.board.validMoves = [];
        this.renderBoard();
    }

    isValidMove(row, col) {
        return this.board.validMoves.some(move => move.row === row && move.col === col);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board.getPiece(fromRow, fromCol);
        if (!piece) return false;

        const captured = this.board.getPiece(toRow, toCol);
        
        // Сохраняем состояние для отмены хода
        const moveRecord = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: captured,
            oldCurrentPlayer: this.currentPlayer,
            oldCastlingRights: { ...this.castlingRights } // Если реализовано
        };
        
        // Выполняем ход
        this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        // Обновляем захваченные фигуры
        if (captured) {
            if (captured.color === 'white') {
                this.capturedWhite.push(captured);
            } else {
                this.capturedBlack.push(captured);
            }
            this.updateCapturedPieces();
        }

        // Запись в историю
        const moveNotation = this.getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured);
        moveRecord.notation = moveNotation;
        this.moveHistory.push(moveRecord);
        this.updateMoveHistory();

        // Проверка на шах
        const opponentColor = this.currentPlayer === 'white' ? 'black' : 'white';
        if (this.board.isInCheck(opponentColor)) {
            this.showCheckMessage(opponentColor);
        } else {
            this.hideCheckMessage();
        }

        // Проверка на мат или пат
        if (this.board.isCheckmate(opponentColor)) {
            this.endGame(`${this.currentPlayer === 'white' ? 'Белые' : 'Черные'} выиграли матом!`);
        } else if (this.board.isStalemate(opponentColor)) {
            this.endGame('Ничья (пат)');
        }

        // Смена игрока
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.updateTurnIndicator();
        
        // Снимаем выделение
        this.deselectPiece();
        
        // Обновляем кнопки
        this.updateButtons();
        
        return true;
    }

    getMoveNotation(piece, fromRow, fromCol, toRow, toCol, captured) {
        const files = 'abcdefgh';
        const fromFile = files[fromCol];
        const fromRank = 8 - fromRow;
        const toFile = files[toCol];
        const toRank = 8 - toRow;
        
        let notation = '';
        
        // Символ фигуры (кроме пешки)
        if (piece.type !== 'pawn') {
            const symbols = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N' };
            notation += symbols[piece.type] || '';
        }
        
        // Для пешек при взятии
        if (piece.type === 'pawn' && captured) {
            notation += fromFile;
        }
        
        // Символ взятия
        if (captured) notation += 'x';
        
        // Клетка назначения
        notation += toFile + toRank;
        
        // Шах или мат (будут добавлены позже)
        return notation;
    }

    updateMoveHistory() {
        this.moveListElement.innerHTML = '';
        
        this.moveHistory.forEach((move, index) => {
            const moveItem = document.createElement('span');
            moveItem.className = `move-item ${index % 2 === 0 ? 'white-move' : 'black-move'}`;
            moveItem.textContent = `${Math.floor(index / 2) + 1}.${index % 2 === 0 ? '' : '..'} ${move.notation}`;
            this.moveListElement.appendChild(moveItem);
        });
        
        // Скролл вниз
        this.moveListElement.scrollTop = this.moveListElement.scrollHeight;
    }

    updateCapturedPieces() {
        const whiteCapturedElement = document.querySelector('.captured-white');
        const blackCapturedElement = document.querySelector('.captured-black');
        
        whiteCapturedElement.innerHTML = this.capturedWhite.map(p => 
            `<span class="black-piece">${Utils.getPieceSymbol(p)}</span>`
        ).join('');
        
        blackCapturedElement.innerHTML = this.capturedBlack.map(p => 
            `<span class="white-piece">${Utils.getPieceSymbol(p)}</span>`
        ).join('');
    }

    showCheckMessage(color) {
        this.checkMessageElement.classList.remove('hidden');
        setTimeout(() => {
            this.hideCheckMessage();
        }, 2000);
    }

    hideCheckMessage() {
        this.checkMessageElement.classList.add('hidden');
    }

    endGame(message) {
        this.gameOver = true;
        this.gameOverMessageElement.textContent = message;
        this.gameOverMessageElement.classList.remove('hidden');
        this.updateButtons();
        
        setTimeout(() => {
            this.gameOverMessageElement.classList.add('hidden');
        }, 5000);
    }

    updateTurnIndicator() {
        this.turnIndicator.textContent = this.currentPlayer === 'white' ? 'Белые' : 'Черные';
        this.turnIndicator.className = this.currentPlayer === 'white' ? 'turn-white' : 'turn-black';
    }

    updateButtons() {
        this.undoBtn.disabled = this.moveHistory.length === 0 || this.gameOver;
        this.resignBtn.disabled = this.gameOver;
    }

    newGame() {
        this.board.setupInitialPosition();
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.capturedWhite = [];
        this.capturedBlack = [];
        this.selectedPosition = null;
        
        this.renderBoard();
        this.updateTurnIndicator();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateButtons();
        this.hideCheckMessage();
    }

    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Отменяем ход
        this.board.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
        this.board.setPiece(lastMove.to.row, lastMove.to.col, lastMove.captured);
        
        // Восстанавливаем захваченную фигуру
        if (lastMove.captured) {
            if (lastMove.captured.color === 'white') {
                this.capturedWhite.pop();
            } else {
                this.capturedBlack.pop();
            }
        }
        
        // Возвращаем ход текущему игроку
        this.currentPlayer = lastMove.oldCurrentPlayer;
        
        // Обновляем отображение
        this.renderBoard();
        this.updateTurnIndicator();
        this.updateMoveHistory();
        this.updateCapturedPieces();
        this.updateButtons();
        
        // Снимаем выделение
        this.deselectPiece();
    }

    resign() {
        const winner = this.currentPlayer === 'white' ? 'Черные' : 'Белые';
        this.endGame(`${winner} выиграли (сдача)`);
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
