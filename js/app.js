var gBoard = []     //the model
var gLevel = {
    size: 4,
    mines: 2,
    bestScore: null
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,         //with a flag
    secsPassed: 0,
    isOver: false,
    hints: 0,
    isHintOn: false,
    lives: 3,
    bestScores: {
        4: null,
        8: null,
        12: null
    },
    safeClicks: 3
}
var gSweepersLocation = []
var gHintJ
var gHintI
var ghintNum


function initGame() {        //call when page loads
    buildBoard()
    renderBoard(gBoard)
    document.querySelector(".flags").innerText = "Remaining flags/mines: " + (gLevel.mines - gGame.markedCount)
    reset()
    document.querySelector(".state-button").innerText = "😄"
    gGame.isOn = false
    gGame.isOver = false
    var appearHints = document.getElementsByClassName("lighted")
    console.log(appearHints)
    appearHints = Array.prototype.slice.call(appearHints);
    appearHints.sort(function (a, b) {
        return a.textContent.localeCompare(b.textContent);
    });
    console.log(appearHints)
    for (var i = 0; i < appearHints.length; i++) {
        console.log(appearHints[i].id)
        document.getElementById(appearHints[i].id).classList.replace("lighted", "bw")
    }
    gGame.hints = 0
    gGame.lives = 3
    gGame.safeClicks = 10
    document.querySelector("h2 span").innerText = gGame.lives
    document.getElementById("lives-emj").innerText = ("💘".repeat(gGame.lives))
    document.querySelector("h3 span").innerText = gGame.bestScores[gLevel.size]
    document.getElementById("safe-clicks").innerText = gGame.safeClicks
}
function setDifficulty(size) {
    switch (size) {
        case 4:
            gLevel.size = 4
            gLevel.mines = 2
            break;
        case 8:
            gLevel.size = 8
            gLevel.mines = 12
            break;
        case 12:
            gLevel.size = 12
            gLevel.mines = 30
            break;
    }
    initGame()
    document.querySelector("table").style.visibility = "visible"
    console.log(gLevel)
}


function buildBoard() {      //builds the board, set random mines, call setMinesNegsCount, return board
    gBoard = []
    for (var i = 0; i < gLevel.size; i++) {
        gBoard[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            gBoard[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false
            }
        }
    }
    console.log(gBoard)
}

function addMinesAndCount() {
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gSweepersLocation[0] === i * gLevel.size + j) {
                gBoard[i][j].isMine = true
                gSweepersLocation.shift()
            }

        }
    }
    for (i = 0; i < gLevel.size; i++) {
        for (j = 0; j < gLevel.size; j++) {
            gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j)

        }
    }

}


function createSweepers(firstClickLocation) {
    var firstClickLocationId = firstClickLocation.i * gLevel.size + firstClickLocation.j
    gSweepersLocation = []
    while (gSweepersLocation.length < gLevel.mines) {
        var num = Math.floor(Math.random() * gLevel.size * gLevel.size)
        if (gSweepersLocation.indexOf(num) === -1 && num !== firstClickLocationId) gSweepersLocation.push(num)
    }
    gSweepersLocation.sort(function (a, b) {
        return a - b
    })
    console.log(gSweepersLocation)
}

function setMinesNegsCount(celli, cellj) {      // Count mines around each cell  and set the cell's  minesAroundCount.
    var minesAround = 0
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (i === celli && j === cellj) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isMine) { minesAround++; }
        }
    }

    return minesAround;

}

function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var miner = ""
            var currCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            // TODO - change to short if statement
            if (currCell.isShown) {
                cellClass += ' shown'
            }
            else if (currCell.isMarked) cellClass += ' marked'
            if (currCell.isMine) miner = "***"

            //TODO - Change To ES6 template string
            strHTML += '\t<td class="right-click cell ' + cellClass + '"  onclick="cellClicked(' + i + ',' + j + ')" >\n';

            if (currCell.isShown) strHTML += '\t' + currCell.minesAroundCount + miner + '""</td>\n';
        }
        strHTML += '</tr>\n';
    }


    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.gameboard');
    elBoard.innerHTML = strHTML;

    [...document.querySelectorAll('.right-click')].forEach(element => {
        element.addEventListener('contextmenu', e => {
            e.preventDefault()

            cellMarked(element.className.match(/[\d]+-[\d]+/)[0].split("-"))
        })
    })


}


