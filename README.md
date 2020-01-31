# New Version!

We finally upgraded the SignalR Client SDK we use from `1.0.0-preview1` to the current (at time of writing) `1.1.4` SDK in order to make the library compatible with the current version of SignalR. 

If you still need the older releases install version `0.2.3` which is the last one we published back then.
# Installation

## Bower

    bower install angular-signalr-core-hub
# Usage

1. Add `SignalR` as a dependency in your AngularJS app:
```javascript
    angular.module('test', ['SignalR'])
```
2. Inject `Hub` in your controller or service. This service has similar interface to `angular-signalr-hub`'s own `Hub` service.

3. Define your `Hub` object and properties as follows:
```javascript
    var myHub = new Hub('HubName', {
        rootPath: WEBAPIURL + '/signalr/hubs',
        queryParams: queryParams,
        autoReconnect: true,
        reconnectTimeout: 5000,
        methods: [
          'ping',
          'keepAlive',
          'listUsers',
          'listOrders',
          'placeOrder',
          'cancelOrder',
          //.......
          'getProducts',
          'search'          
        ],
        listeners: {
          pong: function (success) {
           // ....
          }
        },
        stateChanged: function(newState){
            switch(newState){
            //    .....
            }
        }
      });

      myHub.start();
```

# API

This section further details the available options, methods and programming styles.

## Options

The accepted options are:
### General Options
* **rootPath (String)**: The URL prefix of all hubs in your application. This will be concatenated with `hubName` to form the final URL so if your hub class is called `ProductsHub` and it is mapped to `/signalr/products` in your project's `Startup` class then the root path will be `http://localhost:5555/signalr` without `products` in the end.
* **queryParams (Object)**: key-value object with query string data to be passed to SignalR. Remember the SignalR Client SDK is not writen in AngularJS so your app's `$http` interceptor will have no effect on SignalR connections, making query string a considerable way to pass session state from your app to SignalR.
* **stateChanged (Function(newState)**: this function is called every time the SignalR connection's state changes. It is passed one argument with two properties: `newState`, which is the current state, and `oldState` which is the previous state of the connection, or null.

### Transport Options

* **forceWebSocket (Boolean)**: instructs the SignalR Client SDK to skip transport negotiation entirely when WebSockets are available on the browser. 
    * This helps solve an issue when connecting to a load balanced server and connections are dropped because the negoatiation POST request is handled by one machine and the actual WebSocket connection is handled by another and the machine receiving the WebSocket connection does not recognize the **connectionId** returned by the negotiation request. Using Redis as ScaleOut backend on the server does not prevent this behavior at this time.
    * Browsers that do not support WebSocket, like Internet Explorer 11, won't be affacted by this option and will always request transport negotiation as if this was set `false`.

### Connection / Reconnection Options
* **autoStart (Boolean)**: automatically calls `start()` after initializing
* **autoReconnect (Boolean)**: automatically handles reconnections and subscribing again after a reconnection. We recommend setting this to true.
* **reconnectTimeout (Number)**: value passed to `$timeout` before reconnecting. The default value is `1000` (one second) but we recommend increasing this value in production to five seconds.

### Methods and Listeners

* **methods (String[])**: list of your hub's operation names. These will become methods in the Hub class and will pass any list of parameters to your Hub. **Important!** SignalR Core will close the connection if you send invalid number of parameters or parameters of the wrong type. If your app disconnects just after sending a certain type of message check the WebSocket frames in your browser's console or the Debug Output window in Visual Studio.
* **listeners (keys -> functions)**: object containing callbacks to the methods in your Hub's client interface. These will be passed directly to SignalR Client by calling SignalR's `HubConnection`'s `on` method. 

## Methods

* **start()**: manually starts the connection. A `Promise` is returned.
* **stop()**: asks SignalR to stop the connection.
* **on(method, handler)**: calls the `on` method on `HubConnection` in a similar way to using the `listeners` object in the constructor.
* **off(method, handler)**: allows your app to unsubscribe specific callbacks. Notice that the handler in this function must be the same function object passed to on or in the constructor's `listeners` property.




# Frequently Asked Questions

**Is this a fork of [angular-signalr-hub](https://github.com/JustMaier/angular-signalr-hub)?**

No. This is inspired by `angular-signalr-hub` in order to make things easier for people who used it in the past and want to migrate to the new [ASP.NET Core SignalR Client SDK](https://github.com/aspnet/SignalR/tree/dev/client-ts).

**The new ASP.NET Core SignalR SDK does not provide a Bower package. Does this package include it?**

Yes. This may be dropped in future releases if the ASP.NET Core team provides this kind of package.

**What are the changes from SignalR 2 to SignalR Core?**

The changes that most affected our applications were:
* **Single Hub per Connection**: this may have a few side effects:
    - If your application is broken into multiple hubs (`Products`, `Orders`, `Customers`, `Checkout`, `Reports` and os on) then each Hub will allocate one connection on your servers, which can result in lack of socket connections under heavy load.
    - If your application stores the user's `ConnectionId` so that you can send individual notifications (in situations where groups are not applicable) you must call a method in each Hub to store its ID because if `OrdersHub` has a `ConnectionId` of `893472cf-416b-414e-b87b-e0f167916aca` then `ChatSupportHub` will have a different `ConnectionId`, say `e20db0d6-4008-445c-9b0c-e275de0ca838`.
    - You can overcome these issues by partial classing all your current hubs into a giant, monolithic one that will consume just one connection from your server. 
* **Incompatible clients**: SignalR Core backends can only talk to SignalR Core front ends (WebSocket or SDK). Old clients must be upgraded to the new one or use bare WebSockets, which are now supported.


See [Announcing SignalR (alpha) for ASP.NET Core 2.0](https://blogs.msdn.microsoft.com/webdev/2017/09/14/announcing-signalr-for-asp-net-core-2-0/) for the full list of changes.

**What are the changes from `angular-signalr-hub`?**

* jQuery (`$`) is no longer needed / used. This was necessary in order to access `$.signalR` but the new SDK does not rely on jQuery at all.
* All calls to `$.signalR.connectionState` in your `stateChanged` callback must be replaced with `Hub.connectionStates`.




