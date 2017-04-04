const cache = {};

function getOrCreateCache(instance) {
  const name = instance.state.containerName;
  if (!name) { // Container isn't named. Can't cache.
    return [false, {}];
  } else if (cache[name]) { // Cache already exists. Return it.
    return [true, cache[name]];
  } else { // Create the cache so we can use it next time.
    return [false, cache[name] = {}];
  }
}

/**
 * Binds a collection of handler functions to an instance of a
 * container component.
 *
 * @param  {Component} containerInstance  An instance of a container component.
 * @param  {Object}    handlerPackage     Contains a collection of handlers.
 *
 * @return {Object}    A _new_ object containing the bound handlers.
 */
export default function bindHandlers(containerInstance, handlerPackage) {
  const [ wasCached, theCache ] = getOrCreateCache(containerInstance);

  if (wasCached) { // The cache already existed. Return it.
    return theCache;

  } else { // The cache had to be created. Populate it.
    Object.keys(handlerPackage).forEach(key => {
      theCache[key] = handlerPackage[key].bind(containerInstance);
    });
    return theCache;
  }
}
