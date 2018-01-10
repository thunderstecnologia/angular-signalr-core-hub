angular.module('SignalR', []).factory('Hub', ["$q", "$log", "$timeout", function ($q, $log, $timeout) {
    "use strict";
    var Hub = function (hubName, options) {
        var me = this;
        function buildHubUrl() {
            var hubUrl = options.rootPath + '/' + hubName;

            var queryArray = [];
            for (var key in options.queryParams) {
                if (options.queryParams.hasOwnProperty(key)) {
                    queryArray.push(key + '=' + options.queryParams[key]);
                }
            }

            hubUrl += '?' + queryArray.join('&');
            $log.debug('Hub', hubName, 'url', hubUrl);
            return hubUrl;
        }
        var previousState = null;
        function createState(newState) {
            var state = {
                oldState: previousState,
                newState: newState
            };
            if (newState !== previousState)
                previousState = newState;
            return state;
        }
        function callServerMethod(method) {

            return function () {
                $log.debug(hubName, 'Calling method ' + method);

                var params = Array.prototype.slice.call(arguments);
                params = [method].concat(params);

                return connection.send.apply(connection, params);
            };
        }

        function callStateChanged(newState) {
            $log.log('Hub ' + hubName + ' changed from "' + previousState + '" to "' + newState + '"');
            if (options.stateChanged) {
                var state = createState(newState);
                options.stateChanged(state);
                if (stopRequested)
                    stopRequested = false;

                if (newState === Hub.connectionStates.disconnected) {
                    if (options.autoReconnect) {
                        state = createState(Hub.connectionStates.reconnecting);
                        options.stateChanged(state);
                        $timeout(function () {
                            me.start();
                        }, options.reconnectTimeout || 1000);

                    }
                }
            }
        }


        var connection = null;
        var onOffList = [];
        var stopRequested = false;


        if (options.methods)
            options.methods.map(function (methodName) {
                var call = new callServerMethod(methodName);
                me[methodName] = call;
            });

        function bindListeners() {
            if (options.listeners) {
                for (var key in options.listeners) {
                    if (options.listeners.hasOwnProperty(key)) {
                        var clientMethod = options.listeners[key];
                        connection.on(key, clientMethod);
                    }
                }
            }

        }
        function bindOnOffListeners() {
            onOffList.map(function (x) {
                connection.on(x.method, x.handler);
            });
        }



        this.start = function () {

            if (connection === null || connection.connection.connectionState !== 0) {
                connection = new signalR.HubConnection(buildHubUrl());
                connection.onclose(function (error) {
                    $log.log('Connection Closed', hubName);
                    if (error)
                        $log.error(error);
                    callStateChanged(Hub.connectionStates.disconnected);
                });
                bindListeners();
                bindOnOffListeners();
            }

			return connection.start().then(function () {
                callStateChanged(Hub.connectionStates.connected);
            }, function (err) {               
                $log.error(err);
                if (err.statusCode >= 500 && options.autoReconnect) {
                   $timeout(function () {
                        me.start();
                    }, options.reconnectTimeout || 1000);
                } else {
                    throw err;
                }
            });
        };

        this.stop = function () {
            if (connection === null)
                return;
            stopRequested = true;
            connection.stop();
        }

        this.isConnected = function () {
            return connection && connection.connection.connectionState === 2;
        }
        this.on = function (method, handler) {
            if (connection)
                connection.on(method, handler);
            onOffList.push({
                method: method, handler: handler
            });
        }
        this.off = function (method, handler) {
            if (connection)
                connection.off(method, handler);

            var index = onOffList.findIndex(function (x) {
                return x.method === method && x.handler === handler;
            });

            if (index >= 0)
                onOffList.splice(index, 1);
        }

        if (options.autoStart)
            this.start();
    };

    Hub.connectionStates = {
        connecting: 'connecting',
        connected: 'connected',
        reconnecting: 'reconnecting',
        disconnected: 'disconnected'
    };
    return Hub;
}]);
