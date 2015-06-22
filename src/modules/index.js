var observer;

module.exports = init;

function init(config) {
    var isValidConfig = assertValidConfig(config);
    if (isValidConfig) {
        registerObserver(config);
    }
}

function registerObserver(config) {
    var attributes = getAttributes(config);

    if (attributes.length) {
        observer = new MutationObserver(mutationHandler.bind(this, config));

        observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: attributes
        });
    }
}

function mutationHandler(config, mutations) {
    mutations.forEach(onMutation.bind(this, config));
}

function onMutation(config, mutation) {
    // the hasAttribute check might be unnecessary since we use attributeFilter in the observer
    if (mutation.attributeName && mutation.target.hasAttribute(mutation.attributeName)) {
        var cueConfig = findCueConfigForAttribute(mutation.attributeName, config);

        if (cueConfig) {
            if (cueConfig.cue === mutation.attributeName) {
                addCue(mutation.target, cueConfig);
            } else if (cueConfig.cueTip === mutation.attributeName) {
                addCueTip(mutation.target, cueConfig);
            } else {
                throw new Error('cue-tips: invalid cue config for attribute "' + mutation.attributeName + '"');
            }
        }
    }
}

function addCue(target, attrConfig) {

}

function addCueTip(target, attrConfig) {

}

function findCueConfigForAttribute(attributeName, config) {
    var result;

    config.some(function(obj) {
        if (obj.cue === attributeName || obj.cueTip === attributeName) {
            result = obj;
            return true;
        }
    });

    return result;
}

function getAttributes(config) {
    var result = [];

    config.forEach(function(obj) {
        result.push(obj.cue);
        result.push(obj.cueTip);
    });

    return result;
}

function assertValidConfig(config) {
    if (Array.isArray(config)) {
        var hasValidCueConfigs = config.every(function(obj) {
            if (isObject(obj)) {
                if (!isStringWithValue(obj.cue)) {
                    throw new Error('cue-tips: cue config require a `cue` attribute selector');
                }

                if (!isStringWithValue(obj.cueTip)) {
                    throw new Error('cue-tips: cue config require a `cueTip` attribute selector');
                }

                return true;
            } else {
                return false;
            }
        });

        if (hasValidCueConfigs) {
            return true;
        }
    }

    throw new Error('cue-tips: requires the config to be an array of cue config objects');
}

function isStringWithValue(str) {
    return !!str && typeof str === 'string';
}

function isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj);
}