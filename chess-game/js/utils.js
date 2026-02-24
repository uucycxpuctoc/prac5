// Вспомогательные функции

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
