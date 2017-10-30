angular.module('SignalR', []).factory('Hub', function () {
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

        function createState(newState) {
            return {
                newState: newState
            };
        }
        function callServerMethod(method) {

            return function (params) {
                console.log('Chamando método ' + method);
                connection.send(method, params);
            };
        }


        var connection = new signalR.HubConnection(buildHubUrl());

        options.methods.map(function (methodName) {
            var call = new callServerMethod(methodName);
            me[methodName] = call;
        });

        for (var key in options.listeners) {
            if (options.listeners.hasOwnProperty(key)) {
                var clientMethod = options.listeners[key];
                connection.on(key, clientMethod);
            }
        }

        connection.onclose(function () {
            var state = createState(Hub.connectionStates.disconnected);
            options.stateChanged(state);
        });

        this.start = function () {
            connection.start().then(function () {
                var state = createState(Hub.connectionStates.connected);
                options.stateChanged(state);
            });
        };
        this.start();
    };

    Hub.connectionStates = {
        connecting: 'connecting',
        connected: 'connected',
        // TODO: tratar reconexões
        reconnecting: 'reconnecting',
        disconnected: 'disconnected'
    };

    return Hub;
});
