var cueTipsModule = require('../modules');
var DEFAULT_CUE_ATTR = 'cue-test';
var DEFAULT_CUE_TIP_ATTR = 'cue-tip-test';
var DEFAULT_PARENT_CLASS = 'parent-test-sltr';
var DEFAULT_PARENT_SLTR = '.' + DEFAULT_PARENT_CLASS;

describe('cue-tips', function() {
    beforeEach(function() {
        this.tipInterfaceMock = {
            showCueTip: noop,
            showCueTargetTip: noop,
            hideCueTargetTip: noop
        };
    });

    afterEach(function() {
        cueTipsModule._observers.forEach(cueTipsModule._disconnectObserver);
        document.body.innerHTML = '';
    });

    describe('cueConfig validation', function() {
        it('should throw an error if a cueConfig is missing a `cueAttr`', function() {
            var self = this;
            expect(function() {
                cueTipsModule([{}], self.tipInterfaceMock);
            }).toThrow(new Error('cue-tips: cue config require a `cueAttr` attribute selector'));
        });
    });

    describe('tipInterface validation', function() {
        it('should throw an error missing `showCueTip`', function() {
            expect(function() {
                cueTipsModule([{
                    cueAttr: 'test'
                }], {
                    showCueTargetTip: noop,
                    hideCueTargetTip: noop
                });
            }).toThrow(new Error('cue-tips: tipInterface requires a showCueTip function'));
        });
    });

    describe('observers', function() {
        it('should register 1 observer', function() {
            expect(cueTipsModule._observers.length).toBe(0);
            cueTipsModule([{
                cueAttr: 'test'
            }], this.tipInterfaceMock);
            expect(cueTipsModule._observers.length).toBe(1);
        });

        it('should register an observer for every instantiation', function() {
            expect(cueTipsModule._observers.length).toBe(0);
            cueTipsModule([{
                cueAttr: 'test'
            }], this.tipInterfaceMock);
            cueTipsModule([{
                cueAttr: 'test2'
            }], this.tipInterfaceMock);
            cueTipsModule([{
                cueAttr: 'test3'
            }], this.tipInterfaceMock);

            expect(cueTipsModule._observers.length).toBe(3);
        });

        it('should disconnect the observer when calling `stop`', function() {
            var instance = cueTipsModule([{
                cueAttr: 'test'
            }], this.tipInterfaceMock);

            spyOn(instance._props.observer, 'disconnect');
            instance.stop();
            expect(instance._props.observer.disconnect).toHaveBeenCalled();
        });

        it('should disconnect the observer when calling the cueConfigArray becomes empty', function() {
            var cueConfig = {
                cueAttr: 'test'
            };
            var instance = cueTipsModule([cueConfig], this.tipInterfaceMock);

            spyOn(instance._props.observer, 'disconnect');
            expect(instance._props.cueConfigArray.length).toBe(1);
            expect(cueTipsModule._observers.indexOf(instance._props.observer)).toBe(0);
            instance.remove(cueConfig);
            expect(instance._props.cueConfigArray.length).toBe(0);
            expect(instance._props.observer.disconnect).toHaveBeenCalled();
            expect(cueTipsModule._observers.indexOf(instance._props.observer)).toBe(-1);
        });

        it('should remove the observer from the _observer array when `stop` is called', function() {
            var instance = cueTipsModule([{
                cueAttr: 'test'
            }], this.tipInterfaceMock);

            expect(cueTipsModule._observers.indexOf(instance._props.observer)).toBe(0);
            instance.stop();
            expect(cueTipsModule._observers.indexOf(instance._props.observer)).toBe(-1);
        });
    });

    describe('cue instance `add`', function() {
        it('should add a cueConfig when `add` is called', function() {
            var instance = cueTipsModule([{
                cueAttr: 'test'
            }], this.tipInterfaceMock);
            var newConfig = {
                cueAttr: 'test2'
            };

            instance.add(newConfig);
            expect(instance._props.cueConfigArray.indexOf(newConfig)).toBe(1);
        });
    });

    describe('cue instance `remove`', function() {
        it('should add a cueConfig when `add` is called', function() {
            var testConfig = {
                cueAttr: 'test2'
            };
            var instance = cueTipsModule([{
                    cueAttr: 'test'
                },
                testConfig
            ], this.tipInterfaceMock);

            expect(instance._props.cueConfigArray.indexOf(testConfig)).toBe(1);
            instance.remove(testConfig);
            expect(instance._props.cueConfigArray.indexOf(testConfig)).toBe(-1);
        });
    });

    describe('cues', function() {
        it('should add the cue class to the cueAttr element', function(done) {
            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR
            }], this.tipInterfaceMock);

            var el = addCue();

            setTimeout(function() {
                expect(el.classList.contains('cue-tips-cue')).toBe(true);
                done();
            });
        });

        it('should not add the cue class to the cueAttr element is cueClass option is `false`', function(done) {
            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueClass: false
            }], this.tipInterfaceMock);

            var el = addCue();

            setTimeout(function() {
                expect(el.classList.contains('cue-tips-cue')).toBe(false);
                done();
            });
        });

        it('should remove the cue immeditately from the config array if there is no corresponding cueTipAttr', function(done) {
            var cueConfig = {
                cueAttr: DEFAULT_CUE_ATTR
            };
            var instance = cueTipsModule([cueConfig], this.tipInterfaceMock);
            addCue();

            expect(instance._props.cueConfigArray.indexOf(cueConfig)).toBe(0);

            setTimeout(function() {
                expect(instance._props.cueConfigArray.indexOf(cueConfig)).toBe(-1);
                done();
            });
        });

        it('should remove cue class when corresponding cueTipAttr is processed', function(done) {
            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipAttr: DEFAULT_CUE_TIP_ATTR
            }], this.tipInterfaceMock);

            var el = addCue();

            setTimeout(function() {
                addCueTip();
                expect(el.classList.contains('cue-tips-cue')).toBe(true);

                setTimeout(function() {
                    expect(el.classList.contains('cue-tips-cue')).toBe(false);
                    done();
                });
            });
        });

        it('should remove cueConfig from config array when corresponding cueTipAttr is processed', function(done) {
            var cueConfig = {
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipAttr: DEFAULT_CUE_TIP_ATTR
            };
            var instance = cueTipsModule([cueConfig], this.tipInterfaceMock);
            addCue();

            setTimeout(function() {
                addCueTip();
                expect(instance._props.cueConfigArray.indexOf(cueConfig)).toBe(0);

                setTimeout(function() {
                    expect(instance._props.cueConfigArray.indexOf(cueConfig)).toBe(-1);
                    done();
                });
            });
        });
    });

    describe('parent selector', function() {
        describe('matches', function() {
            beforeEach(function() {
                document.body.classList.add(DEFAULT_PARENT_CLASS);
            });

            afterEach(function() {
                document.body.classList.remove(DEFAULT_PARENT_CLASS);
            });

            it('should acknowledge cue when it does not match parent selector', function(done) {
                cueTipsModule([{
                    cueAttr: DEFAULT_CUE_ATTR,
                    cueParentSelector: DEFAULT_PARENT_SLTR
                }], this.tipInterfaceMock);

                var el = addCue();

                setTimeout(function() {
                    expect(el.classList.contains('cue-tips-cue')).toBe(true);
                    done();
                });
            });

            it('should acknowledge cue tip when it does not match parent selector', function(done) {
                cueTipsModule([{
                    cueAttr: DEFAULT_CUE_ATTR,
                    cueTipAttr: DEFAULT_CUE_TIP_ATTR,
                    cueTipParentSelector: DEFAULT_PARENT_SLTR
                }], this.tipInterfaceMock);

                var el = addCue();

                setTimeout(function() {
                    addCueTip();

                    setTimeout(function() {
                        expect(el.classList.contains('cue-tips-cue')).toBe(false);
                        done();
                    });
                });
            });
        });

        it('should not acknowledge cue when it does not match parent selector', function(done) {
            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueParentSelector: '.missing-class'
            }], this.tipInterfaceMock);

            var el = addCue();

            setTimeout(function() {
                expect(el.classList.contains('cue-tips-cue')).toBe(false);
                done();
            });
        });

        it('should not acknowledge cue tip when it does not match parent selector', function(done) {
            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipParentSelector: '.missing-class'
            }], this.tipInterfaceMock);

            var el = addCue();

            setTimeout(function() {
                addCueTip();

                setTimeout(function() {
                    expect(el.classList.contains('cue-tips-cue')).toBe(true);
                    done();
                });
            });
        });
    });

    describe('mutations', function() {
        it('should acknowledge cueAttrs that are in the DOM before the observer is created', function(done) {
            var self = this;
            var el = addCue();

            setTimeout(function() {
                cueTipsModule([{
                    cueAttr: DEFAULT_CUE_ATTR
                }], self.tipInterfaceMock);
                expect(el.classList.contains('cue-tips-cue')).toBe(true);
                done();
            });
        });

        it('should acknowledge cueAttrs that are already in the DOM when calling `add`', function(done) {
            var self = this;
            var instance = cueTipsModule([{
                cueAttr: 'blah'
            }], self.tipInterfaceMock);

            var el = addCue();

            setTimeout(function() {
                instance.add({
                    cueAttr: DEFAULT_CUE_ATTR
                });
                expect(el.classList.contains('cue-tips-cue')).toBe(true);
                done();
            });
        });
    });

    describe('tipInterface calls', function() {
        it('should call `showCueTargetTip` when the cue is acknowledged', function(done) {
            var self = this;
            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR
            }], self.tipInterfaceMock);

            spyOn(self.tipInterfaceMock, 'showCueTargetTip');
            addCue();

            expect(self.tipInterfaceMock.showCueTargetTip).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(self.tipInterfaceMock.showCueTargetTip).toHaveBeenCalled();
                done();
            });
        });

        it('should call `showCueTip` when the cue tip is acknowledged', function(done) {
            var self = this;

            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipAttr: DEFAULT_CUE_TIP_ATTR
            }], self.tipInterfaceMock);

            spyOn(self.tipInterfaceMock, 'showCueTip');
            addCueTip();

            expect(self.tipInterfaceMock.showCueTip).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(self.tipInterfaceMock.showCueTip).toHaveBeenCalled();
                done();
            });
        });

        it('should call `hideCueTargetTip` when the cue tip is acknowledged', function(done) {
            var self = this;

            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipAttr: DEFAULT_CUE_TIP_ATTR
            }], self.tipInterfaceMock);

            spyOn(self.tipInterfaceMock, 'hideCueTargetTip');
            addCueTip();

            expect(self.tipInterfaceMock.hideCueTargetTip).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(self.tipInterfaceMock.hideCueTargetTip).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('onRemove callback', function() {
        it('should call onRemove callback when the cueConfig without cueTip is acknowledged', function(done) {
            var spy = jasmine.createSpy('onRemove spy');
            var cueConfig = {
                cueAttr: DEFAULT_CUE_ATTR
            };

            cueTipsModule([cueConfig], this.tipInterfaceMock, spy);

            addCue();

            expect(spy).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(spy).toHaveBeenCalledWith(cueConfig);
                done();
            });
        });

        it('should not call onRemove callback when a cue has a corresponding cueTip', function(done) {
            var spy = jasmine.createSpy('onRemove spy');

            cueTipsModule([{
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipAttr: DEFAULT_CUE_TIP_ATTR
            }], this.tipInterfaceMock, spy);

            addCue();

            expect(spy).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(spy).not.toHaveBeenCalled();
                done();
            });
        });

        it('should call onRemove callback when a cueTip is acknowledged', function(done) {
            var spy = jasmine.createSpy('onRemove spy');
            var cueConfig = {
                cueAttr: DEFAULT_CUE_ATTR,
                cueTipAttr: DEFAULT_CUE_TIP_ATTR
            };

            cueTipsModule([cueConfig], this.tipInterfaceMock, spy);

            addCue();

            expect(spy).not.toHaveBeenCalled();

            setTimeout(function() {
                expect(spy).not.toHaveBeenCalled();
                addCueTip();

                setTimeout(function() {
                    expect(spy).toHaveBeenCalledWith(cueConfig);
                    done();
                });
            });
        });
    });
});

function addCue(cueAttr) {
    var el = createEl(cueAttr || DEFAULT_CUE_ATTR);
    document.body.appendChild(el);
    return el;
}

function addCueTip(cueTipAttr) {
    var el = createEl(cueTipAttr || DEFAULT_CUE_TIP_ATTR);
    document.body.appendChild(el);
    return el;
}

function createEl(cueAttr) {
    var el = document.createElement('div');
    el.setAttribute(cueAttr, '');
    return el;
}

function noop() {

}