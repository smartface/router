/**
 * IOS Transtion Options
 *
 */
module.exports = {
  UIViewAnimationOptionLayoutSubviews: 1 << 0,
  UIViewAnimationOptionAllowUserInteraction: 1 << 1,
  UIViewAnimationOptionBeginFromCurrentState: 1 << 2,
  UIViewAnimationOptionRepeat: 1 << 3,
  UIViewAnimationOptionAutoreverse: 1 << 4, // Run the animation backwards and forwards (must be combined with the repeat option).
  UIViewAnimationOptionOverrideInheritedDuration: 1 << 5, //Force the animation to use the original duration value specified when the animation was submitted.
  UIViewAnimationOptionOverrideInheritedCurve: 1 << 6, //Force the animation to use the original curve value specified when the animation was submitted.
  UIViewAnimationOptionAllowAnimatedContent: 1 << 7, //Animate the views by changing the property values dynamically and redrawing the view.
  UIViewAnimationOptionShowHideTransitionViews: 1 << 8, // Hide or show views during a view transition.
  UIViewAnimationOptionOverrideInheritedOptions: 1 << 9, // The option to not inherit the animation type or any options.
  UIViewAnimationOptionCurveEaseInOut: 0 << 16,
  UIViewAnimationOptionCurveEaseIn: 1 << 16,
  UIViewAnimationOptionCurveEaseOut: 2 << 16,
  UIViewAnimationOptionCurveLinear: 3 << 16,
  UIViewAnimationOptionTransitionNone: 0 << 20,
  UIViewAnimationOptionTransitionFlipFromLeft: 1 << 20,
  UIViewAnimationOptionTransitionFlipFromRight: 2 << 20,
  UIViewAnimationOptionTransitionCurlUp: 3 << 20,
  UIViewAnimationOptionTransitionCurlDown: 4 << 20,
  UIViewAnimationOptionTransitionCrossDissolve: 5 << 20,
  UIViewAnimationOptionTransitionFlipFromTop: 6 << 20,
  UIViewAnimationOptionTransitionFlipFromBottom: 7 << 20,
  UIViewAnimationOptionPreferredFramesPerSecondDefault: 0 << 24,
  UIViewAnimationOptionPreferredFramesPerSecond30: 7 << 24,
  UIViewAnimationOptionPreferredFramesPerSecond60: 3 << 24
};
