// Read the battery level of the first found peripheral exposing the Battery Level characteristic

const noble = require('@abandonware/noble');

noble.on('stateChange', async (state) => {
    console.log({state})
  if (state === 'poweredOn') {
      try{
        await noble.startScanningAsync([], false); //'180f'

      }
      catch(err){
          console.error(err)
      }

  }
});

noble.on('discover', async (peripheral) => {
    console.log({peripheral});
  await noble.stopScanningAsync();
  await peripheral.connectAsync();
  const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180f'], ['2a19']);
  const batteryLevel = (await characteristics[0].readAsync())[0];

  console.log(`${peripheral.address} (${peripheral.advertisement.localName}): ${batteryLevel}%`);

  await peripheral.disconnectAsync();
  process.exit(0);
});