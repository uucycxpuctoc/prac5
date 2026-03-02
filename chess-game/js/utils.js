// Конвертация между системами координат
const Utils = {
    // Числовые координаты (row, col) в шахматную нотацию (e.g., 'a1')
    toAlgebraic(row, col) {
        const files = 'abcdefgh';
        return files[col] + (8 - row);
    },

    // Шахматная нотация в числовые координаты
    fromAlgebraic(pos) {
        if (!pos || pos.length < 2) return null;
        const file = pos[0];
        const rank = parseInt(pos[1]);
        const col = 'abcdefgh'.indexOf(file);
        const row = 8 - rank;
        return (row >= 0 && row < 8 && col >= 0 && col < 8) ? { row, col } : null;
    },

    // Валидация координат
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    },

    // Глубокое копирование доски
    copyBoard(board) {
        return board.map(row => [...row]);
    },

    // Unicode символы фигур
    PIECE_SYMBOLS: {
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
    },

    // Получить символ фигуры
    getPieceSymbol(piece) {
        if (!piece) return '';
        return this.PIECE_SYMBOLS[piece.color][piece.type];
    },

    // Служебные функции
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Делаем доступным глобально
window.Utils = Utils;
