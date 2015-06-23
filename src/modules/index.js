var CUE_TIPS_CUE_CLASS = 'cue-tups-cue';

module.exports = make;

function make(cueConfigArray, tipInterface) {
    var isValidConfig = assertValidCueConfigArray(cueConfigArray);
    tipInterface = extendDefaultTipInterface(tipInterface);
    cueConfigArray = cueConfigArray.slice(); // make a copy
    var isValidTipInterface = assertValidTipInterface(tipInterface);

    if (isValidConfig && isValidTipInterface) {
        registerObserver(cueConfigArray, tipInterface);
    }
}

function registerObserver(cueConfigArray, tipInterface) {
    var attributes = getAttributes(cueConfigArray);

    if (attributes.length) {
        var props = {
            cueConfigArray: cueConfigArray,
            tipInterface: tipInterface
        };

        props.observer = new MutationObserver(mutationHandler.bind(this, props));

        props.observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: attributes
        });
    }
}

function mutationHandler(props, mutations) {
    mutations.forEach(onMutation.bind(this, props));
}

function onMutation(props, mutation) {
    // the hasAttribute check might be unnecessary since we use attributeFilter in the observer
    if (mutation.attributeName && mutation.target.hasAttribute(mutation.attributeName)) {
        var cueConfig = findCueConfigForAttribute(mutation.attributeName, props);

        if (cueConfig) {
            if (cueConfig.cueAttr === mutation.attributeName) {
                addCue(mutation.target, cueConfig, props);
            } else if (cueConfig.cueTipAttr === mutation.attributeName) {
                showCueTip(mutation.target, cueConfig, props);
            } else {
                throw new Error('cue-tips: invalid cue config for attribute "' + mutation.attributeName + '"');
            }
        }
    }
}

function addCue(target, cueConfig, props) {
    target.classList.add(CUE_TIPS_CUE_CLASS);
    props.tipInterface.showCueTargetTip(cueConfig, target);
}

function showCueTip(target, cueConfig, props) {
    props.tipInterface.hideCueTargetTip(cueConfig);
    props.tipInterface.showCueTip(cueConfig, target);
    target.classList.remove(CUE_TIPS_CUE_CLASS);
    removeCueConfig(cueConfig, props);
}

function removeCueConfig(cueConfig, props) {
    var i = props.cueConfigArray.indexOf(cueConfig);
    props.cueConfigArray.splice(i, 1);
    maybeDisconnectObserver(props);
}

function maybeDisconnectObserver(props) {
    if (props.cueConfigArray.length) {
        props.observer.disconnect();
    }
}

function findCueConfigForAttribute(attributeName, props) {
    var result;

    props.cueConfigArray.some(function(obj) {
        if (obj.cueAttr === attributeName || obj.cueTipAttr === attributeName) {
            result = obj;
            return true;
        }
    });

    return result;
}

function getAttributes(cueConfigArray) {
    var result = [];

    cueConfigArray.forEach(function(obj) {
        result.push(obj.cueAttr);
        result.push(obj.cueTipAttr);
    });

    return result;
}

function extendDefaultTipInterface(tipInterface) {
    tipInterface.showCueTargetTip = tipInterface.showCueTargetTip || noop;
    tipInterface.hideCueTargetTip = tipInterface.hideCueTargetTip || noop;
}

function assertValidCueConfigArray(cueConfigArray) {
    if (Array.isArray(cueConfigArray)) {
        var hasValidCueConfigs = cueConfigArray.every(function(obj) {
            if (isObject(obj)) {
                if (!isStringWithValue(obj.cueAttr)) {
                    throw new Error('cue-tips: cue config require a `cueAttr` attribute selector');
                }

                if (!isStringWithValue(obj.cueTipAttr)) {
                    throw new Error('cue-tips: cue config require a `cueTipAttr` attribute selector');
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

    throw new Error('cue-tips: requires the cueConfigArray to be an array of cue config objects');
}

function assertValidTipInterface(tipInterface) {
    if (isObject(tipInterface)) {
        ['showCueTip', 'showCueTargetTip', 'hideCueTargetTip'].forEach(function(fn) {
            throw new Error('cue-tips: tipInterface requires a ' + fn + ' function');
        });
    } else {
        throw new Error('cue-tips: invalid tipInterface');
    }
}

function isStringWithValue(str) {
    return !!str && typeof str === 'string';
}

function isObject(obj) {
    return typeof obj === 'object' && !Array.isArray(obj);
}

function noop() {

}