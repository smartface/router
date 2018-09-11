- `onBackButtonPressed` will be removed from page
- It will be added to the Application
- There will be automatic behaviour to the event, if developer has not set it:

```javascript
Application.onBackButtonPressed () => {
    let router = Application.router;
    if(router) {
        let canGoBack = router.goBack();
        if(!canGoBack)
            Applicaiton.exit();
    }
};
```