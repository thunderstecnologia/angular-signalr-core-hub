# Installation

## Bower

    bower install angular-signalr-core-hub

# Usage
We may provide a demo anytime soon :)

# Frequently Asked Questions

## Is this a fork of [angular-signalr-hub](https://github.com/JustMaier/angular-signalr-hub)?

No. This is inspired by `angular-signalr-hub` in order to make thins easier for people who used it in the past and want to migrate to the new [ASP.NET Core SignalR Client SDK](https://github.com/aspnet/SignalR/tree/dev/client-ts).

## The new ASP.NET Core SignalR SDK does not provide a Bower package. Does this package include it?

Yes. This may be dropped in future releases if the ASP.NET Core team provides this kind of package.

## What are the changes from SignalR 2 to SignalR Core?

See [Announcing SignalR (alpha) for ASP.NET Core 2.0](https://blogs.msdn.microsoft.com/webdev/2017/09/14/announcing-signalr-for-asp-net-core-2-0/) for more information.

## What are the changes from `angular-signalr-hub`?

* jQuery (`$`) is no longer needed / used. This was necessary in order to access `$.signalR` but the new SDK does not rely on jQuery at all.
* All calls to `$.signalR.connectionState` in your `stateChanged` callback must be replaced with `Hub.connectionStates`.




