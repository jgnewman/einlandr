
function deepCopy([name, obj], valueModifier) {
  let newCopy;

  // Run our value modifier on the incoming object
  const modObj = valueModifier ? valueModifier(name, obj) : obj;

  // If the resulting value is an array, make a new array
  // and recursively deep copy the array.
  if (Array.isArray(modObj)) {
    newCopy = [];
    modObj.map((item, index) => {
      return newCopy.push(deepCopy([index, item], valueModifier));
    });

  // If the resulting value is an object, make a new object
  // and recursively deep copy the object.
  } else if (modObj !== null && typeof modObj === 'object') {
    newCopy = {};
    Object.keys(modObj).forEach(key => {
      newCopy[key] = deepCopy([key, modObj[key]], valueModifier)
    });

  // If the resulting value is anything else,
  // return it.
  } else {
    newCopy = modObj;
  }
  return newCopy;
}

function removePasswords(state) {
  const cleanState = deepCopy([null, state], function (key, value) {
    if (/password/.test(key)) {
      if (typeof value === 'string') return '';
      if (typeof value === 'boolean') return false;
    }
    return value;
  });
  return cleanState;
}

/**
 * Saves a redux state to localStorage
 *
 * @param  {Object} state The full redux state.
 */
export function saveState(state) {
  const cleanState = removePasswords(state);
  try {
    const serialized = JSON.stringify({
      date: +new Date,
      state: cleanState
    });
    localStorage.setItem('heyDJDJ', serialized);
    return state;
  } catch (_) {
    return undefined;
  }
}

/**
 * Retrieves a redux state from localStorage. It expires after 12 hours
 */
export function retrieveState() {
  try {
    const now = +new Date;
    const serialized = localStorage.getItem('heyDJDJ');
    const parsed = JSON.parse(serialized);
    // Use 86400000 for 24 hours
    // Use 1 for no persistence
    if (now - parsed.date <= 86400000) {
      return parsed.state;
    } else {
      return undefined;
    }
  } catch (_) {
    return undefined;
  }
}

/**
 * Creates a unique ID
 *
 * @return {String}
 */
export function uniqueId() {
  return (+new Date) + '-' + Math.round(Math.random() * 50000)
}
