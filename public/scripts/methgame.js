var Levels = {
    1: [1, ['+'], 1, 2],

    2: [1, ['-'], 1, 2],

    3: [2, ['+','-'], 1, 5],
    4: [2, ['+','-'], 1, 10],

    5: [3, ['+','-'], 1, 5],
    6: [3, ['+','-'], 1, 10],
    7: [3, ['+','-'], 1, 20],
    8: [3, ['+','-'], 1, 40],

    9: [4, ['+','-'], 1, 5],
    10: [4, ['+','-'], 1, 10],
    11: [4, ['+','-'], 1, 20],
    12: [4, ['+','-'], 1, 40],

    13: [1, ['*'], 1, 5, [2]],

    14: [2, ['+', '*'], 1, 10, [2]],
    15: [2, ['-', '*'], 1, 10, [2]],

    16: [3, ['+', '-', '*'], 1, 5, [2]],
    17: [3, ['+', '-', '*'], 1, 10, [2,3,4]],
    18: [3, ['+', '-', '*'], 1, 20, [2,3,4]],

    19: [4, ['+', '-', '*'], 1, 5, [2,3,4]],
    20: [4, ['+', '-', '*'], 1, 10, [2,3,4]],
    21: [4, ['+', '-', '*'], 1, 20, [2,3,4]],
    22: [4, ['+', '-', '*'], 1, 40, [2,3,4]],
    23: [4, ['+', '-', '*'], 1, 60, [2,3,4]],
    24: [4, ['+', '-', '*'], 1, 100, [2,3,4]],
    25: [4, ['+', '-', '*'], 1, 100, [2,3,4]],

    26: [1, ['/'], 1, 50, [2], [2]],

    27: [2, ['/','*'], 1, 30, [2], [2]],

    28: [4, ['/','*','+','-'], 1, 10, [2,3], [2]],
    29: [4, ['/','*','+','-'], 1, 50, [2,3,4], [2]],
    30: [4, ['/','*','+','-'], 1, 100, [2,3,4], [2]]

};

function MathProb(opts) {
    var options = {
        operatorAmount: opts[0],
        operatorPool: opts[1],
        numbersMin: opts[2],
        numbersMax: opts[3]
    };
    this.infixTask = [];
    var operatorIndex = 0;
    if (options.operatorAmount < options.operatorPool.length){
        operatorIndex = -1;
    }
    for (var i = 0; i < options.operatorAmount; i++) {
        if (this.infixTask.length === 0) {
            this.infixTask.push(Utils.randomBetween(options.numbersMin, options.numbersMax));
        }
        var operator;
        if (operatorIndex != -1) {
            operator = options.operatorPool[operatorIndex++];
        }else{
            operator = options.operatorPool[Math.floor(Math.random() * options.operatorPool.length)]
        }
        if (operatorIndex >= options.operatorPool.length){
            operatorIndex = 0;
            if ( options.operatorAmount - i - 1 < options.operatorPool.length){
                operatorIndex = -1;
            }
        }
        this.infixTask.push(operator);
        if (operator === '*') {
            this.infixTask.push(opts[4][Math.floor(Math.random() * opts[4].length)]);
        }else if (operator === '/'){
            this.infixTask.push(opts[5][Math.floor(Math.random() * opts[5].length)]);
        }else{
            this.infixTask.push(Utils.randomBetween(options.numbersMin, options.numbersMax));
        }
    }
    this.postfixTask = Utils.infixToPostfix(this.infixTask);
    this.resultNumber = Utils.calcPostfixSolution(this.postfixTask);
    this.randomInputs = Utils.shuffle(this.infixTask.slice());
}

