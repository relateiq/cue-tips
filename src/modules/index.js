var CUE_TIPS_CUE_CLASS = 'cue-tips-cue';

module.exports = make;

function make(cueConfigArray, tipInterface, onRemove) {
    var isValidConfig = assertValidCueConfigArray(cueConfigArray);
    tipInterface = extendDefaultTipInterface(tipInterface);
    cueConfigArray = cueConfigArray.slice(); // make a copy
    var isValidTipInterface = assertValidTipInterface(tipInterface);

    if (isValidConfig && isValidTipInterface) {
        registerObserver(cueConfigArray, tipInterface, onRemove);
    }
}

function registerObserver(cueConfigArray, tipInterface, onRemove) {
    var attributes = getAttributes(cueConfigArray);

    if (attributes.length) {
        var props = {
            cueConfigArray: cueConfigArray,
            tipInterface: tipInterface,
            onRemove: onRemove
        };

        props.observer = new MutationObserver(mutationHandler.bind(this, props));

        props.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

function mutationHandler(props, mutations) {
    var attributes = getAttributes(props.cueConfigArray);
    var querySelector = '[' + attributes.join('],[') + ']';

    mutations.forEach(function forEachCueTipMutation(mutation) {
        if (!mutation.addedNodes || !mutation.addedNodes.length) {
            return;
        }

        Array.prototype.slice.call(mutation.addedNodes).forEach(function forEachCueTipAddedNode(node) {
            if (node.nodeType !== 1) {
                return;
            }

            maybeHandleAttributeMatchesForNode(node, attributes, props);

            Array.prototype.slice.call(node.querySelectorAll(querySelector)).forEach(function forEachCueTipAddedNodeDescendant(descendant) {
                maybeHandleAttributeMatchesForNode(descendant, attributes, props);
            });
        });
    });
}

function maybeHandleAttributeMatchesForNode(node, attributes, props) {
    attributes.some(function(attr) {
        if (node.hasAttribute(attr)) {
            handleAttributeMatch(attr, node, props);
            return true;
        }
    });
}

function handleAttributeMatch(attr, target, props) {
    var cueConfig = findCueConfigForAttribute(attr, props);

    if (cueConfig) {
        if (cueConfig.cueAttr === attr) {
            addCue(target, cueConfig, props);
        } else if (cueConfig.cueTipAttr === attr) {
            showCueTip(target, cueConfig, props);
        } else {
            throw new Error('cue-tips: invalid cue config for attribute "' + attr + '"');
        }
    }
}

function addCue(target, cueConfig, props) {
    target.classList.add(CUE_TIPS_CUE_CLASS);
    props.tipInterface.showCueTargetTip(cueConfig, target);
}

function showCueTip(target, cueConfig, props) {
    var cueEl = document.querySelector('.' + CUE_TIPS_CUE_CLASS);
    props.tipInterface.hideCueTargetTip(cueConfig);
    props.tipInterface.showCueTip(cueConfig, target);
    removeCueConfig(cueConfig, props);

    if (cueEl) {
        cueEl.classList.remove(CUE_TIPS_CUE_CLASS);
    }
}

function removeCueConfig(cueConfig, props) {
    var i = props.cueConfigArray.indexOf(cueConfig);

    if (~i) {
        if (typeof props.onRemove === 'function') {
            props.onRemove(cueConfig);
        }

        props.cueConfigArray.splice(i, 1);
    }

    maybeDisconnectObserver(props);
}

function maybeDisconnectObserver(props) {
    if (!props.cueConfigArray.length) {
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

    return tipInterface;
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
        return ['showCueTip', 'showCueTargetTip', 'hideCueTargetTip'].every(function(fnName) {
            if (typeof tipInterface[fnName] === 'function') {
                return true;
            } else {
                throw new Error('cue-tips: tipInterface requires a ' + fnName + ' function');
            }
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