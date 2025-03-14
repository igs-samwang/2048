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
    
    // 合併方塊並計算分數
    function mergeTiles(row) {
        let result = [];
        let merged = false;
        let scoreAdded = 0;
        
        // 移除所有零
        let filtered = [];
        for (let i = 0; i < row.length; i++) {
            if (row[i] !== 0) {
                // 處理可能是對象的情況
                const value = typeof row[i] === 'object' ? row[i].value : row[i];
                filtered.push(value);
            }
        }
        
        // 合併相同數值的方塊
        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i+1]) {
                const mergedValue = filtered[i] * 2;
                // 標記為已合併，以便添加動畫
                result.push({
                    value: mergedValue,
                    isMerged: true
                });
                scoreAdded += mergedValue;
                i++;
                merged = true;
            } else {
                result.push(filtered[i]);
            }
        }
        
        // 補充零
        while (result.length < gridSize) {
            result.push(0);
        }
        
        return { row: result, merged, scoreAdded };
    }
    
    // 處理移動
    function handleMove(direction) {
        if (gameOver) return false;
        
        // 保存移動前的網格狀態
        previousGrid = copyGrid(grid);
        
        let moved = false;
        
        switch(direction) {
            case 'up':
                moved = moveUp();
                break;
            case 'down':
                moved = moveDown();
                break;
            case 'left':
                moved = moveLeft();
                break;
            case 'right':
                moved = moveRight();
                break;
        }
        
        if (moved) {
            // 處理方塊的移動軌跡，添加移動信息
            trackTileMovements();
            
            // 更新最高分
            if (score > bestScore) {
                updateBestScore();
            }
            
            // 將更新放在 setTimeout 中，以便動畫可以完成
            setTimeout(() => {
                addRandomTile();
                updateView();
                
                if (checkWin()) {
                    return;
                }
                
                if (checkGameOver()) {
                    handleGameOver();
                }
            }, 150);
            
            return true;
        }
        
        return false;
    }
    
    // 跟蹤方塊移動
    function trackTileMovements() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] !== 0) {
                    // 找尋這個方塊在之前網格中的位置
                    const value = typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j];
                    let found = false;
                    
                    // 不是新生成的方塊
                    if (!grid[i][j].isNew) {
                        // 搜尋前一個網格中這個值的位置
                        for (let prevI = 0; prevI < gridSize && !found; prevI++) {
                            for (let prevJ = 0; prevJ < gridSize && !found; prevJ++) {
                                const prevValue = typeof previousGrid[prevI][prevJ] === 'object' ? 
                                    previousGrid[prevI][prevJ].value : previousGrid[prevI][prevJ];
                                
                                // 找到相同值且位置不同的方塊（移動過的方塊）
                                if (prevValue === value && (prevI !== i || prevJ !== j)) {
                                    // 如果當前位置是對象，保留其屬性
                                    if (typeof grid[i][j] === 'object') {
                                        grid[i][j].fromRow = prevI;
                                        grid[i][j].fromCol = prevJ;
                                    } else {
                                        grid[i][j] = {
                                            value: value,
                                            fromRow: prevI,
                                            fromCol: prevJ
                                        };
                                    }
                                    found = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 向左移動
    function moveLeft() {
        let moved = false;
        let scoreAdded = 0;
        
        for (let i = 0; i < gridSize; i++) {
            const oldRow = [...grid[i]];
            const { row, merged, scoreAdded: rowScore } = mergeTiles(oldRow);
            grid[i] = row;
            
            // 判斷是否有移動
            for (let j = 0; j < gridSize; j++) {
                if ((typeof oldRow[j] === 'object' ? oldRow[j].value : oldRow[j]) !== 
                    (typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j])) {
                    moved = true;
                }
            }
            
            scoreAdded += rowScore;
        }
        
        // 更新分數
        if (scoreAdded > 0) {
            score += scoreAdded;
            scoreDisplay.textContent = score;
        }
        
        return moved;
    }
    
    // 向右移動
    function moveRight() {
        let moved = false;
        let scoreAdded = 0;
        
        for (let i = 0; i < gridSize; i++) {
            const oldRow = [...grid[i]];
            // 反轉，然後合併，再反轉回來
            const reversed = oldRow.reverse();
            const { row, merged, scoreAdded: rowScore } = mergeTiles(reversed);
            grid[i] = row.reverse();
            
            // 判斷是否有移動
            for (let j = 0; j < gridSize; j++) {
                if ((typeof oldRow[j] === 'object' ? oldRow[j].value : oldRow[j]) !== 
                    (typeof grid[i][j] === 'object' ? grid[i][j].value : grid[i][j])) {
                    moved = true;
                }
            }
            
            scoreAdded += rowScore;
        }
        
        // 更新分數
        if (scoreAdded > 0) {
            score += scoreAdded;
            scoreDisplay.textContent = score;
        }
        
        return moved;
    }
    
    // 向上移動
    function moveUp() {
        let moved = false;
        let scoreAdded = 0;
        
        for (let j = 0; j < gridSize; j++) {
            // 獲取列
            let column = [];
            for (let i = 0; i < gridSize; i++) {
                column.push(grid[i][j]);
            }
            
            const oldColumn = [...column];
            const { row: newColumn, merged, scoreAdded: colScore } = mergeTiles(column);
            
            // 更新網格
            for (let i = 0; i < gridSize; i++) {
                grid[i][j] = newColumn[i];
                if ((typeof oldColumn[i] === 'object' ? oldColumn[i].value : oldColumn[i]) !== 
                    (typeof newColumn[i] === 'object' ? newColumn[i].value : newColumn[i])) {
                    moved = true;
                }
            }
            
            scoreAdded += colScore;
        }
        
        // 更新分數
        if (scoreAdded > 0) {
            score += scoreAdded;
            scoreDisplay.textContent = score;
        }
        
        return moved;
    }
    
    // 向下移動
    function moveDown() {
        let moved = false;
        let scoreAdded = 0;
        
        for (let j = 0; j < gridSize; j++) {
            // 獲取列
            let column = [];
            for (let i = 0; i < gridSize; i++) {
                column.push(grid[i][j]);
            }
            
            const oldColumn = [...column];
            // 反轉，然後合併，再反轉回來
            const reversed = column.reverse();
            const { row: newColumn, merged, scoreAdded: colScore } = mergeTiles(reversed);
            const result = newColumn.reverse();
            
            // 更新網格
            for (let i = 0; i < gridSize; i++) {
                grid[i][j] = result[i];
                if ((typeof oldColumn[i] === 'object' ? oldColumn[i].value : oldColumn[i]) !== 
                    (typeof result[i] === 'object' ? result[i].value : result[i])) {
                    moved = true;
                }
            }
            
            scoreAdded += colScore;
        }
        
        // 更新分數
        if (scoreAdded > 0) {
            score += scoreAdded;
            scoreDisplay.textContent = score;
        }
        
        return moved;
    }
    
    // 鍵盤控制
    document.addEventListener('keydown', function(event) {
        if (gameOver) return;
        
        switch(event.key) {
            case 'ArrowUp':
                handleMove('up');
                break;
            case 'ArrowDown':
                handleMove('down');
                break;
            case 'ArrowLeft':
                handleMove('left');
                break;
            case 'ArrowRight':
                handleMove('right');
                break;
            default:
                return; // 忽略其他鍵
        }
        
        event.preventDefault();
    });
    
    // 滑鼠和觸控控制 - 改進版
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    
    // 處理滑鼠按下事件
    gridContainer.addEventListener('mousedown', function(event) {
        if (gameOver) return;
        startX = event.clientX;
        startY = event.clientY;
        isDragging = true;
        event.preventDefault();
    });
    
    // 處理滑鼠放開事件
    document.addEventListener('mouseup', function(event) {
        if (!isDragging) return;
        handleSwipe(event.clientX, event.clientY);
        isDragging = false;
    });
    
    // 處理滑鼠離開事件
    gridContainer.addEventListener('mouseleave', function(event) {
        if (!isDragging) return;
        handleSwipe(event.clientX, event.clientY);
        isDragging = false;
    });
    
    // 觸控開始事件
    gridContainer.addEventListener('touchstart', function(event) {
        if (gameOver) return;
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        event.preventDefault();
    }, { passive: false });
    
    // 觸控結束事件
    gridContainer.addEventListener('touchend', function(event) {
        if (gameOver) return;
        handleSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        event.preventDefault();
    }, { passive: false });
    
    // 通用處理滑動函數
    function handleSwipe(endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        
        // 滑動必須超過最小距離
        const minSwipeDistance = 30;
        
        // 判定滑動方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑動
            if (Math.abs(diffX) > minSwipeDistance) {
                if (diffX > 0) {
                    handleMove('right');
                } else {
                    handleMove('left');
                }
            }
        } else {
            // 垂直滑動
            if (Math.abs(diffY) > minSwipeDistance) {
                if (diffY > 0) {
                    handleMove('down');
                } else {
                    handleMove('up');
                }
            }
        }
    }
    
    // 重新開始按鈕
    restartButtons.forEach(button => {
        button.addEventListener('click', initGame);
    });
    
    // 開始遊戲
    initGame();
});