MathProb.prototype.isCorrectAnswer = function (tokens) {
    var result = {};
    var usedAll = true;

    var numberNext = true;
    tokens.forEach(function (val) {
        if (numberNext && isNaN(val)) {
            result.isInvalidInput = true;
        } else if (!numberNext && (val != '+' && val != '*' && val != '-' && val != '/')) {
            result.isInvalidInput = true;
        }
        numberNext = !numberNext;
    });
    if (!result.isInvalidInput) {
        tokens.forEach(function (val) {
            var isFound = false;
            app.currentProb.infixTask.forEach(function (val2) {
                if (!isFound) {
                    isFound = val == val2;
                }
            });
            if (usedAll) {
                usedAll = isFound;
            }
        });
        if (usedAll) {
            var foundResult = Utils.calcPostfixSolution(Utils.infixToPostfix(tokens));
            result.foundResult = foundResult;
            if (foundResult === app.currentProb.resultNumber) {
                result.isCorrect = true;
            } else {
                result.isCorrect = false;
            }
        } else {
            result.isInvalidInput = true;
        }
    }
    return result;
};

var Utils = {
    randomBetween: function (min, max) {
        return Math.floor(Math.random() * (max + 1 - min) + min);
    },
    infixToPostfix: function (tokens) {
        tokens = tokens.slice().reverse();
        var result = [];
        var helper = [];
        while (tokens.length != 0) {
            var token = tokens.pop();
            var nr = Number(token);
            if (!isNaN(nr)) {
                result.push(nr);
            } else {
                while (helper.length != 0 && this.biggerOrEqualImportance(helper[helper.length - 1], token)) {
                    result.push(helper.pop());
                }
                helper.push(token);
            }
        }
        while (helper.length != 0) {
            result.push(helper.pop());
        }
        return result;
    },
    biggerOrEqualImportance: function (op1, op2) {
        return (op1 === '*' || op1 === '/') || (op2 === '+' || op2 === '-');
    },
    calcPostfixSolution: function (tokens) {
        tokens = tokens.slice().reverse();
        var result = [];
        while (tokens.length != 0) {
            var token = tokens.pop();
            if (!isNaN(Number(token))) {
                result.push(token);
            } else {
                var nr2 = result.pop();
                var nr1 = result.pop();
                switch (token) {
                    case '+':
                        result.push(nr1 + nr2);
                        break;
                    case '-':
                        result.push(nr1 - nr2);
                        break;
                    case '*':
                        result.push(nr1 * nr2);
                        break;
                    case '/':
                        result.push(nr1 / nr2);
                        break;
                }
            }
        }
        return result.pop();
    },
    shuffle: function (o) {
        //noinspection StatementWithEmptyBodyJS
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
};

var app = {
    currentProb: undefined,
    draggedElem: undefined,
    draggedElemOffset: undefined,
    isDraggedElemDragged: false,
    level: 0,
    levelDetails: undefined,
    init: function () {
        $('#btnSubmit').on('click', function (e) {
            e.preventDefault();
            var tokens = [];
            $("#lstOutputs").children().each(function (i) {
                tokens.push($(this).text());
            });
            var result = app.currentProb.isCorrectAnswer(tokens);
            if (result.isInvalidInput) {
                alert("The ordening of the elements is not valid.");
            } else if (result.isCorrect) {
                alert("The answer of " + result.foundResult + " is correct!");
                app.startNextProb();
            } else {
                alert("The answer of " + result.foundResult + " is NOT correct.");
            }
        });
        $('#btnReset').on('click', function (e) {
            e.preventDefault();
            app.init();
        });
        this.checkAndUpdateHighscore();
        var lstOuputs = $('#lstOutputs');
        var lstInputs = $('#lstInputs');
        lstInputs.add(lstOuputs).on('mousedown', 'li', function (event) {
            if (!$(this).hasClass('empty-block')) {
                app.draggedElem = $(this);
                app.draggedElemOffset = app.draggedElem.offset();
                app.draggedElemOffset.left -= 10;
                app.draggedElemOffset.top -= 10;
                app.draggedElem.css({
                    boxShadow: "0 0 0"
                });
                app.isDraggedElemDragged = false;
            }
        });
        $(window).on('mousemove', function (event) {
            if (app.draggedElem) {
                app.draggedElem.css({
                    position: 'relative',
                    boxShadow: "0 0 0",
                    top: event.pageY - app.draggedElemOffset.top,
                    left: event.pageX - app.draggedElemOffset.left
                });
                app.isDraggedElemDragged = true;
            }
        });
        $(window).on('mouseup', function (event) {
            var draggedElem = app.draggedElem;
            var target = undefined;
            var txt;

            $('.droppable').each(function (index) {
                if ($(this).hasClass('hovered')) {
                    target = $(this);
                }
            });
            if (draggedElem) {
                if (app.isDraggedElemDragged) {
                    // There was a drag
                    if (!target){
                        draggedElem.removeAttr('style');
                    }else if (draggedElem.hasClass('droppable')) {
                        // an output was dragged
                        draggedElem.removeAttr('style');
                        if (target.is('li')){
                            if (!target.hasClass('empty-block')){
                                txt = draggedElem.text();
                                draggedElem.text(target.text());
                                target.text(txt);
                                target.removeAttr('style');
                            }else{
                                target.text(draggedElem.text());
                                target.removeClass('empty-block');
                                draggedElem.text('');
                                draggedElem.addClass('empty-block');
                            }
                        }else{
                            lstInputs.append($('<li>').text(draggedElem.text()));
                            draggedElem.text('');
                            draggedElem.addClass('empty-block');
                        }
                    } else {
                        // an input was dragged
                        draggedElem.removeAttr('style');
                        if (target.is('li')) {
                            // if an input was dragged onto an output
                            if (!target.hasClass('empty-block')){
                                txt = draggedElem.text();
                                draggedElem.text(target.text());
                                target.text(txt);
                                target.removeAttr('style');
                            }else{
                                target.text(draggedElem.text());
                                target.removeClass('empty-block');
                                draggedElem.remove();
                            }
                        }
                    }

                } else {
                    // There was only a click
                    if (draggedElem.hasClass('droppable')) {
                        // an output was clicked
                        $('#lstInputs').append($('<li>').text(app.draggedElem.text()));
                        draggedElem.text('').addClass('empty-block');
                        draggedElem.removeAttr('style');
                    } else {
                        // an input was clicked
                        var emptyBlock = $('.empty-block')[0];
                        if (emptyBlock) {
                            emptyBlock = $(emptyBlock);
                            emptyBlock.text(draggedElem.text());
                            emptyBlock.removeAttr('style');
                            emptyBlock.removeClass('empty-block');
                            draggedElem.remove();
                        }
                    }
                }
            }
            app.draggedElem = undefined;

        });
        var container = $("#container");
        container.on('mouseover', '.droppable', function (event) {
            $(this).addClass('hovered');
        });
        container.on('mouseout', '.droppable', function (event) {
            $(this).removeClass('hovered');
        });
        this.startNextProb();
    },
    currentProbToHtml: function () {
        var lstInputs = $('#lstInputs');
        var lstOutputs = $('#lstOutputs');
        lstInputs.empty();
        lstOutputs.empty();
        for (var i = 0; i < this.currentProb.randomInputs.length; i++) {
            lstInputs.append($('<li>').text(this.currentProb.randomInputs[i]));
            lstOutputs.append($('<li>').addClass('empty-block').addClass('droppable'));
        }
        $('#resultNumber').text(this.currentProb.resultNumber);
        $('#txfInput').val('');
        $("#level").text(this.level);
        var opts = Levels[this.level];
        $('#numbers').text(opts[2] + "-"+opts[3]);
        $('#operators').text(opts[0] + " ["+ opts[1].toString()+"]");
    },
    startNextProb: function () {
        this.checkAndUpdateHighscore();
        this.level++;
        var details = Levels[this.level];
        if (details){
            this.levelDetails = details;
        }
        this.currentProb = new MathProb(this.levelDetails);
        this.currentProbToHtml();
    },
    checkAndUpdateHighscore:  function(){
            if(!localStorage.highscore){
                localStorage.highscore = 0;
            }
            else if(localStorage.highscore < app.level){
                localStorage.highscore = app.level;
            }
            $("#highscoreValue").text(localStorage.highscore);
        }

};


$(document).ready(function () {
    app.init();
});