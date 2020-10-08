import settings from 'settings-store';
import { promises } from 'fs';
const readFile = promises.readFile;

settings.init({
  appName: 'bob-printr', //required,
  publisherName: 'Glenn Hall', //optional
  reverseDNS: 'com.velor.bob-printr', //required for macOS
  enableReloading: false
});

function clean(value) {
  delete value['$0'];
  delete value['_'];
  delete value['preset'];
  delete value['action'];

  for (let key in value) {
    if (value[key] == undefined) {
      delete value[key];
    }
  }
  return value;
}

export function putPreset(name, args) {
  let value = {
    ...args
  };
  clean(value);
  settings.setValue(name, value);
}

export function mergePreset(name, args) {
  let preset = getPreset(name);
  args = clean({ ...args });
  preset = {
    ...preset,
    ...args
  };
  putPreset(name, preset);
}

export function applyPresets(presets) {
  return presets.reduce((result, preset) => {
    let p = settings.value(preset, {});
    return {
      ...result,
      ...p
    };
  }, {});
}

export function listPresets() {
  return settings.all();
}

export function hasPreset(name) {
  const preset = getPreset(name);
  return !!preset;
}

export function getPreset(name) {
  return settings.value(name);
}

export function clearPresets() {
  return settings.clear();
}

export function renamePreset(old, name) {
  const preset = settings.value(old);
  settings.delete(old);
  settings.setValue(name, preset);
}

export function removePreset(preset) {
  return settings.delete(preset);
}

export async function importPresets(file) {
  let content = await readFile(file);

  // replace single backslash \ with double backslash \\ to unescape it
  content = content.toString().replace(/\\/g,'\\\\',);
  const presets = JSON.parse(content);
  for (let preset in presets) {
    settings.setValue(preset, presets[preset]);
  }
}
