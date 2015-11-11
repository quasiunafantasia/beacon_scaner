var beaconRegion;

var default_uuid = '6665542b-41a1-5e00-931c-6a82db9b78c1';
var default_identifier = 'GemTot for iOS';
var default_minor = 0;
var default_major = 0;

var actions;

document.addEventListener('deviceready', function() {
      document.getElementById('save').addEventListener(
          'click', saveSettings);
      document.getElementById('startListening').addEventListener(
          'click', startListening);
      document.getElementById('stop').addEventListener(
          'click', stopListening);

      loadConfig();

      actions = {
          start: {
              monitor: cordova.plugins.locationManager.startMonitoringForRegion,
              range: cordova.plugins.locationManager.startRangingBeaconsInRegion
          },
          stop: {
              monitor: cordova.plugins.locationManager.stopMonitoringForRegion,
              range: cordova.plugins.locationManager.stopRangingBeaconsInRegion
          }
      };

}, false);


function loadItem(key, defaultVal) {
    var stored = localStorage.getItem(key);
    if (stored === null) {
        return defaultVal;
    }

    return isNaN(stored) ? stored : parseInt(stored, 10);
}


function saveSettings() {
    var conf = getConfig();

    Object.keys(conf).forEach(function(key) {
        localStorage.setItem(key, conf[key]);
    });
};

function startListening() {
    var action = document.getElementById('action').value;
    beaconRegion = createBeaconRegion(getConfig());

    var logToDom = function(message) {
        var e = document.getElementById('log');
        e.innerText += '\n\n\n' + message;
    };

    var delegate = new cordova.plugins.locationManager.Delegate();

    delegate.didDetermineStateForRegion = function(pluginResult) {

        logToDom('[DOM] didDetermineStateForRegion: ' + JSON.stringify(
            pluginResult));

        cordova.plugins.locationManager.appendToDeviceLog(
            '[DOM] didDetermineStateForRegion: ' + JSON.stringify(
                pluginResult));
    };

    delegate.didStartMonitoringForRegion = function(pluginResult) {
        console.log('didStartMonitoringForRegion:', pluginResult);

        logToDom('didStartMonitoringForRegion:' + JSON.stringify(
            pluginResult));
    };

    delegate.didRangeBeaconsInRegion = function(pluginResult) {
        logToDom('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(
            pluginResult));
    };

    cordova.plugins.locationManager.setDelegate(delegate);

    try {

        if (/iPad|iPhone|iPod/.test(navigator.platform)) {
            cordova.plugins.locationManager.requestWhenInUseAuthorization();
        }
    }
    catch (e) {

    }

    actions.start[action].call(cordova.plugins.locationManager, beaconRegion)
        .fail(console.error)
        .done();
};

function stopListening() {
    var action = document.getElementById('action').value;
    actions.stop[action].call(cordova.plugins.locationManager, beaconRegion)
        .fail(console.error)
        .done();
};

function createBeaconRegion(config) {
    return new cordova.plugins.locationManager.BeaconRegion(
        config.identifier,
        config.uuid,
        config.major,
        config.minor
    );

}

function loadConfig() {
    var conf = {
        identifier: loadItem('identifier', default_identifier),
        uuid: loadItem('uuid', default_uuid),
        major: loadItem('major', default_major),
        minor: loadItem('minor', default_minor)
    };
    document.getElementsByName('identifier')[0].value = conf.identifier;
    document.getElementsByName('uuid')[0].value = conf.uuid;
    document.getElementsByName('major')[0].value = conf.major;
    document.getElementsByName('minor')[0].value = conf.minor;
    return conf;
}

function getConfig() {
    return {
        uuid: document.getElementsByName('uuid')[0].value,
        identifier: document.getElementsByName('identifier')[0].value,
        minor: document.getElementsByName('minor')[0].value,
        major: document.getElementsByName('major')[0].value
    }
};


