"use strict";

/* Elements */
const e_password = document.getElementById("password");
const e_togglePassword = document.getElementById("togglePassword");

const e_generatePassword = document.getElementById('generatePassword');
const e_copyPassword = document.getElementById('copyPassword');

const e_passwordLength = document.getElementById("passwordLength");
const e_passwordLengthText = document.getElementById("passwordLengthText");
const e_passwordCrackTime = document.getElementById('passwordCrackTime');
const e_progress = document.getElementsByClassName('progress')[0];

const e_passwordType = document.getElementById('passwordType');

const e_partMain = document.getElementById('partMain');

const e_includeUppercase = document.getElementById('includeUppercase');
const e_includeLowercase = document.getElementById('includeLowercase');
const e_includeDigits = document.getElementById('includeDigits');
const e_includeSymbols = document.getElementById('includeSymbols');

const e_title = document.getElementById('title');

/* Constants */
const generationData = {
    alphabets: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '-+_!@#$%^&*.,?]',
    separators: '-=+/_.?:;|',
    wordList: ['correct', 'horse', 'battery', 'staple'],
    
    obviousSymbolSubstitutions: {
        'a': '@',
        's': '$',
        'h': '#',
        'i': '!',
        'c': '('
    },
    obviousDigitSubstitutions: {
        'a': '4',
        'o': '0',
        'l': '1',
        'e': '3',
        't': '7',
        's': '5'
    },
    substitutions: {
        'a': '@',
        'h': '#'
    }
};

// Populate the wordlist with words from the text file.
(async () => {
    let _response = await fetch('wordlist.txt');
    let _responseText = await _response.text();
    generationData.wordList = _responseText.split('\n');
})();


/* Global Variables */
/** Current generator being used represented as a string. */
var currentGenerator;

/* Utility Functions */
/**
 * Randomly generate an integer between two values.
 * @param  {Number} min Minimum (inclusive).
 * @param  {Number} max Maximum (inclusive).
 * @return {NumbeR} Randomly generated number.
 */
function randomRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Randomly pick an element from given array.
 * @param  {Array} array Input array.
 * @return {any} Random item from the array.
 */
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Randomly pick between true/false with custom probability.
 * @param  {Number} probability percentage.
 * @return {Boolean} Returns true specified percent of the times.
 */
function randomChance(probability) {
    return Math.random() < probability;
}

/**
 * Randomly shuffle an array using the [Fisher-Yates (Durstenfeld)](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm) algorithm.
 * @param  {Array} array Input array.
 * @return {Array} Shuffled, output array.
 */
function randomShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Calculates password entropy in bits. 
 * @param {String} password The password to calculate the entropy of. 
 * @return {Number} Bits of entropy. 
 */
