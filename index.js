const settings = {
    pristine: true,
    positionsLength: 8,
    placeholder: 'x',
    firstTry: '12+57=69',
    allPossibleChars: '0123456789+-*/=',
    allPossibleSigns: '+-*/=',
    allPossibilitiesAfterSign: '0123456789-',
    existingInWrongPosition: '',
    impossibleChars: '',
    notTriedYet: '',
    possibilities: '',
    possibilitiesAfterEquals: '',
    positions: [{
        wrongPositionChars: '',
        impossibleChars: '',
        value: ''
    }]
};

function setPositions() {
    settings.positions = [];
    for (let i = 0; i < settings.positionsLength; i++) {
        settings.positions.push({
            wrongPositionChars: '',
            impossibleChars: ''
        });
    }

    settings.positions[0].impossibleChars = '+-*/=';
    settings.positions[1].impossibleChars = '=';
    settings.positions[settings.positions.length - 1].impossibleChars = '+-*/=';
    settings.positions[settings.positions.length - 2].impossibleChars = '+-*/';
    settings.positions[settings.positions.length - 3].impossibleChars = '+-*/';
}

function registerGuess(guess) {
    settings.pristine = false;

    settings.impossibleChars = getUnique(`${settings.impossibleChars}${guess.impossibleChars}`);
    settings.existingInWrongPosition = '';

    for (let i = 0; i < settings.positions.length; i++) {
        const settingsPosition = settings.positions[i];
        const guessPosition = guess.positions[i];

        settingsPosition.value = settingsPosition.value || guessPosition.value;
        settingsPosition.wrongPositionChars = getUnique(`${settingsPosition.wrongPositionChars}${guessPosition.wrongPositionChar}`);

        settings.existingInWrongPosition = getUnique(`${settings.existingInWrongPosition}${guessPosition.wrongPositionChar}`)
    }
}

function nextGuess() {
    if (settings.pristine) {
        return settings.firstTry;
    }
    
    let guessPositionsWithRightShots = setPositionsWithRightShots();
    
    settings.notTriedYet = settings.allPossibleChars
        .split('')
        .filter(x => settings.impossibleChars.indexOf(x) === -1)
        .filter(x => settings.existingInWrongPosition.indexOf(x) === -1)
        .join('');
    
    settings.possibilities = getUnique(`${settings.existingInWrongPosition}${settings.notTriedYet}`);   
    settings.possibilitiesAfterEquals = settings.possibilities.replace(/[+\-\*\/=]/g, '');
    
    let guessNumber = 0;
    let guessPositions = '';
    while (true) {
        guessPositions = calculateCandidateGuess(guessPositionsWithRightShots);

        guessNumber++;

        if (!checkGuessesPositionParts(guessPositions)) {
            continue;
        }

        const notIncludedChars = settings.existingInWrongPosition.replace(new RegExp(`[${guessPositions.replace(/\-/g, '\\-')}]`, 'g'), '');

        if (notIncludedChars) {
            continue;
        }

        if (testGuessPosition(guessPositions)) {
            break;
        }
    }

    return guessPositions;
}

function setPositionsWithRightShots() {
    let guessPositionsWithRightShots = '';
    for (let i = 0; i < settings.positions.length; i++) {
        const position = settings.positions[i];

        if (position.value) {
            guessPositionsWithRightShots += position.value;
            continue;
        }

        guessPositionsWithRightShots += settings.placeholder;
    }

    return guessPositionsWithRightShots;
}

function calculateCandidateGuess(guessPositionsWithRightShots) {
    guessPositions = guessPositionsWithRightShots;

    let equalsSet = false;
    for (let i = 0; i < settings.positions.length; i++) {
        if (guessPositions[i] === '=') {
            equalsSet = true;
            continue;
        }

        if (guessPositions[i] !== settings.placeholder) {
            continue;
        }

        if (!equalsSet && i == settings.positions.length - 2) {
            guessPositions = setCharAt(guessPositions, i, '=');
            continue;
        }

        const currentValue = calculateCurrentPositionValue(equalsSet, i);

        guessPositions = setCharAt(guessPositions, i, currentValue);

        if (currentValue === '=') {
            equalsSet = true;
        }
    }

    return guessPositions;
}

function calculateCurrentPositionValue(equalsSet, positionIndex) {
    do {
        const pos = Math.floor(Math.random() * (equalsSet ? settings.possibilitiesAfterEquals : settings.possibilities).length);
        const currentValue = settings.possibilities[pos];
        
        if (settings.positions[positionIndex].wrongPositionChars.indexOf(currentValue) === -1 &&
            settings.positions[positionIndex].impossibleChars.indexOf(currentValue) === -1
        ) {
            if (positionIndex > 0 && 
                settings.allPossibleSigns.indexOf(guessPositions[positionIndex - 1]) !== -1 &&
                settings.allPossibilitiesAfterSign.indexOf(currentValue) === -1
            ) {
                continue;
            }

            return currentValue;
        }
    } while (true);
}

function checkGuessesPositionParts(guessPositions) {   
    const pieces = guessPositions.split('=');
    const beforeEquals = pieces[0];
    const afterEquals = pieces[1];

    if (!beforeEquals || !afterEquals) {
        return false;
    }

    if (afterEquals.length > 1 && afterEquals[0] === '0') {
        return false;
    }

    const matches = beforeEquals.match(/\d+[+\-*\/]*/g);

    for (const match of matches) {
        const matchWithtoutSign = match.replace(/[^\d]/g, '');

        if (matchWithtoutSign.length > 1 && matchWithtoutSign[0] === '0') {
            return false;
        }
    }

    return true;
}

function testGuessPosition(guessPositions) {
    try {
        const test = guessPositions.replace('=', '===');

        console.log(test);

        if (eval(test) === true) {
            return true;
        }
    } catch (err) {}

    return false;
}

function getUnique(v) {
    return v.split('')
        .filter((value, index, self) => self.indexOf(value) === index)
        .join('');
}

function setCharAt(str, index, chr) {
    if (index > str.length - 1) {
        return str;
    }

    return str.substring(0, index) + chr + str.substring(index + 1);
}


setPositions();

/* *****************************************************************
// add this for every time you make a guess

registerGuess({
    impossibleChars: '',
    positions: [{
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        },
        {
            wrongPositionChar: '',
            value: ''
        }
    ]
});

***************************************************************** */

const next = nextGuess();

console.log('next', next);
