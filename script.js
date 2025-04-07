document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 5;
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;

    // DOM元素
    const gridContainer = document.querySelector('.grid-container');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const gameMessage = document.querySelector('.game-message');
    const restartButton = document.querySelector('.restart-button');

    // 滑鼠和觸控事件共用變量
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30; // 最小滑動距離

    // 滑鼠事件處理
    let isMouseDown = false;

    document.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        touchStartX = event.clientX;
        touchStartY = event.clientY;
        event.preventDefault(); // 防止文字選中
    });

    document.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;
        event.preventDefault(); // 防止拖動其他元素
    });

    document.addEventListener('mouseup', (event) => {
        if (!isMouseDown) return;
        
        const mouseEndX = event.clientX;
        const mouseEndY = event.clientY;
        
        const deltaX = mouseEndX - touchStartX;
        const deltaY = mouseEndY - touchStartY;
        
        // 只有當滑動距離超過最小距離時才觸發移動
        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    move('right');
                } else {
                    move('left');
                }
            } else {
                if (deltaY > 0) {
                    move('down');
                } else {
                    move('up');
                }
            }
        }
        
        isMouseDown = false;
        event.preventDefault();
    });

    // 防止滑鼠離開視窗時卡住
    document.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });

    // 觸控事件處理
    let isTouching = false;

    document.addEventListener('touchstart', (event) => {
        isTouching = true;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (event) => {
        if (!isTouching) return;
        event.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', (event) => {
        if (!isTouching) return;
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // 只有當滑動距離超過最小距離時才觸發移動
        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    move('right');
                } else {
                    move('left');
                }
            } else {
                if (deltaY > 0) {
                    move('down');
                } else {
                    move('up');
                }
            }
        }
        
        isTouching = false;
        event.preventDefault();
    }, { passive: false });

    // 防止觸控事件的預設行為
    document.addEventListener('touchcancel', () => {
        isTouching = false;
    }, { passive: false });

    // 重新開始按鈕
    restartButton.addEventListener('click', () => {
        // 重置遊戲狀態
        gameOver = false;
        score = 0;
        updateScore();
        
        // 清除遊戲結束訊息
        gameMessage.classList.remove('game-over');
        gameMessage.classList.remove('game-won');
        
        // 清除所有現有的方塊
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 重新初始化遊戲
        initGame();
    });

    // 初始化遊戲
    function initGame() {
        // 重置遊戲狀態
        gameOver = false;
        score = 0;
        updateScore();
        
        // 清除遊戲結束訊息
        gameMessage.classList.remove('game-over');
        gameMessage.classList.remove('game-won');
        
        // 清除所有現有的方塊
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 初始化網格
        grid = Array(5).fill().map(() => Array(5).fill(0));
        
        // 添加兩個初始方塊
        addRandomTile();
        addRandomTile();
    }

    // 添加隨機方塊
    function addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            grid[randomCell.row][randomCell.col] = {
                value: value,
                isNew: true
            };
            return true;
        }
        return false;
    }

    // 更新視圖
    function updateView() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] !== 0) {
                    const value = typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j];
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    if (typeof grid[i][j] === 'object') {
                        if (grid[i][j].isNew) {
                            tile.classList.add('tile-new');
                        } else if (grid[i][j].isMerged) {
                            tile.classList.add('tile-merged');
                        }
                    }
                    
                    const cell = gridContainer.children[i * gridSize + j];
                    cell.appendChild(tile);
                }
            }
        }
        
        // 清除動畫標記
        setTimeout(() => {
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (typeof grid[i][j] === 'object') {
                        grid[i][j] = grid[i][j].value;
                    }
                }
            }
        }, 200);
    }

    // 移動方塊
    function move(direction) {
        if (gameOver) return false;
        
        let moved = false;
        const oldGrid = JSON.stringify(grid);
        
        switch(direction) {
            case 'left':
                moved = moveLeft();
                break;
            case 'right':
                moved = moveRight();
                break;
            case 'up':
                moved = moveUp();
                break;
            case 'down':
                moved = moveDown();
                break;
        }
        
        if (moved) {
            addRandomTile();
            updateView();
            
            if (checkGameOver()) {
                handleGameOver();
            }
            
            // 更新最高分
            if (score > bestScore) {
                bestScore = score;
                bestScoreDisplay.textContent = bestScore;
                localStorage.setItem('bestScore', bestScore);
            }
        }
        
        return moved;
    }

    // 向左移動
    function moveLeft() {
        let moved = false;
        for (let i = 0; i < gridSize; i++) {
            const row = grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] = {
                        value: row[j] * 2,
                        isMerged: true
                    };
                    score += row[j].value;
                    scoreDisplay.textContent = score;
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(gridSize - row.length).fill(0));
            if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            grid[i] = newRow;
        }
        return moved;
    }

    // 向右移動
    function moveRight() {
        let moved = false;
        for (let i = 0; i < gridSize; i++) {
            const row = grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] = {
                        value: row[j] * 2,
                        isMerged: true
                    };
                    score += row[j].value;
                    scoreDisplay.textContent = score;
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            const newRow = Array(gridSize - row.length).fill(0).concat(row);
            if (JSON.stringify(grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            grid[i] = newRow;
        }
        return moved;
    }

    // 向上移動
    function moveUp() {
        let moved = false;
        for (let j = 0; j < gridSize; j++) {
            const column = [];
            for (let i = 0; i < gridSize; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] = {
                        value: column[i] * 2,
                        isMerged: true
                    };
                    score += column[i].value;
                    scoreDisplay.textContent = score;
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            const newColumn = column.concat(Array(gridSize - column.length).fill(0));
            for (let i = 0; i < gridSize; i++) {
                if (grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    // 向下移動
    function moveDown() {
        let moved = false;
        for (let j = 0; j < gridSize; j++) {
            const column = [];
            for (let i = 0; i < gridSize; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] = {
                        value: column[i] * 2,
                        isMerged: true
                    };
                    score += column[i].value;
                    scoreDisplay.textContent = score;
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            const newColumn = Array(gridSize - column.length).fill(0).concat(column);
            for (let i = 0; i < gridSize; i++) {
                if (grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    // 檢查遊戲是否結束
    function checkGameOver() {
        // 檢查是否有空格子
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 檢查是否有可以合併的相鄰方塊
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (j < gridSize - 1 && grid[i][j] === grid[i][j + 1]) {
                    return false;
                }
                if (i < gridSize - 1 && grid[i][j] === grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // 處理遊戲結束
    function handleGameOver() {
        gameOver = true;
        gameMessage.classList.add('game-over');
    }

    // 初始化遊戲
    initGame();
});

