/* 
 * 2048 Game
 * An html5 implementation of Gabriele Cirulli's 2048 game
 * Programmed in 2016 by David Crespo
 */

var tilesX = 4;
var tilesY = 4;
var tileW = 160;
var tileH = 160;

var emptydiv = '<div></div>';

var garr = [];

var score = 0;

var lastadded = "";

var moves1d = {};
var moves2d = {};

var p2not4 = 0.75;

// creamos el tablero vacio con las casillas guía
var createGameFrame = function() {
    var frame = $("#gameframe");
    frame.width(tilesX * tileW);
    frame.height(tilesY * tileH);
    
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            var bgtile = $(emptydiv);
            frame.append(bgtile);
            bgtile.attr('id', 'bgtile'+x+''+y);
            bgtile.addClass('bgtile').width(tileW).height(tileH);
            bgtile.css({left: x * tileW, top: y * tileH});
            
            var bgtile2 = $(emptydiv);
            bgtile.append(bgtile2);
            bgtile2.addClass('bgtile2');
        }
    }
};

// calcular el indice para el array
// dadas las componentes x e y
var indexForXY = function(x, y) {
    return x + y * tilesX;
};

// crear el array de juego, con todas las casillas a 0
var createGameArray = function() {
    var a = [];
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            a[indexForXY(x,y)] = 0;
        }
    }
    return a;
};

// manejador de eventos de teclado,
// realiza el movimiento adecuado
// en funcion de la tecla pulsada
var onKey = function(event) {
    if (event.key === 'ArrowLeft') {
        console.log('left');
        onMovement(false,false);
    }
    else if (event.key === 'ArrowRight') {
        console.log('right');
        onMovement(false,true);
    }
    else if (event.key === 'ArrowUp') {
        console.log('up');
        onMovement(true,false);
    }
    else if (event.key === 'ArrowDown'){
        console.log('down');
        onMovement(true,true);
    }
};

// duplica un array de juego
var duplicatedArrFrom = function(arr) {
    var brr = [];
    for (var i = 0; i < arr.length; i++) {
        brr[i] = arr[i];
    }
    return brr;
};

// crea un array traspuesto
var transposedArrFrom = function(arr) {
    var brr = [];
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            brr[indexForXY(y,x)] = arr[indexForXY(x,y)];
        }
    }
    return brr;
};

// crea un array espejo
var mirroredArrFrom = function(arr) {
    var brr = [];
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            var x2 = -1 + tilesX - x;
            brr[indexForXY(x,y)] = arr[indexForXY(x2,y)];
        }
    }
    return brr;
};

// convierte un array de juego en un array 2d
// para evaluar movimientos
var arr2FromArr = function(arr) {
    var arr2 = [];
    for (var y = 0; y < tilesY; y++) {
        arr2[y] = [];
        for (var x = 0; x < tilesX; x++) {
            arr2[y][x] = arr[indexForXY(x,y)];
        }
    }
    return arr2;
};

// convierte un array 2d en un array de juego
var arrFromArr2 = function(arr2) {
    var arr = [];
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            arr[indexForXY(x,y)] = arr2[y][x];
        }
    }
    return arr;
};

// evalua movimiento hacia la izquierda
// en una fila de un array 2d
// row -> row2 -> row
var performStepOnArr2Row = function(row) {
    var cnt = row.length;
    var row2 = [];
    
    // ponemos los elementos de row2 a cero.
    for (var i = 0; i < cnt; i++) {
        row2[i] = 0;
    }
    // copiamos los elementos de row a row2
    // alineando hacia la izquierda
    // los elementos distintos de cero
    // y los ceros a la derecha.
    var j = 0;
    for (var i = 0; i < cnt; i++) {
        var val = row[i];
        if (val > 0) {
            row2[j] = val;
            j += 1;
        }
    }
    // recorremos row2 por parejas de elementos
    // si dos elementos de una pareja son iguales
    // el izquierdo pasa a ser la suma
    // y el derecho cero
    for (var i = 1; i < cnt; i++) {
        if (row2[i-1] === row2[i] && row2[i] !== 0) {
            var sum = row2[i-1] + row2[i];
            row2[i-1] = sum;
            row2[i] = 0;
            score += sum;
        }
    }
    // ponemos los elementos de row a 0
    for (var i = 0; i < cnt; i++) {
        row[i] = 0;
    }
    // copiamos los elementos de row2 a row
    // alineando hacia la izquierda
    // los elementos distintos de cero
    // y los ceros a la derecha.
    var j = 0;
    for (var i = 0; i < cnt; i++) {
        var val = row2[i];
        if (val > 0) {
            row[j] = val;
            j += 1;
        }
    }
};

