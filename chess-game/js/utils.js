// Вспомогательные функции для работы с шахматной доской

// Конвертация координат между форматами (row, col) и шахматной нотацией
const PositionUtils = {
    // Конвертирует числовые координаты в шахматную нотацию (row, col) -> (a1-h8)
    toChessNotation(row, col) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rank = 8 - row;
        return `${files[col]}${rank}`;
    },

    // Конвертирует шахматную нотацию в числовые координаты (a1-h8) -> (row, col)
    fromChessNotation(notation) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const file = notation[0];
        const rank = parseInt(notation[1]);
        return {
            row: 8 - rank,
            col: files.indexOf(file)
        };
    },

    // Проверяет, находятся ли координаты в пределах доски
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },

    // Создает глубокую копию двумерного массива
    deepCopyBoard(board) {
        return board.map(row => [...row]);
    },

    // Форматирует ход для истории
    formatMove(from, to, piece, captured) {
        const fromNotation = PositionUtils.toChessNotation(from.row, from.col);
        const toNotation = PositionUtils.toChessNotation(to.row, to.col);
        const pieceSymbol = piece.symbol;
        const captureSymbol = captured ? '×' : '';
        return `${pieceSymbol}${fromNotation}${captureSymbol}${toNotation}`;
    },

    // Получает цвет клетки по координатам
    getSquareColor(row, col) {
        return (row + col) % 2 === 0 ? 'light' : 'dark';
    },

    // Проверяет, является ли позиция начальной для пешки
    isPawnStartPosition(color, row) {
        return (color === 'white' && row === 6) || (color === 'black' && row === 1);
    },

    // Получает направление движения пешки (белые вверх, черные вниз)
    getPawnDirection(color) {
        return color === 'white' ? -1 : 1;
    }
};

// Константы для Unicode символов фигур
const PIECE_SYMBOLS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Веса фигур для оценки позиции
const PIECE_VALUES = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
};

// Экспортируем для использования в других файлах
window.PositionUtils = PositionUtils;
window.PIECE_SYMBOLS = PIECE_SYMBOLS;
window.PIECE_VALUES = PIECE_VALUES;// Вспомогательные функции

// Конвертация координат
const Utils = {
    // Конвертация из шахматной нотации (e4) в индексы [4, 4]
    notationToIndices(notation) {
        const file = notation.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(notation[1]);
        return { row: rank, col: file };
    },

    // Конвертация из индексов [4, 4] в шахматную нотацию (e4)
    indicesToNotation(row, col) {
        const file = String.fromCharCode('a'.charCodeAt(0) + col);
        const rank = 8 - row;
        return `${file}${rank}`;
    },

    // Проверка нахождения в пределах доски
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },

    // Клонирование доски
    cloneBoard(board) {
        return board.map(row => [...row]);
    },

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Символы фигур (Unicode)
const PIECE_SYMBOLS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};
