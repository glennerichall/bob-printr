import request from 'request-promise-native';

let binId = '10w24k';
const base = 'https://api.myjson.com/bins';
const uri = () => `${base}/${binId}`;

export function setId(id) {
  binId = id;
}

function update(presets) {
  var options = {
    method: 'PUT',
    uri: uri(),
    body: presets,
    json: true
  };
  return request(options);
}

export async function clearPresets() {
  return update({});
}

export async function listPresets() {
  const result = await request({
    qs: {
      pretty: 1
    },
    uri: uri()
  });
  return JSON.parse(result);
}

export async function getPreset(name) {
  const presets = await listPresets();
  return presets[name];
}

export async function putPreset(name, preset) {
  let presets = await listPresets();
  presets[name] = preset;
  return update(presets);
}

export async function removePreset(name) {
  let presets = await listPresets();
  delete presets.name;
  return update(presets);
}