function calculatePasswordEntropy(password) {
    let _uppercase = password.match(/(?=.*[A-Z])/) != null;
    let _lowercase = password.match(/(?=.*[a-z])/) != null;
    let _digits = password.match(/(?=.*\d)/) != null;
    let _symbols = password.match(/(?=.*[-+_!@#$%^&*.,?])/) != null;

    // E = L * log(R) / log(2)
    const R = (26 * _lowercase) + (26 * _uppercase) + (10 * _digits) + (14 * _symbols);
    const E = password.length * (Math.log(R) / Math.log(2));
    return Math.round(E);
}

/**
 * Check if all the checkboxes are unticked.
 */
function areAllCheckboxesUnticked() {
    // single if statement would've worked here but this might be used differently in a future update
    let _remains = 4;
    if (!e_includeUppercase.checked) _remains -= 1;
    if (!e_includeLowercase.checked) _remains -= 1;
    if (!e_includeDigits.checked) _remains -= 1;
    if (!e_includeSymbols.checked) _remains -= 1;
    if (_remains === 0) return true;
    else return false;
}

/* Password Generator Functions */
/**
 * **Generator: Ramdom String**
 * 
 * Generates random string based on given parameters of specified length.
 * @param  {Number} length The length of the generated password.
 * @param {Boolean} uppercase Whether uppercase alphabets should be included.
 * @param {Boolean} lowercase Whether lowercase alphabets should be included.
 * @param {Boolean} digits Whether digits should be included.
 * @param {Boolean} symbols Whether symbols should be included.
 * @return {String} A randomized, secure password.
 */
function generateRandomString(length, uppercase, lowercase, digits, symbols) {
    let _randomChars = [];
    let _passData = {
        uppercase: 0,
        lowercase: 0,
        digits: 0,
        symbols: 0
    };

    let _conditions = 0;
    if (uppercase) _conditions++;
    if (lowercase) _conditions++;
    if (digits) _conditions++;
    if (symbols) _conditions++;

    let _chunks = Math.floor(length / _conditions);
    let _leftover = length % _conditions;

    // assigning equal values to all halves
    if (uppercase) _passData.uppercase = _chunks;
    if (lowercase) _passData.lowercase = _chunks;
    if (digits) _passData.digits = _chunks;
    if (symbols) _passData.symbols = _chunks;

    // If we have any number remaining, we'll add that to the existing satisfied conditions in the following order. 
    if (_leftover > 0) {
        if (_passData.lowercase > 0) {
            _passData.lowercase += _leftover;
        } else if (_passData.uppercase > 0) {
            _passData.uppercase += _leftover;
        } else if (_passData.digits > 0) {
            _passData.digits += _leftover;
        } else if (_passData.symbols > 0) {
            _passData.digits += _leftover;
        }
    }

    // Generating characters.
    for (let i = 0; i < _passData.lowercase; i++) {
        _randomChars.push(randomChoice(generationData.alphabets));
    }
    for (let i = 0; i < _passData.uppercase; i++) {
        _randomChars.push(randomChoice(generationData.alphabets.toUpperCase()));
    }
    for (let i = 0; i < _passData.digits; i++) {
        _randomChars.push(randomChoice(generationData.digits));
    }
    for (let i = 0; i < _passData.symbols; i++) {
        _randomChars.push(randomChoice(generationData.symbols));
    }

    let result = _randomChars.join(''); // shuffle
    return result;
}

/**
 * **Generator: Pseudoword**
 * 
 * Generates a password that can be pronounced (most of the times).
 * @param  {Number} length The length of the generated pseudoword.
 * @return {String} A pronouncable pseudoword.
 */
function generatePseudoword(length) {
    return GPW.pronounceable(length);
}

/**
 * **Generator: Pseudoword + Passphrase**
 * 
 * Generates a passphrase that consists of pseudowords.
 * @param  {Number} wordsLength The number of words in passphrase.
 * @param {Number} minLength Minimum length of each word.
 * @param {Number} maxLength Maximum length of each word.
 * @return {Array} Passphrases in an array.
 */
function generatePseudowordPassphrase(wordsLength, minLength, maxLength) {
    let _passphrases = [];
    for (let i = 0; i < wordsLength; i++) {
        let _randomMinMax = randomRange(minLength, maxLength);
        let _generatedWord = generatePseudoword(_randomMinMax);
        _passphrases.push(_generatedWord);
    }
    return _passphrases;
}

/**
 * **Generator: Passphrase**
 * 
 * Generates a passphrase using words.
 * @param  {Number} wordsLength The number of words in passphrase.
 * @return {Array} Passphrases in an array.
 */
function generatePassphrase(wordsLength) {

    let _passphrases = [];
    for (let i = 0; i < wordsLength; i++) {
        let _generatedWord = randomChoice(generationData.wordList);
        _passphrases.push(_generatedWord);
    }
    return _passphrases;
}

/**
 * [**M**odify **U**ntil **N**ot **G**uessed **E**asily.](https://en.wikipedia.org/wiki/Munged_password)
 * 
 * Make an existing password more secure by by substituting characters.
 * @param  {String} password The password.
 * @param  {Boolean} uppercase Whether to use uppercase english alphabets.
 * @param  {Boolean} lowercase Whether to use lowercase english alphabets.
 * @param  {Boolean} digits Whether to use digits.
 * @param  {Boolean} symbols Whether to use symbols.
 * @return {String} Resulting password.
 */
function munge(password, uppercase, lowercase, digits, symbols) {
    let _pass = password;
    let _split = _pass.split('');
    // let words = _split.includes(' ');

    // First letter substitution.
    let _firstChar = _split[0].toLowerCase();
    if (symbols && digits && (_firstChar in generationData.obviousDigitSubstitutions && _firstChar in generationData.obviousSymbolSubstitutions)) {
        // Substitute randomly with 50% chance for either way.
        _split[0] = randomChance(.5) ? generationData.obviousDigitSubstitutions[_firstChar] : generationData.obviousSymbolSubstitutions[_firstChar];
    } else if (digits && _firstChar in generationData.obviousDigitSubstitutions) {
        _split[0] = generationData.obviousDigitSubstitutions[_firstChar];
    }

    // Start loop from the index pos 1
    //let _lastChar = '';
    for (let i = 1; i < _split.length; i++) {
        const _char = _split[i];
 
        if (lowercase && uppercase) {
            _split[i] = randomChance(.5) ? _char.toLowerCase() : _char.toUpperCase();
            
            // To-do: Making the munging more easier to remember.
            // If the previous character was a space. The next character will most likely be the start of a new word.
            // Capitalizing this possibly new word would make the password somewhat easier to remember.
            /*
            if (words) { code }
            if (_lastChar === ' ') {
                _split[i] = _char.toUpperCase();
            }*/
        } else if (lowercase) {
            _split[i] = _char.toLowerCase();
        } else if (uppercase) {
            _split[i] = _char.toUpperCase();
        }

        //_lastChar = _char;
        /*if (symbols && _char in generationData.substitutions && randomChance(.6)) {
            _split[i] = generationData.substitutions[_char];
        }*/
    }

    // Append digits at the end 50% of the time if the password has suitable length.
    // To-Do: Make these digits memorable numbers.
    if (digits && _split.length < 14 && randomChance(.5)) {
        _split.push(randomRange(1000, 9999).toString());
    }

    _pass = _split.join('');

    if (symbols /* && words */) {
        _pass = _pass.replaceAll(' ', randomChoice(generationData.separators))
    }
    return _pass;
}

/* Generator Functions */

/**
 * Regenerates password and updates fields.
 */
function regeneratePassword() {
    e_password.value = generatePassword(currentGenerator, true);
    updateStrength();
    updateSlider();
}

/**
 * Set the password strength progress bar value with color.
 */
function setProgressBar(percentage, color = 'auto') {
    e_progress.style.width = `${percentage}%`;
    if (color === 'color') {
        if (percentage > 80) color = "#006b4d";
        else if (percentage > 50) color = "#00a878";
        else if (percentage > 33) color = "#efc20f";
        else if (percentage > 20) color = "#be4e3a";
        else color = "#df6661";
    }
    e_progress.style.backgroundColor = color;
}

/**
 * Update the character/word length slider.
 */
function updateSlider() {
    if (currentGenerator === 'passphrase' || currentGenerator === 'pseudoword+passphrase') {
        let _len = e_passwordLength.value;
        // Update label.
        e_passwordLengthText.textContent = `Word Count: (${_len})`;
        // Update slider (capped at 32).
        //e_passwordLength.value = _len > 32 ? 32 : _len;
        e_passwordLength.max = 32;  // not above 32 words.

    } else {
        let _len = e_password.value.length;
        // Update label.
        e_passwordLengthText.textContent = `Length (${_len})`;
        // Update slider (capped at 128).
        e_passwordLength.value = _len > 128 ? 128 : _len;
        e_passwordLength.max = 128;  // not above 128 characters.
    }
}

/**
 * Update the progress bar and the background color from the strength of the password.
 */
function updateStrength() {
    // Estimate time required to crack the password.
    let _strength = zxcvbn(e_password.value);
    let _crackTime = _strength.crack_times_display["online_no_throttling_10_per_second"];

    // Display it in text for the user to see.
    e_passwordCrackTime.innerText = _crackTime;

    switch (_strength.score) {
        case 0: {
            setProgressBar(20, '#df6661');
            e_partMain.style.backgroundColor = "#d1364e"; // red
            break;
        }
        case 1: {
            setProgressBar(33, '#be4e3a');
            e_partMain.style.backgroundColor = "#993220";
            break;
        }
        case 2: {
            setProgressBar(50, '#efc20f');
            e_partMain.style.backgroundColor = "#B49B18"; // dark yellow
            break;
        }
        case 3: {
            setProgressBar(80, '#00a878');
            e_partMain.style.backgroundColor = "#33c770";
            break;
        }
        default: {
            setProgressBar(100, '#006b4d');
            e_partMain.style.backgroundColor = "#1c815a";
            break;
        }
    }

    // Take time in calculating the password entropy.
    setTimeout(() => {
        e_password.title = `${calculatePasswordEntropy(e_password.value)} bits of bruteforce entropy.`;    
    }, 500);
}

/**
 * Sets up the environment for specified generator and regenerates password.
 */
function setGenerator(generator) {
    currentGenerator = generator;

    if (currentGenerator === 'randomString') {
        e_title.innerText = 'Generate a strong and secure password.';
    } else if (currentGenerator === 'pseudoword') {
        e_title.innerText = 'Generate a strong and pronouncable password.';
    } else if (currentGenerator === 'passphrase') {
        e_title.innerText = 'Generate a secure passphrase.';
    } else if (currentGenerator === 'pseudoword+passphrase') {
        e_title.innerText = 'Generate a strong and pronouncable passphrase.';
    }
    setOptimumValues(currentGenerator);
    regeneratePassword();
}

/**
 * Set the optimum (default) values for the generators.
 */
function setOptimumValues(generator) {
    if (generator === 'randomString') {
        e_passwordLength.value = 8;
        e_includeDigits.checked = true;
        e_includeLowercase.checked = true;
        e_includeUppercase.checked = true;
        e_includeSymbols.checked = false;
    } else if (generator === 'passphrase') {
        e_passwordLength.value = 4;
        e_includeDigits.checked = false;
        e_includeLowercase.checked = true;
        e_includeUppercase.checked = false;
        e_includeSymbols.checked = true;
    } else if (generator === 'pseudoword') {
        e_passwordLength.value = 8;
        e_includeDigits.checked = true;
        e_includeLowercase.checked = true;
        e_includeUppercase.checked = false;
        e_includeSymbols.checked = false;
    } else if (generator === 'pseudoword+passphrase') {
        e_passwordLength.value = 4;
        e_includeDigits.checked = false;
        e_includeLowercase.checked = true;
        e_includeUppercase.checked = false;
        e_includeSymbols.checked = true;
    }
}

/**
 * Generates a new password using whichever generator is specified and returns as string.
 */
function generatePassword(generator, mungePassword) {
    // To-Do: Perhaps include parameters as an object argument for the generate password function.

    let _password = ''

    if (generator === 'randomString') {
        _password = generateRandomString(
            parseInt(e_passwordLength.value),
            e_includeUppercase.checked,
            e_includeLowercase.checked,
            e_includeDigits.checked,
            e_includeSymbols.checked
        );
    } else if (generator === 'pseudoword') {
        _password = generatePseudoword(parseInt(e_passwordLength.value));
    } else if (generator === 'passphrase') {
        _password = generatePassphrase(parseInt(e_passwordLength.value)).join(' ')
    } else if (generator === 'pseudoword+passphrase') {
        _password = generatePseudowordPassphrase(
            parseInt(e_passwordLength.value),
            randomRange(4, 5),
            randomRange(7, 9)
        ).join(' ');
    }

    return mungePassword ? munge(
        _password,
        e_includeUppercase.checked,
        e_includeLowercase.checked,
        e_includeDigits.checked,
        e_includeSymbols.checked
    ) : _password;
}

/* Event Listeners */

// Prevents all checkboxes from being unticked.
e_includeUppercase.addEventListener('click', (e) => {
    if (areAllCheckboxesUnticked()) {
        e.preventDefault();  // prevent unticking if all others are unticked.
    } else {
        regeneratePassword();  // regenerate the password with new attributes.
    }
});
e_includeLowercase.addEventListener('click', (e) => {
    if (areAllCheckboxesUnticked()) {
        e.preventDefault();  // prevent unticking if all others are unticked.
    } else {
        regeneratePassword();  // regenerate the password with new attributes.
    }
});
e_includeDigits.addEventListener('click', (e) => {
    if (areAllCheckboxesUnticked()) {
        e.preventDefault();  // prevent unticking if all others are unticked.
    } else {
        regeneratePassword();  // regenerate the password with new attributes.
    }
});
e_includeSymbols.addEventListener('click', (e) => {
    if (areAllCheckboxesUnticked()) {
        e.preventDefault();  // prevent unticking if all others are unticked.
    } else {
        regeneratePassword();  // regenerate the password with new attributes.
    }
});

// Show / hide the password input field.
e_togglePassword.addEventListener("click", function (e) {
    // toggle the type attribute
    const type = e_password.getAttribute("type") === "password" ? "text" : "password";
    e_password.setAttribute("type", type);
    // toggle the eye / eye slash icon
    this.classList.toggle("bi-eye");
});

// When input is modified.
e_password.addEventListener("input", () => {
    updateStrength();
    updateSlider();
});

// Generate a new password.
e_generatePassword.addEventListener('click', () => {
    regeneratePassword();
});

// Copy the generated password into clipboard.
e_copyPassword.addEventListener('click', () => {
    e_password.select();
    e_password.setSelectionRange(0, 99999); // for mobile
    //document.execCommand('copy');
    navigator.clipboard.writeText(e_password.value);
    alert("Copied to clipboard.");
});

// When the password generator is changed.
e_passwordType.addEventListener('change', () => {
    setGenerator(e_passwordType.value);
});

// When the slider is manually adjusted.
e_passwordLength.addEventListener('input', () => {
    regeneratePassword();
});

// Automatically adjust font size based on password length to fit inside the password box.
/*e_password.addEventListener('input', () => {
    let _val = e_password.value;
    if (_val.length >= 30) {
        e_password.style.fontSize = '1.5rem';
    } else if (_val.length >= 20) {
        e_password.style.fontSize = '2rem';
    } else {
        e_password.style.fontSize = '2.25rem';
    }
});*/
setGenerator('randomString');
