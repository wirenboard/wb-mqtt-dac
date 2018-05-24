(function() { //don't touch this line
  // prepare iio device list
  var iio_channel_path_map={};

  function init() {
    var virt_device_params = {
      cells: {  }
    };

    var config = readConfig("/etc/wb-mqtt-dac.conf");

    var channels_by_id = {};
    virt_device_params.title = config.device_name;
    for (var i=0; i <config.channels.length; ++i) {
      var channel = config.channels[i];
      virt_device_params.cells[channel.id] = {"type": "range", "value" : 0};
      virt_device_params.cells[channel.id].max = channel.max_value_mv;
      channels_by_id[channel.id] = channel;

      if (channel.iio_match) {
        var keys = Object.keys(iio_channel_path_map);
        for (var j=0; j<keys.length; j++) {
            var path=iio_channel_path_map[keys[j]]
            if (path.indexOf(channel.iio_match) != -1) {
              channel.iio_device=keys[j];
            }
        }
      }
    }

    // virtual device with controls has to be created before calling defineRule
    if (Object.keys(virt_device_params.cells).length > 0) {
      defineVirtualDevice("wb-dac", virt_device_params);
    }

    for (var i=0; i <config.channels.length; ++i) {
      var channel = config.channels[i];
      defineRule("_dac_change_" + channel.id, {
        whenChanged:  "wb-dac/" + channel.id,

        then: function (newValue, devName, cellName) {
          var channel = channels_by_id[cellName];
          var value_raw = Math.round(newValue / channel.multiplier);
        runShellCommand("echo {} >  /sys/bus/iio/devices/iio\:device{}/out_voltage{}_raw".format(value_raw, channel.iio_device, channel.iio_channel));
        }
      });
    }
  };

  // Make iio match mappings
  runShellCommand("ls -d /sys/bus/iio/devices/iio:device*/ | xargs -n1 readlink -f", {
      captureOutput: true,
      exitCallback: function (exitCode, capturedOutput) {
        var devices=capturedOutput.split("\n")
        for (var i=0; i<devices.length; ++i) {
          var path=devices[i];
          var num=path[path.length-1];
          iio_channel_path_map[num]=path;
        }

        init();
      }
   });
})();