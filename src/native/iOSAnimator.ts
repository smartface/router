import TransitionOptions from "./IOSTransitions";
import { ControllerType } from "core/Controller";
import Page from "@smartface/native/ui/Page";
/**
 * @ignore
 *
 */
export default class iOSAnimator {
  protected _containerView: ControllerType | null;
  protected _options: number;
  protected _onAnimate?: (...args: any) => void;
  protected _onFinish?: (...args: any) => void;
  protected _once: any;
  protected _easingFn?: (...args: any) => void;
  constructor(containerView: ControllerType) {
    this._containerView = containerView;
    this._options = 0 << 20;
  }

  onAnimate(fn: (...args: any) => void) {
    this._onAnimate = fn;
    return this;
  }

  onFinish(fn: (...args: any) => void) {
    this._onFinish = fn;
    return this;
  }

  start(from: Page, to: Page, duration = 0, params = {}) {
    // options && (this._options = this._options | options);
    // this.getTime();
    //@ts-ignore
    this._containerView.nativeObject.transitionFromToDurationOptionsAnimationsCompletion(
      //@ts-ignore
      from.nativeObject,
      //@ts-ignore
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
      (finished: boolean) => {
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
    this._onFinish = undefined;
    this._onAnimate = undefined;
    this._easingFn = undefined;
  }

  once(val: any) {
    this._once = val;
    return this;
  }
}