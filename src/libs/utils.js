import { isRef, unref } from "vue";
import { isObject } from "@vueuse/core";

const stringToIdentifier = str => {
  // Replace invalid characters with underscores and remove leading/trailing underscores
  let identifier = str.replace(/[^a-zA-Z0-9_$]/g, "").replace(/^_+|_+$/g, "");

  // Ensure the identifier doesn't start with a number
  if (/^[0-9]/.test(identifier)) {
    identifier = "_" + identifier;
  }

  if (!identifier) {
    return undefined;
  }

  return identifier;
};

function deepUnref(val) {
  const checkedVal = isRef(val) ? unref(val) : val;
  if (!isObject(checkedVal)) return checkedVal;
  if (Array.isArray(checkedVal)) return unrefArray(checkedVal);
  return unrefObject(checkedVal);
}

function smartUnref(val) {
  if (val !== null && !isRef(val) && typeof val === "object")
    return deepUnref(val);
  return unref(val);
}

function unrefArray(arr) {
  arr.map(smartUnref);
}

function unrefObject(obj) {
  const unreffed = {};
  Object.keys(obj).forEach(key => {
    unreffed[key] = smartUnref(obj[key]);
  });
  return unreffed;
}

export { deepUnref, stringToIdentifier };
