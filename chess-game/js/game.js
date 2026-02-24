// Главный класс игры
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
