

const gsmarena = require('gsmarena-api')

async function main() {
    const device_input = 'S25';
    const api_result = await gsmarena.catalog.getDevice('samsung_galaxy_s25_ultra-13322');
    console.log(api_result)

}
main();