'use strict';

const chessField = document.querySelector('.chess-field'),
    resetBtn = document.querySelector('.reset'),
    horseLoad = document.querySelector('.horse-load');
let  horse = document.querySelector('.horse');

// массив x*y
const createArr = (...args) => {
    let arr = [];
    const [xStart, xEnd, yStart, yEnd] = args;
    for (let i = xStart; i <= xEnd; i++) {
        for (let k = yStart; k <= yEnd; k++) {
            arr.push([i, k]);
        }
    }
    return arr;
};

// массив возможных ходов коня
const validHorseMove = createArr(-2, 2, -2, 2).filter(item =>
    (item[0] !== 0 && item[1] !== 0 && (item[0] + item[1]) % 2 !== 0));

// показываем возможные ходы
const showHorse = (x, y) => {
    const moves = validHorseMove.filter(val => { //проверка на попадание в поле
        if (x + val[0] < 8 && x + val[0] >= 0 && y + val[1] < 8 && y + val[1] >= 0) return val;
    });
    moves.forEach(item => { // задаем классы
        const elem = document.querySelector(`.chess-block[data-x="${x + item[0]}"][data-y="${y + item[1]}"]`);
        elem.classList.add('droppable');
        elem.classList.add('possible');
    });
}

// ставим коня и передаем координаты valid ходов
const setHorse = (elem) => {
    resetBlocks();
    // horse.style.position = '';
    elem.classList.add('active');
    elem.append(horse)
    showHorse(+elem.dataset.x, +elem.dataset.y)
}

// reset при новой позиции
const resetBlocks = () => {
    horse.style.position = '';
    document.querySelectorAll('.droppable')?.forEach(item => {
        item.classList.remove('droppable');
        item.classList.remove('possible');
    });
    document.querySelector('.active')?.classList.remove('active');
};

// рисуем поле
const drawField = () => {
    const block = document.createElement('div');
    block.classList.add('chess-block');
    block.classList.add('droppable'); // сначала всем droppable
    createArr(0, 7, 0, 7).forEach(item => {
        const clone = block.cloneNode(true);
        clone.setAttribute('data-x', item[0]);
        clone.setAttribute('data-y', item[1]);
        // clone.ondragover = () => false;
        ((item[0] + item[1]) % 2 === 0) || clone.classList.add('bg-black');
        chessField.append(clone);
    });
    chessField.ondragover = () => false;
};
drawField();

// полный сброс
const fullReset = () => {
    resetBlocks();
    document.querySelectorAll('.chess-block')?.forEach(item => {
        item.classList.add('droppable');
    })
    horseLoad.append(horse);
}

// перенос по клику
document.addEventListener('click', (e) => {
    const target = e.target;
    // при клике в пределах доски и разрешенный ход
    if (target.classList.contains('chess-block') && target.classList.contains('droppable')) setHorse(target);
    // сброс по ресет
    if(target ===  resetBtn) fullReset();
});

//подсветка при переносе
const enterDroppable = (elem) => elem.style.background = 'green';
const leaveDroppable = (elem) => elem.style.background = '';

// ------------------drag&drop with drag event---------------------------
//****************************************************
// показ куда можно поставить
const showValidDrop = () => {
    let currentDroppable = null;
    const showDrop = (e) => {
        const droppableElem = e.target.closest('.droppable');
        // проверка на залет/вылет
        if (currentDroppable != droppableElem) {
            if (currentDroppable) { // "вылет" из droppable (удаляем подсветку)
                leaveDroppable(currentDroppable);
            }
            currentDroppable = droppableElem;
            if (currentDroppable) { // "влетаем" в droppable -> подсветка
                enterDroppable(currentDroppable);
            }
        }
    }
    document.addEventListener('dragover', e => showDrop(e));
}
showValidDrop();

// сброс в ячейку
document.addEventListener('drop', e => {
    const target = e.target;
    if(target !== horse && target.closest('.droppable')) {
        document.removeEventListener('dragover', e => showDrop);
        leaveDroppable(e.target)
        setHorse(e.target)
    }
});

// --------------------drag&drop with pointer event-----------------------------
//*********************************************************
/*
horse.onpointerdown = (e) => {
    horse.setPointerCapture(e.pointerId);

    // координаты в начале перемещения
    const startHorseX = horse.getBoundingClientRect().left,
        startHorseY = horse.getBoundingClientRect().top;
    //смещение
    let shiftX = e.clientX - startHorseX;
    let shiftY = e.clientY - startHorseY;

    // для отслеживания переноса
    horse.style.position = 'absolute';
    horse.style.zIndex = 1000;
    document.body.append(horse);

    // перенос на координаты c учитом сдвига относительно курсора
    const moveAt = (pageX, pageY) => {
        horse.style.left = pageX - shiftX + 'px';
        horse.style.top = pageY - shiftY + 'px';
    }

    // Поееехали!
    moveAt(e.pageX, e.pageY);

    //возврат на место
    const reMoveHorse = () => {
        horse.style.left = `${startHorseX}px`;
        horse.style.top = `${startHorseY}px`;
    }

    // потенциальная цель переноса, над которой летим сейчас
    let currentDroppable = null;

    // движение пo drag&drop
    const horseMove = (e) => {
        moveAt(e.pageX, e.pageY);
        // прячем коня чтобы б/доступ к потенц цели
        horse.hidden = true;
        let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        horse.hidden = false;
        // у потенц. цели класс droppable
        let droppableBelow = elemBelow?.closest('.droppable');
        // если clientX/clientY за пределами окна, возврат на исходную
        if (!elemBelow) {
            reMoveHorse();
            document.removeEventListener('pointermove', horseMove);
        }
        // подсветка при пролете
        if (currentDroppable != droppableBelow) {
            // currentDroppable=null -> за/вылетаем
            // droppableBelow=null если не над droppable именно сейчас
            if (currentDroppable) { // "вылет" из droppable (удаляем подсветку)
                leaveDroppable(currentDroppable);
            }
            currentDroppable = droppableBelow;
            if (currentDroppable) { // "влетаем" в droppable -> подсветка
                enterDroppable(currentDroppable);
            }
        }
    }
    // двигаем коня при pointermove
    document.addEventListener('pointermove', horseMove);

    horse.onpointerup = () => { //отпускаем
        document.removeEventListener('pointermove', horseMove);
        horse.onpointerup = null;
        if(currentDroppable !== null) {
            setHorse(currentDroppable);
            leaveDroppable(currentDroppable);
        } else {
            reMoveHorse();
        }
    };
};
// preventDefault for drag&drop
horse.ondragstart = () => false;
*/