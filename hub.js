angular.module('SignalR', []).factory('Hub', function ($q, $timeout) {
    var Hub = function (hubName, options) {
        /* globals signalR */
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

            console.log('Hub', hubName, 'url', hubUrl);
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
                console.log('Chamando método ' + method);

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
            console.log('Connection Closed', hubName, error);
            callStateChanged(Hub.connectionStates.disconnected);
        });

        this.start = function () {
            console.log('Connection State', hubName, connection.connection.connectionState);
            
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

        this.invoke = function (name, params) {
            return connection.invoke(name, params);
        }



        //this.start();
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
