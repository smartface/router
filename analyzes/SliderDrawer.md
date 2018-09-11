# SliderDrawer
SliderDrawer is added to Application, not to a router.
```javascript
const Application = require("sf-core/application");
const SliderDrawer = require('sf-core/ui/sliderdrawer');
const sliderDrawer = new SliderDrawer();
// Populate your sliderDrawer

`Application.setLeftDrawer(sliderDrawer);
```
## Members
`Application` has following new members for SliderDrawer:
- `setLeftDrawer` sets a left positioned SliderDrawer. Replaces existing if possible. It is possible to combine it with right one
- `setRightDrawer` sets a right positioned SliderDrawer. Replaces existing if possible. It is possible to combine it with left one
- `removeLeftDrawer` removes left drawer
- `removeRightDrawer` removes right drawer
- `onDrawerSet` event fired when a drawer is set by setLeftDrawer or setRightDrawer methods
- `onDrawerRemove` event fired when a drawer is removed. It is called after removeLeftDrawer and removeRightDrawer and just before the event onDrawerSet if there is an existing drawer set before.

### onDrawerSet
`(sliderDrawer, position) => {}`
- **sliderDrawer** is the instance of the newly added drawer
- **position** is the [enumeration](http://ref.smartface.io/#!/api/UI.SliderDrawer.Position) where the drawer is added.

### onDrawerRemove
`(sliderDrawer, position) => {}`
- **sliderDrawer** is the instance of the removed drawer
- **position** is the [enumeration](http://ref.smartface.io/#!/api/UI.SliderDrawer.Position) where the drawer removed from.
`
## Notes & Changes
- A `SliderDrawer` instance can be added only to one side. In order to use both sides, two separate instances are to be created
- `SliderDrawer` instances will no longer have `position` property. Setting this has no effect.

## Discussion
- When to set SliderDrawer? Does it matter before or after `Application.setupRouter`?