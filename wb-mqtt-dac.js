(function() { //don't touch this line
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
})();
