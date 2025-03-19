document.addEventListener('DOMContentLoaded', () => {
    // 遊戲初始化
    const gridContainer = document.getElementById('grid-container');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const gameMessage = document.querySelector('.game-message');
    const messageText = gameMessage.querySelector('p');
    const restartButtons = document.querySelectorAll('.restart-button');
    
    // 遊戲參數
    const gridSize = 4;
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let cellSize, cellMargin;
    let previousGrid = null; // 存儲移動前的網格狀態
    
    // 顯示最高分
    bestScoreDisplay.textContent = bestScore;
    
    // 初始化遊戲
    function initGame() {
        // 重置遊戲狀態
        grid = [];
        score = 0;
        gameOver = false;
        scoreDisplay.textContent = '0';
        gameMessage.classList.remove('game-over');
        
        // 設置網格尺寸
        updateGridDimensions();
        
        // 清空網格
        gridContainer.innerHTML = '';
        
        // 創建網格背景
        for (let i = 0; i < gridSize; i++) {
            const gridRow = document.createElement('div');
            gridRow.className = 'grid-row';
            grid[i] = [];
            
            for (let j = 0; j < gridSize; j++) {
                grid[i][j] = 0;
                
                // 創建網格單元格
                const gridCell = document.createElement('div');
                gridCell.className = 'grid-cell';
                gridCell.style.width = `${cellSize}px`;
                gridCell.style.height = `${cellSize}px`;
                gridCell.style.top = `${cellMargin + i * (cellSize + cellMargin)}px`;
                gridCell.style.left = `${cellMargin + j * (cellSize + cellMargin)}px`;
                gridContainer.appendChild(gridCell);
                gridRow.appendChild(gridCell);
            }
            
            gridContainer.appendChild(gridRow);
        }
        
        // 添加兩個初始方塊
        addRandomTile();
        addRandomTile();
        
        // 更新畫面
        updateView();
    }
    
    // 更新網格尺寸
    function updateGridDimensions() {
        const isMobile = window.innerWidth <= 520;
        cellSize = isMobile ? 50 : 100;
        cellMargin = isMobile ? 10 : 15;
    }
    
    // 當視窗大小改變時更新網格尺寸
    window.addEventListener('resize', () => {
        updateGridDimensions();
        updateView();
    });
    
    // 複製當前網格狀態
    function copyGrid(grid) {
        const newGrid = [];
        for (let i = 0; i < gridSize; i++) {
            newGrid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                if (typeof grid[i][j] === 'object') {
                    newGrid[i][j] = { ...grid[i][j] };
                } else {
                    newGrid[i][j] = grid[i][j];
                }
            }
        }
        return newGrid;
    }
    
    // 更新視圖
    function updateView() {
        // 刪除所有方塊
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 重新產生方塊
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] !== 0) {
                    const value = typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j];
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    
                    // 設置方塊動畫類型
                    if (typeof grid[i][j] === 'object') {
                        if (grid[i][j].isNew) {
                            tile.classList.add('tile-new');
                        } else if (grid[i][j].isMerged) {
                            tile.classList.add('tile-merged');
                        }
                        
                        // 如果有移動信息，設置起始位置並添加過渡效果
                        if (grid[i][j].fromRow !== undefined && grid[i][j].fromCol !== undefined) {
                            const fromTop = cellMargin + grid[i][j].fromRow * (cellSize + cellMargin);
                            const fromLeft = cellMargin + grid[i][j].fromCol * (cellSize + cellMargin);
                            
                            // 設置初始位置
                            tile.style.top = `${fromTop}px`;
                            tile.style.left = `${fromLeft}px`;
                            
                            // 強制重繪
                            tile.offsetHeight;
                        }
                    }
                    
                    // 設置最終位置
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.lineHeight = `${cellSize}px`;
                    tile.style.top = `${cellMargin + i * (cellSize + cellMargin)}px`;
                    tile.style.left = `${cellMargin + j * (cellSize + cellMargin)}px`;
                    
                    gridContainer.appendChild(tile);
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
    
    // 添加隨機方塊
    function addRandomTile() {
        const emptyCells = [];
        
        // 找到所有空格子
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        // 如果還有空格子
        if (emptyCells.length > 0) {
            // 隨機選擇一個空格子
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90%機率為2，10%機率為4
            const value = Math.random() < 0.9 ? 2 : 4;
            
            // 將新方塊標記為 "新生成"，以便添加動畫
            grid[randomCell.row][randomCell.col] = {
                value: value,
                isNew: true
            };
            return true;
        }
        
        return false;
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
                // 檢查右方
                if (j < gridSize - 1 && grid[i][j] === grid[i][j + 1]) {
                    return false;
                }
                // 檢查下方
                if (i < gridSize - 1 && grid[i][j] === grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        // 沒有空格子且沒有可合併的方塊，遊戲結束
        return true;
    }
    
    // 處理遊戲結束
    function handleGameOver() {
        gameOver = true;
        messageText.textContent = '遊戲結束！';
        gameMessage.classList.add('game-over');
        
        // 更新最高分
        updateBestScore();
    }
    
    // 更新最高分
    function updateBestScore() {
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore;
            localStorage.setItem('bestScore', bestScore);
        }
    }
    
    // 檢查勝利
    function checkWin() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cellValue = typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j];
                if (cellValue === 2048) {
                    messageText.textContent = '恭喜！您贏了！';
                    gameMessage.classList.add('game-over');
                    
                    // 更新最高分
                    updateBestScore();
                    return true;
                }
            }
        }
        return false;
    }
    
    // 處理勝利
    function handleWin() {
        gameOver = true;
        updateBestScore();
    }
    
    // 處理方向鍵事件
    document.addEventListener('keydown', (event) => {
        if (gameOver) return;
        
        let moved = false;
        previousGrid = copyGrid(grid);
        
        switch(event.key) {
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
        }
        
        if (moved) {
            addRandomTile();
            updateView();
            
            if (checkWin()) {
                handleWin();
            } else if (checkGameOver()) {
                handleGameOver();
            }
        }
    });
    
    // 處理觸控事件
    let touchStartX = 0;
    let touchStartY = 0;
    
    gridContainer.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });
    
    gridContainer.addEventListener('touchend', (event) => {
        if (gameOver) return;
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        let moved = false;
        previousGrid = copyGrid(grid);
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                moved = moveRight();
            } else {
                moved = moveLeft();
            }
        } else {
            if (deltaY > 0) {
                moved = moveDown();
            } else {
                moved = moveUp();
            }
        }
        
        if (moved) {
            addRandomTile();
            updateView();
            
            if (checkWin()) {
                handleWin();
            } else if (checkGameOver()) {
                handleGameOver();
            }
        }
    });
    
    // 防止觸控事件的預設行為
    gridContainer.addEventListener('touchmove', (event) => {
        event.preventDefault();
    });
    
    // 重新開始按鈕事件
    restartButtons.forEach(button => {
        button.addEventListener('click', () => {
            initGame();
        });
    });
    
    // 向左移動
    function moveLeft() {
        let moved = false;
        for (let i = 0; i < gridSize; i++) {
            const row = grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
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
                    row[j] *= 2;
                    score += row[j];
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
                    column[i] *= 2;
                    score += column[i];
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
                    column[i] *= 2;
                    score += column[i];
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
    
    // 初始化遊戲
    initGame();
});