function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function cellClicked(i, j) {  //called when a cell (td) clicked
    if (gGame.isOver) return
    if (!gGame.isOn) {
        gGame.isOn = true
        var firstClickLocation = { i: i, j: j }
        createSweepers(firstClickLocation)
        addMinesAndCount()
        startTimer()
    }
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return
    if (gGame.isHintOn) {
        // gHintI = i
        // gHintJ = j
        showHint(i, j)
        setTimeout(afterHint, 1000, { i: i, j: j })
        gGame.isHintOn = false
        elHint = document.getElementsByClassName("lighted")[gGame.hints - 1]
        console.log("RENDERED AGAIN")
        return
    }
    if (gBoard[i][j].isMine) {
        // gBoard[i][j].isShown = true
        if (gGame.lives === 0) checkGameOver(true)
        var redMineClass = getClassName({ i: i, j: j })
        document.getElementsByClassName(redMineClass)[0].classList.add("red-bgc")
        console.log(gGame.lives, "HEY HERE")
        if (gGame.lives > 0){
             document.querySelector("h2 span").innerText = --gGame.lives
             document.getElementById("lives-emj").innerText = ("💘".repeat(gGame.lives))
             
        }
        renderCell({ i: i, j: j }, "💣")

        // console.log(gGame.markedCount,'a')
        gBoard[i][j].isMarked = true
        gGame.markedCount = gGame.markedCount + 1
        console.log(gGame.markedCount, 'b')
        document.querySelector(".flags").innerText = "Remaining flags/mines: " + (gLevel.mines - gGame.markedCount)

        checkGameOver()
        return
    }
    expandShow(i, j)

    checkGameOver()
}
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    if (gBoard[location.i][location.j].isMine && gBoard[location.i][location.j].isShown) value = "💣"
    elCell.innerText = value;
}

function cellMarked(posArr) {        //called on right click
    // debugger
    const [i, j] = posArr
    if (gGame.isOver) return
    if (!gGame.isOn) {
        gGame.isOn = true
        startTimer()

        console.log("SHOULDD START")
    }
    if (gGame.markedCount === gLevel.mines && gBoard[i][j].isMarked !== true) return
    var toIn = ""
    if (gBoard[i][j].isMarked === true) {
        console.log("TRUE")
        gBoard[i][j].isMarked = false
    }
    else {
        gBoard[i][j].isMarked = true
        toIn = "F"
    }
    renderCell({ i: i, j: j }, toIn)
    checkGameOver()
    document.querySelector(".flags").innerText = "Remaining flags/mines: " + (gLevel.mines - gGame.markedCount)

}

function safeClick(){
    if(gGame.safeClicks === 0) return
    gGame.safeClicks--
    document.getElementById("safe-clicks").innerText = gGame.safeClicks
    var location = null
    while(!location){
    var num = Math.floor(Math.random() * gLevel.size **2)
    console.log()
    location ={ i: Math.floor(num / gLevel.size), j: num%gLevel.size}
    console.log(location, num, "FIT?")
    console.log(gBoard[location.i][location.j].isShown)
    console.log(gBoard[location.i][location.j].isMine)
    console.log(gBoard[location.i][location.j].isMarked)
    if(gBoard[location.i][location.j].isMine ||
        gBoard[location.i][location.j].isShown ||
        gBoard[location.i][location.j].isMarked) location = null
    }
    var value 
    if(gBoard[location.i][location.j].minesAroundCount !== 0) value = gBoard[location.i][location.j].minesAroundCount
    else value = " "
    console.log(location, value)
    renderCell(location, value)
    console.log(document.querySelector("."+getClassName(location)).classList.add("bold"))
    setTimeout(unSafeClick, 1000, location)

}

function unSafeClick(location){
    if(!gBoard[location.i][location.j].isShown) renderCell(location, "")
    console.log(document.querySelector("."+getClassName(location)).classList.remove("bold"))

}


function getHint(hintNum) {
    ghintNum = hintNum
    if (gGame.hints === 3) return
    gGame.hints++
    document.getElementById(ghintNum).classList.remove("bw")
    gGame.isHintOn = true
}

