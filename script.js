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

    // 確保所有DOM元素都存在
    if (!gridContainer || !scoreDisplay || !bestScoreDisplay || !gameMessage || !restartButton) {
        console.error('找不到必要的DOM元素');
        return;
    }

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
    restartButton.addEventListener('click', function(event) {
        console.log('重新開始按鈕被點擊'); // 添加調試日誌
        event.preventDefault(); // 防止預設行為
        
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
        
        // 清空網格容器
        gridContainer.innerHTML = '';
        
        // 創建網格單元格
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                gridContainer.appendChild(cell);
            }
        }
        
        // 初始化網格數據
        grid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        // 添加兩個初始方塊
        addRandomTile();
        addRandomTile();
        
        // 更新視圖
        updateView();
    }

    // 更新分數
    function updateScore() {
        scoreDisplay.textContent = score;
        bestScoreDisplay.textContent = bestScore;
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
            const row = grid[i].filter(cell => {
                return cell !== 0 && (typeof cell === 'number' || typeof cell.value === 'number');
            });
            
            for (let j = 0; j < row.length - 1; j++) {
                const current = typeof row[j] === 'object' ? row[j].value : row[j];
                const next = typeof row[j + 1] === 'object' ? row[j + 1].value : row[j + 1];
                
                if (current === next) {
                    row[j] = {
                        value: current * 2,
                        isMerged: true
                    };
                    score += row[j].value;
                    updateScore();
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            
            const newRow = row.map(cell => {
                return typeof cell === 'object' ? cell : { value: cell, isMerged: false };
            });
            
            while (newRow.length < gridSize) {
                newRow.push(0);
            }
            
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
            const row = grid[i].filter(cell => {
                return cell !== 0 && (typeof cell === 'number' || typeof cell.value === 'number');
            });
            
            for (let j = row.length - 1; j > 0; j--) {
                const current = typeof row[j] === 'object' ? row[j].value : row[j];
                const prev = typeof row[j - 1] === 'object' ? row[j - 1].value : row[j - 1];
                
                if (current === prev) {
                    row[j] = {
                        value: current * 2,
                        isMerged: true
                    };
                    score += row[j].value;
                    updateScore();
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            
            const newRow = row.map(cell => {
                return typeof cell === 'object' ? cell : { value: cell, isMerged: false };
            });
            
            while (newRow.length < gridSize) {
                newRow.unshift(0);
            }
            
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
                const current = typeof column[i] === 'object' ? column[i].value : column[i];
                const next = typeof column[i + 1] === 'object' ? column[i + 1].value : column[i + 1];
                
                if (current === next) {
                    column[i] = {
                        value: current * 2,
                        isMerged: true
                    };
                    score += column[i].value;
                    updateScore();
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            const newColumn = column.map(cell => {
                return typeof cell === 'object' ? cell : { value: cell, isMerged: false };
            });
            
            while (newColumn.length < gridSize) {
                newColumn.push(0);
            }
            
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
                const current = typeof column[i] === 'object' ? column[i].value : column[i];
                const prev = typeof column[i - 1] === 'object' ? column[i - 1].value : column[i - 1];
                
                if (current === prev) {
                    column[i] = {
                        value: current * 2,
                        isMerged: true
                    };
                    score += column[i].value;
                    updateScore();
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            
            const newColumn = column.map(cell => {
                return typeof cell === 'object' ? cell : { value: cell, isMerged: false };
            });
            
            while (newColumn.length < gridSize) {
                newColumn.unshift(0);
            }
            
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
                const value = typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j];
                if (value === 0) {
                    return false;
                }
            }
        }
        
        // 檢查是否有可以合併的相鄰方塊
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const current = typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j];
                
                // 檢查右側
                if (j < gridSize - 1) {
                    const right = typeof grid[i][j + 1] === 'object' ? grid[i][j + 1].value : grid[i][j + 1];
                    if (current === right) return false;
                }
                
                // 檢查下方
                if (i < gridSize - 1) {
                    const down = typeof grid[i + 1][j] === 'object' ? grid[i + 1][j].value : grid[i + 1][j];
                    if (current === down) return false;
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

