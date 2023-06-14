(function () {
  //don't touch this line
  // prepare iio device list
  var iioChannelOfNodeMap = {};

  function init() {
    var virt_device_params = {
      cells: {},
    };

    var config = {};
    try {
      config = readConfig('/var/lib/wb-mqtt-dac/conf.d/system.conf', { logErrorOnNoFile: false });
    } catch (err) {
      try {
        config = readConfig('/etc/wb-mqtt-dac.conf', { logErrorOnNoFile: false });
      } catch (err) {
        log.warning('DAC: no config file');
        return;
      }
    }

    var channels_by_id = {};
    virt_device_params.title = config.device_name;
    for (var i = 0; i < config.channels.length; ++i) {
      var channel = config.channels[i];

      if (channel.iio_of_name) {
        var keys = Object.keys(iioChannelOfNodeMap);
        for (var j = 0; j < keys.length; j++) {
          var ofNodeName = iioChannelOfNodeMap[keys[j]];
          if (ofNodeName == channel.iio_of_name) {
            channel.iio_device = keys[j];
          }
        }
      }

      if (channel.iio_device) {
        virt_device_params.cells[channel.id] = { type: 'range', value: 0 };
        virt_device_params.cells[channel.id].max = channel.max_value_mv;
        channels_by_id[channel.id] = channel;
      } else {
        log.warning('DAC: {}: IIO device not found, skipping'.format(channel.id));
      }
    }

    // virtual device with controls has to be created before calling defineRule
    if (Object.keys(virt_device_params.cells).length > 0) {
      defineVirtualDevice('wb-dac', virt_device_params);
    }

    var channelIds = Object.keys(channels_by_id);
    for (var i = 0; i < channelIds.length; ++i) {
      var channel = channels_by_id[channelIds[i]];

      defineRule('_dac_change_' + channel.id, {
        whenChanged: 'wb-dac/' + channel.id,
        then: function (newValue, devName, cellName) {
          var channel = channels_by_id[cellName];
          var value_raw = Math.round(newValue / channel.multiplier);
          runShellCommand(
            'echo {} >  /sys/bus/iio/devices/iio:device{}/out_voltage{}_raw'.format(
              value_raw,
              channel.iio_device,
              channel.iio_channel
            )
          );
        },
      });
    }
  }

  /* Get of_node name for each IIO device */
  runShellCommand(
    "for i in /sys/bus/iio/devices/iio:device*/of_node/name; do echo -n $i; echo ' '`cat $i`; done",
    {
      captureOutput: true,
      exitCallback: function (exitCode, capturedOutput) {
        var strList = capturedOutput.split('\n');
        for (var i = 0; i < strList.length; ++i) {
          var strParts = strList[i].split(' ', 2);
          if (strParts.length == 2) {
            var path = strParts[0];
            var ofNodeName = strParts[1];
            var num = path[path.length - '/of_node/name'.length - 1];
            iioChannelOfNodeMap[num] = ofNodeName;
          }
        }

        init();
      },
    }
  );
})();