function showHint(celli, cellj) {
    var tempArray = [...gBoard]
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= tempArray.length) continue;
        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j >= tempArray[i].length) continue;
            if (!tempArray[i][j].isShown) {
                document.querySelector("."+getClassName({i:i, j:j})).classList.add("bold")
                tempArray[i][j].isHinted = true
                console.log(gBoard[i][j].isShown, "BEFORE")
                console.log(tempArray[i][j].isShown, "BEFORE")
                tempArray[i][j].isShown = true
                renderCell({ i: i, j: j }, tempArray[i][j].minesAroundCount)
                console.log(gBoard[i][j].isShown, "after")
                console.log(tempArray[i][j].isShown, "after")
            }
        }

    }
    console.log(ghintNum)


}

function afterHint(pos) {
    console.log(pos)
    var celli = pos.i
    var cellj = pos.j
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isHinted) {
                console.log(gBoard[i][j].isHinted, "HINTED?")
                gBoard[i][j].isShown = false
                // console.log(tempArray[i][j].isShown, "BEFORE")
                document.querySelector("."+getClassName({i:i, j:j})).classList.remove("bold")
                renderCell({ i: i, j: j }, "")
                console.log(gBoard[i][j].isShown, "after")
                // console.log(tempArray[i][j].isShown, "after")

            }
        }
    }
    document.getElementById(ghintNum).classList.add("lighted")

}


function checkGameOver(mineClicked = false) {   //game ends when all mines are marked and all other cells are shown
    if (mineClicked) {
        console.log("YOU LOSE")
        document.querySelector(".state-button").innerText = "😵"
        pause()
        gGame.isOn = false
        gGame.isOver = true
        for (var i = 0; i < gLevel.size; i++) {
            for (var j = 0; j < gLevel.size; j++) {
                if (gBoard[i][j].isShown) renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
                else if (gBoard[i][j].isMine) renderCell({ i: i, j: j }, "💣")

            }
        }
        console.log("SHOULD RENDER")
        return
    }
    gGame.markedCount = 0
    gGame.shownCount = 0
    console.log("YOU ARE IN CHECK ZONE")
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            // console.log(gBoard[i][j])
            if (gBoard[i][j].isShown) gGame.shownCount++
            if (gBoard[i][j].isMarked) gGame.markedCount++
        }
    }
    console.log(gGame.shownCount, gGame.markedCount, gLevel.mines)

    if (gGame.markedCount !== gLevel.mines) return
    if (gGame.shownCount === gLevel.size ** 2 - gLevel.mines) {
        pause()
        console.log("VICTORY")
        document.querySelector(".state-button").innerText = "😎"
        bestScoreCheck()
        return "VICTORY"

    }



}

function bestScoreCheck() {
    var currScore = document.getElementById("display").innerText
    var currScoreArr = currScore.split(":")
    console.log(currScoreArr)
    if (gGame.bestScores[gLevel.size] === null) {
        gGame.bestScores[gLevel.size] = currScore
        console.log(gGame.bestScores[gLevel.size])
        document.querySelector("h3 span").innerText = gGame.bestScores[gLevel.size]
    }
    else {
        var bestScoreArr = gGame.bestScores[gLevel.size].split(":")
        var bestScoreSecsArr = [parseInt(bestScoreArr[0]), parseInt(bestScoreArr[1]), parseInt(bestScoreArr[2])]
        console.log(bestScoreSecsArr)
        var currScoreSecsArr = [parseInt(currScoreArr[0]), parseInt(currScoreArr[1]), parseInt(currScoreArr[2])]
        console.log(currScoreSecsArr)
        var bestScoreSecs = (bestScoreSecsArr[0]*60 + bestScoreSecsArr[1] + bestScoreSecsArr[2]/1000)
        var currScoreSecs = (currScoreSecsArr[0]*60 + currScoreSecsArr[1] + currScoreSecsArr[2]/1000)    
        console.log(bestScoreSecs, currScoreSecs, "SECS")
        if(currScoreSecs < bestScoreSecs){
            gGame.bestScores[gLevel.size] = currScore
            document.querySelector("h3 span").innerText = gGame.bestScores[gLevel.size]
        }
    }

}
function expandShow(i, j) {
    if (gBoard[i][j].isMarked || gBoard[i][j].isShown) return

    if (gBoard[i][j].minesAroundCount !== 0) {
        gBoard[i][j].isShown = true
        renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)
        return
    }

    gBoard[i][j].isShown = true
    renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount)

    for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= gBoard.length) continue;
        for (var y = j - 1; y <= j + 1; y++) {
            if (y < 0 || y >= gBoard[i].length) continue;

            expandShow(x, y);
        }

    }
}