// evaluamos movimientos en el array 2d,
// descomponiendolo en sus filas
var performStepOnArr2 = function(arr2) {
    for (var i = 0; i < arr2.length; i++) {
        row = arr2[i];
        performStepOnArr2Row(row);
    }
};

// compara dos game arrays
var equalArrs = function(arr,brr) {
    var an = arr.length;
    var bn = arr.length;
    if (an !== bn) return false;
    for (var i = 0; i < an; i++) {
        if (arr[i] !== brr[i])
            return false;
    }
    return true;
};

// evalua movimiento
// ver: true si   vertical, false si  horizontal
// fwd: true si dcha/abajo, false si izda/arriba
var processMovement = function(arr, ver, fwd) {
    // si es necesario, trasponemos y/o 'espejamos'
    // para convertir todos los movimientos a 'izquierda'
    if (ver) arr = transposedArrFrom(arr);
    if (fwd) arr =   mirroredArrFrom(arr);
    
    // convertimos array a array2d
    var arr2 = arr2FromArr(arr);
    // evaluamos movimiento sobre array2d (a izquierda)
    performStepOnArr2(arr2);
    // convertimos array2d a array
    arr = arrFromArr2(arr2);
    
    // deshacemos trasposicion y/o espejo
    if (fwd) arr =   mirroredArrFrom(arr);
    if (ver) arr = transposedArrFrom(arr);
    
    return arr;
};
    
// reacciona al movimiento
// ver: true si   vertical, false si  horizontal
// fwd: true si dcha/abajo, false si izda/arriba
var onMovement = function(ver, fwd) {
    // copiamos game array para detectar
    // posibles cambios tras el movimiento
    prev = duplicatedArrFrom(garr);
    
    // procesamos movimiento
    garr = processMovement(garr, ver, fwd);
    
    // comparamos array actual y previo;
    // si no ha habido cambios, salimos
    if (equalArrs(garr,prev))
        return;
    
    // si hay espacio libre, aniadimos elemento
    if (isTileAvailableInArr(garr))
        addNewElementToArr(garr);
    
    // redibujamos elementos
    updateGameFrame();
    
    // actualizamos puntuación
    $("#scorevalue").text(""+score);
    
    // comprobamos si ha terminado la partida
    checkGameOver();
};

// comprobamos si no hay mas movimientos posibles
var checkGameOver = function() {
    // probamos los 4 movimientos posibles
    // sobre un tablero auxiliar que no afecta al principal
    var aux = processMovement(garr, false, false);
    if (!equalArrs(aux, garr)) return;
    var aux = processMovement(garr, false, true);
    if (!equalArrs(aux, garr)) return;
    var aux = processMovement(garr, true, false);
    if (!equalArrs(aux, garr)) return;
    var aux = processMovement(garr, true, true);
    if (!equalArrs(aux, garr)) return;

    // si hemos llegado aqui es porque no ha habido
    // cambios en el tablero auxiliar
    $('#gameover').css('visibility', 'visible');
    $('#restart' ).css('visibility', 'visible');
};

// evalua si hay alguna casilla vacia
// y devuelve true en caso afirmativo
var isTileAvailableInArr = function(arr) {
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            val = arr[indexForXY(x,y)];
            if (val === 0)
                return true;
        }
    }
    return false;
};

var random2or4 = function() {
    if (Math.random() < p2not4)
        return 2;
    else
        return 4;
};

// aniade un nuevo elemento al array de juego
var addNewElementToArr = function(arr) {
    used = true;
    while (used) {
        var x = Math.floor(tilesX * Math.random());
        var y = Math.floor(tilesY * Math.random());
        val = arr[indexForXY(x,y)];
        if (val === 0) {
            used = false;
            arr[indexForXY(x,y)] = random2or4();
            lastadded = 'tile'+x+''+y;
        }
    }
};

// aniade una casilla al tablero de juego
var addTile = function(x,y,value) {
    var frame = $("#gameframe");
    var tile = $(emptydiv);
    var tileid = 'tile'+x+''+y;
    frame.append(tile);
    tile.attr('id', tileid);
    tile.addClass('tile').width(tileW).height(tileH);
    tile.css({left: x * tileW, top: y * tileH});
    
    var tile2 = $(emptydiv);
    tile.append(tile2);
    tile2.addClass('tile2');
    tile2.addClass('num'+value);
    tile2.text(value);
    tile2.css('line-height', tile2.height()+'px');
    tile2.css('font-size', Math.floor(0.35*tile2.width())+'px');
    
    if (lastadded === tileid || lastadded === "") {
        tile.hide();
        tile.fadeIn(500);
    }
};

