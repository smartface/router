const TransitionOptions = require("./IOSTransitions");


class iOSAnimator {
  constructor(containerView) {
    this._containerView = containerView;
    this._options = 0 << 20;
  }

  onAnimate(fn) {
    this._onAnimate = fn;
    return this;
  }

  onFinish(fn) {
    this._onFinish = fn;
    return this;
  }

  start(from, to, duration = 0, params = {}) {
    // options && (this._options = this._options | options);
    // this.getTime();
    this._containerView.nativeObject.transitionFromToDurationOptionsAnimationsCompletion(
      from.nativeObject,
      to.nativeObject,
      duration,
      TransitionOptions.UIViewAnimationOptionTransitionNone,
      () => {
        this._onAnimate &&
          this._onAnimate(
            this._containerView,
            from,
            to,
            duration,
            this._options,
            params
          );
      },
      finished => {
        this._onFinish &&
          this._onFinish(
            finished,
            this._containerView,
            from,
            to,
            duration,
            this._options,
            params
          );
        this._once && this.dispose();
      }
    );
  }

  dispose() {
    this._containerView = null;
    this._onFinish = null;
    this._onAnimate = null;
    this._easingFn = null;
  }

  once(val) {
    this._once = val;
    return this;
  }
}

module.exports = iOSAnimator;
