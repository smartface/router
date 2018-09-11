# Using push, Difference vs go
Push is used to opening pages multiple times, creating new instances. This is mainly used with products details.
Dashboard --> Product Listing --> Product Details: 1 --> Product Details 2
```javascript
const Application = require("sf-core/application");
const StackRouter = require("sf-core/router/stack");
const mainRouter = new StackRouter({
    initialPath: "page1", //optional, if not provided first element of the routes will be used
    routes: [{
        path: "dashboard",
        target: require("pages/dashboard"), 
        data: {

        },
        transtition: (routingOptions) => {} // OR "STRING"
    }, {
        path: "productds",
        target: require("pages/products")
    },{
        path: "productDetails",
        target: require("pages/productDetails")
    }]
});
Application.setupRouter(mainRouter);
```
When the application is opened, dashboard is opened. User selects a category to go to the products page.
```javascript
//inside dashboard.js
mainRouter.go("productds", {categoryID: 10});
```
User selects a product in the listing page
```javascript
//inside productds.js
mainRouter.go("productDetails", {productID: 23213});
```
In the product page user is offered with similar products. So opening them causes opening another `productDetails` page.
```javascript
//inside productDetails.js
mainRouter.push("productDetails", {productID: 9876});
```
Going back will go the from the second productDetails page (productID: 9876), will go to productDetails page (productID: 23213)
```javascript
//inside productDetails.js
mainRouter.goBack();
```