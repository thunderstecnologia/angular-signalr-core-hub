angular.module('SignalR', []).factory('Hub', function ($q, $log, $timeout) {
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
            oldState = newState;
            return state;
        }
        function callServerMethod(method) {

            return function () {
                $log.debug(hubName, 'Calling method ' + method);

                var params = Array.prototype.slice.call(arguments);
                params = [method].concat(params);

                return connection.send.apply( connection, params);
            };
        }

        function callStateChanged(newState) {
            if (options.stateChanged) {
                var state = createState(newState);
                options.stateChanged(state);
            }
        }


        var connection = new signalR.HubConnection(buildHubUrl());
        this.connection = connection;

        if (options.methods)
            options.methods.map(function (methodName) {
                var call = new callServerMethod(methodName);
                me[methodName] = call;
            });

        if (options.listeners)
            for (var key in options.listeners) {
                if (options.listeners.hasOwnProperty(key)) {
                    var clientMethod = options.listeners[key];
                    connection.on(key, clientMethod);
                }
            }

        connection.onclose(function (error) {
            $log.log('Connection Closed', hubName);
            if(error)
                $log.error(error);
            callStateChanged(Hub.connectionStates.disconnected);
        });

        this.start = function () {
            return connection.start().then(function () {
                callStateChanged(Hub.connectionStates.connected);
            }, function (err) {
                throw err;
            });
        };

        this.isConnected = function(){
            return connection.connection.connectionState === 2;
        }
        this.on = function (method, handler) {
            connection.on(method, handler);
        }
        this.off = function (method, handler) {
            connection.off(method, handler);
        }
    };

    Hub.connectionStates = {
        connecting: 'connecting',
        connected: 'connected',
        // TODO: handle reconnections
        reconnecting: 'reconnecting',
        disconnected: 'disconnected'
    };
    return function (hubName, options) {
        return new Hub(hubName, options);
    };
});