// actualizamos el tablero de juego
// borrando todos los elementos
// y creandolos nuevos a partir del array de juego
var updateGameFrame = function() {
    $('.tile').remove();
    for (var y = 0; y < tilesY; y++) {
        for (var x = 0; x < tilesX; x++) {
            value = garr[indexForXY(x,y)];
            if (0 !== value) {
                addTile(x,y,value);
            }
        }
    }
};

$.fn.centerInParent = function() {
    this.each(function() {
        var x = 0.5 * ($(this).parent().width () - $(this).width ());
        var y = 0.5 * ($(this).parent().height() - $(this).height());
        $(this).css({left:x, top:y});
    });
};

var pointerX;
var pointerY;
var pointerTime = null;
var swipeThreshold = 20;

var onMouseStart = function(e) {
    e.preventDefault();
    onPointerStart(e.pageX, e.pageY);
};

var onMouseMove = function(e) {
    e.preventDefault();
    onPointerMove(e.pageX, e.pageY);
};

var onMouseEnd = function(e) {
    e.preventDefault();
    onPointerMove(e.pageX, e.pageY);
};

var debugEvent = function(e) {
    s = "";
    for (var key in e) {
        s += key + "<br>";
    }
    $("body").html(s);
};

var onTouchStart = function(e) {
    e.preventDefault();
    if (e.targetTouches === undefined) return;
    if (e.targetTouches.length === 1) {
        var touch = e.targetTouches[0];
        onPointerStart(touch.pageX, touch.pageY);
    }
};

var onTouchMove = function(e) {
    e.preventDefault();
    if (e.targetTouches === undefined) return;
    if (e.targetTouches.length === 1) {
        var touch = e.targetTouches[0];
        onPointerMove(touch.pageX, touch.pageY);
    }
};

var onTouchEnd = function(e) {
    e.preventDefault();
    if (e.targetTouches === undefined) return;
    if (e.targetTouches.length === 1) {
        var touch = e.targetTouches[0];
        onPointerEnd(touch.pageX, touch.pageY);
    }
};

var onPointerStart = function(x,y) {
    pointerX = x;
    pointerY = y;
    pointerTime = (new Date).getTime();
};

var onPointerMove = function(x,y) {
    if (pointerTime === null)
        return;
    
    deltaTime = (new Date).getTime() - pointerTime;
    if (deltaTime > 1000) {
        pointerTime = null;
        return;
    }
    
    deltaX = x - pointerX;
    deltaY = y - pointerY;
    
    if (Math.abs(deltaX) > 2*Math.abs(deltaY)) {
        // horizontal
        if (deltaX <= -swipeThreshold) {
            pointerTime = null;
            onMovement(false, false);
        }
        else if (deltaX >= swipeThreshold) {
            pointerTime = null;
            onMovement(false, true);
        }
    }
    
    if (Math.abs(deltaY) > 2*Math.abs(deltaX)) {
        // vertical
        if (deltaY <= -swipeThreshold) {
            pointerTime = null;
            onMovement(true, false);
        }
        else if (deltaY >= swipeThreshold) {
            pointerTime = null;
            onMovement(true, true);
        }
    }
};

var onPointerEnd = function(x,y) {
};

var onWindowLoad = function() {
    
    createGameFrame();
    $("#gameover").centerInParent();
    
    $('body').keydown(onKey);
    
    restart();
    $('#restart').on('click', restart);
    
    $('#gameframe').on('mousedown',  onMouseStart);
    $('#gameframe').on('mousemove',  onMouseMove);
    $('#gameframe').on('mouseup',    onMouseEnd);

    var gameframe = document.getElementById("gameframe");
    gameframe.addEventListener("touchstart", onTouchStart, false);    
    gameframe.addEventListener("touchmove", onTouchMove, false);    
    gameframe.addEventListener("touchend", onTouchEnd, false);    
};

var restart = function() {
    // actualizamos puntuación
    score = 0;
    $("#scorevalue").text(""+score);
    
    $('#gameover').css('visibility', 'hidden');
    
    garr = createGameArray();
    
    addNewElementToArr(garr);
    addNewElementToArr(garr);
    
    lastadded = "";
    
    // garr = [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384,32768,65536];
    
    updateGameFrame();
};


$(window).load(onWindowLoad);


