// Главный класс игры
class Game {
    constructor() {
        this.board = new Board();
        this.currentTurn = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        
        // DOM элементы
        this.boardElement = document.getElementById('chessBoard');
        this.turnIndicator = document.getElementById('currentPlayer');
        this.checkIndicator = document.getElementById('checkIndicator');
        this.moveHistoryElement = document.getElementById('moveHistory');
        this.capturedWhiteElement = document.getElementById('capturedWhite');
        this.capturedBlackElement = document.getElementById('capturedBlack');
        this.undoBtn = document.getElementById('undoBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.resignBtn = document.getElementById('resignBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.modalNewGameBtn = document.getElementById('modalNewGameBtn');

        this.init();
    }

    // Инициализация игры
    init() {
        this.board.setupInitialPosition();
        this.renderBoard();
        this.setupEventListeners();
        this.updateTurnIndicator();
        this.updateUI();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Используем делегирование событий для доски
        this.boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;

            const cell = e.target.closest('.cell');
            if (!cell) return;

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.handleCellClick(row, col);
        });

        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.resignBtn.addEventListener('click', () => this.resign());
        this.modalNewGameBtn.addEventListener('click', () => {
            this.gameOverModal.style.display = 'none';
            this.resetGame();
        });
    }

    // Обработка клика по клетке
    handleCellClick(row, col) {
        const piece = this.board.getPiece(row, col);
        
        // Если есть выбранная фигура и клетка в списке возможных ходов
        if (this.board.selectedPiece) {
            const isValidMove = this.board.validMoves.some(
                move => move.row === row && move.col === col
            );

            if (isValidMove) {
                this.makeMove(this.board.selectedPiece.position.row, 
                             this.board.selectedPiece.position.col, row, col);
                return;
            }
        }

        // Выбор новой фигуры
        if (piece && piece.color === this.currentTurn) {
            this.selectPiece(row, col);
        } else {
            this.deselectPiece();
        }
    }

    // Выбор фигуры
    selectPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.currentTurn) return;

        this.board.selectedPiece = piece;
        this.board.validMoves = this.board.getLegalMoves(row, col);
        
        this.renderBoard();
        this.highlightSelectedPiece(row, col);
        this.highlightValidMoves();
    }

    // Снятие выделения с фигуры
    deselectPiece() {
        this.board.clearSelection();
        this.renderBoard();
    }

    // Выполнение хода
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board.getPiece(fromRow, fromCol);
        const capturedPiece = this.board.getPiece(toRow, toCol);
        
        // Сохраняем состояние для отмены
        const moveRecord = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece,
            turn: this.currentTurn
        };

        // Выполняем ход
        const captured = this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        if (captured) {
            this.capturedPieces[this.currentTurn].push(captured);
        }

        // Проверяем состояние игры
        if (this.board.isInCheckmate(this.currentTurn === 'white' ? 'black' : 'white')) {
            this.gameOver = true;
            this.showGameOver(`${this.currentTurn === 'white' ? 'Белые' : 'Черные'} победили! Мат!`);
        } else if (this.board.isStalemate(this.currentTurn === 'white' ? 'black' : 'white')) {
            this.gameOver = true;
            this.showGameOver('Ничья! Пат!');
        }

        // Добавляем ход в историю
        this// Главный класс игры
class Game {
    constructor() {
        this.board = new Board();
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        
        this.init();
    }

    // Инициализация игры
    init() {
        this.board.setupInitialPosition();
        this.setupEventListeners();
        this.updateUI();
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Делегирование событий для доски
        this.board.boardElement.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.handleCellClick(row, col);
        });

        // Кнопка новой игры
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.resetGame();
        });

        // Кнопка отмены хода
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoLastMove();
        });
    }

    // Обработка клика по клетке
    handleCellClick(row, col) {
        const piece = this.board.cells[row][col];
        
        // Если есть выбранная фигура и клетка в списке возможных ходов
        if (this.board.selectedCell) {
            if (this.board.validMoves.some(move => move.row === row && move.col === col)) {
                this.makeMove(this.board.selectedCell.row, this.board.selectedCell.col, row, col);
            } else {
                // Если кликнули на другую свою фигуру
                if (piece && piece.color === this.currentPlayer) {
                    this.board.selectPiece(row, col, this.currentPlayer);
                } else {
                    this.board.deselectPiece();
                }
            }
        } else {
            // Выбор фигуры
            if (piece && piece.color === this.currentPlayer) {
                this.board.selectPiece(row, col, this.currentPlayer);
            }
        }
    }

    // Совершение хода
    makeMove(fromRow, fromCol, toRow, toCol) {
        const moveResult = this.board.movePiece(fromRow, fromCol, toRow, toCol);
        
        if (moveResult) {
            // Добавляем в историю
            this.moveHistory.push(moveResult);
            
            // Добавляем взятую фигуру
            if (moveResult.captured) {
                this.capturedPieces[this.currentPlayer].push(moveResult.captured);
            }
            
            // Проверяем шах и мат
            const opponent = this.currentPlayer === 'white' ? 'black' : 'white';
            
            if (this.board.isCheckmate(opponent)) {
                this.gameOver = true;
                Utils.showNotification(`Мат! Победили ${this.currentPlayer === 'white' ? 'белые' : 'черные'}!`, 'success');
            } else if (this.board.isInCheck(opponent)) {
                Utils.showNotification('Шах!', 'warning');
            }
            
            // Смена игрока
            this.currentPlayer = opponent;
            this.updateUI();
            
            // Подсвечиваем шах
            this.board.highlightCheck();
        }
    }

    // Обновление интерфейса
    updateUI() {
        // Обновляем индикатор хода
        const turnElement = document.querySelector('.turn-player');
        turnElement.textContent = this.currentPlayer === 'white' ? 'Белые' : 'Черные';
        turnElement.className = `turn-player ${this.currentPlayer === 'white' ? 'white-turn' : 'black-turn'}`;
        
        // Обновляем захваченные фигуры
        this.updateCapturedPieces();
        
        // Обновляем историю ходов
        this.updateMoveHistory();
    }

    // Обновление захваченных фигур
    updateCapturedPieces() {
        const whiteCaptured = document.querySelector('.captured-white');
        const blackCaptured = document.querySelector('.captured-black');
        
        whiteCaptured.innerHTML = this.capturedPieces.black
            .map(piece => `<span>${piece.getSymbol()}</span>`)
            .join('');
        
        blackCaptured.innerHTML = this.capturedPieces.white
            .map(piece => `<span>${piece.getSymbol()}</span>`)
            .join('');
