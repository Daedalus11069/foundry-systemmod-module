import { dollar as phrase } from "paraphrase";
import { set, get, isEmpty, isObject } from "lodash-es";
import { parseExpression } from "@babel/parser";
import { evaluate } from "eval-estree-expression";
import VueSheet from "./libs/vue/VueSheet.js";
import SystemModConfigForm from "./SystemModGlobalConfigForm.js";
import VueSystemModSheet from "./scripts/SystemModSheet.vue";

Hooks.once("init", async function () {
  game.settings.registerMenu("systemmod", "GlobalConfigMenu", {
    name: "SYSTEMMOD.GlobalSettingsMenu.Name",
    label: "SYSTEMMOD.GlobalSettingsMenu.Label",
    icon: "fas fa-list",
    type: SystemModConfigForm,
    restricted: true
  });

  game.settings.register("systemmod", "individualConfigAllowed", {
    scope: "world",
    config: true,
    name: "SYSTEMMOD.IndividualConfig.AllowedName",
    hint: "SYSTEMMOD.IndividualConfig.AllowedHint",
    type: Boolean,
    default: false
  });

  game.settings.register("systemmod", "globalConfig", {
    name: "SYSTEMMOD.GlobalConfig.Name",
    hint: "SYSTEMMOD.GlobalConfig.Hint",
    scope: "world", // "world" = sync to db, "client" = local storage
    config: false, // we will use the menu above to edit this setting
    type: Object,
    default: {
      modifications: [],
      lists: []
    } // can be used to set up the default structure
  });

  Actors.registerSheet("systemmod", SystemModActorSheet, {
    label: "System Modifications",
    types: ["character", "npc", "creature", "vehicle"],
    makeDefault: false
  });

  Actor.prototype._getSystemModConfig = function (keys) {
    const localConfigAllowed =
      game.settings.get("systemmod", "individualConfigAllowed") || false;

    const globalConfig = game.settings.get("systemmod", "globalConfig") || {};

    let returnData = Object.keys(keys).reduce((carry, key) => {
      const keyDefault = keys[key];
      if (typeof globalConfig[key] !== "undefined") {
        carry[key] = globalConfig[key];
      } else {
        carry[key] = keyDefault;
      }
      return carry;
    }, {});

    if (localConfigAllowed) {
      returnData = Object.keys(keys).reduce((carry, key) => {
        const keyData = this.getFlag("systemmod", key);
        if (typeof keyData !== "undefined") {
          carry[key] = keyData;
        }
        return carry;
      }, returnData);
    }

    return returnData;
  };

  const originalPrepareData = Actor.prototype.prepareData;
  Actor.prototype.prepareData = function () {
    originalPrepareData.call(this);

    const { modifications, modificationSourceKey, lists } =
      this._getSystemModConfig({
        modifications: [],
        modificationSourceKey: "",
        lists: []
      });

    if (modificationSourceKey !== "") {
      for (const ref of modifications) {
        if (
          ref.target !== "" &&
          ref.source !== "" &&
          get(this.system, `${modificationSourceKey}.${ref.source}`, "") !== ""
        ) {
          let value = get(
            this.system,
            `${modificationSourceKey}.${ref.source}`,
            ""
          );
          if (ref.type === "number") {
            value = window.parseFloat(value);
          } else if (ref.type === "boolean") {
            // Coerce to boolean to avoid raw values
            value = !!evaluate.sync(parseExpression(ref.condition), {
              Value: value
            });
          }
          if (
            typeof value !== "undefined" &&
            value !== null &&
            value !== "" &&
            (isObject(value) ? !isEmpty(value) : true)
          ) {
            set(this.system, ref.target, value);
          }
        }
      }
    }

    for (const list of lists) {
      const systemAccessKey = list.key;
      for (const systemObj of get(this.system, systemAccessKey, [])) {
        for (const modObj of list.modifications) {
          const existsIfKey = systemObj[list.options.existsIfKey];
          if (
            list.options.existsIf &&
            (typeof existsIfKey === "undefined" ||
              existsIfKey === null ||
              existsIfKey === "")
          ) {
            continue;
          }
          const sourceType = modObj.type;
          const target = phrase(modObj.target, systemObj);
          if (target !== "") {
            let value = systemObj[modObj.source];
            if (sourceType === "number") {
              value = window.parseFloat(value);
            } else if (sourceType === "boolean") {
              // Coerce to boolean to avoid raw values
              value = !!evaluate.sync(parseExpression(modObj.condition), {
                Value: value
              });
            } else if (sourceType === "raw") {
              value = evaluate.sync(parseExpression(modObj.condition), {
                Value: value
              });
            }
            if (
              typeof value !== "undefined" &&
              value !== null &&
              value !== "" &&
              (isObject(value) ? !isEmpty(value) : true)
            ) {
              set(this.system, target, value);
            }
          }
        }
      }
    }
  };
  Actor.prototype.refreshModifications = async function () {
    const { modifications, modificationSourceKey } = this._getSystemModConfig({
      modifications: [],
      modificationSourceKey: ""
    });
    if (modifications.length > 0) {
      const changes = {};
      if (modificationSourceKey !== "") {
        for await (const ref of modifications) {
          if (
            ref.target !== "" &&
            ref.source !== "" &&
            get(this.system, `${modificationSourceKey}.${ref.source}`, "") !==
              ""
          ) {
            let value = get(
              this.system,
              `${modificationSourceKey}.${ref.source}`,
              ""
            );
            if (ref.type === "number") {
              value = window.parseFloat(value);
            } else if (ref.type === "boolean") {
              // Coerce to boolean to avoid raw values
              value = !!evaluate.sync(parseExpression(ref.condition), {
                Value: value
              });
            }
            if (
              typeof value !== "undefined" &&
              value !== null &&
              value !== "" &&
              (isObject(value) ? !isEmpty(value) : true)
            ) {
              changes[ref.target] = value;
            }
          }
        }
      }
      await this.update({ system: changes });
    }
  };
  Actor.prototype.refreshLists = async function () {
    const system = {};
    const { lists } = this._getSystemModConfig({
      lists: []
    });
    for (const list of lists) {
      const systemAccessKey = list.key;
      for (const systemObj of get(this.system, systemAccessKey, [])) {
        for (const modObj of list.modifications) {
          const existsIfKey = systemObj[list.options.existsIfKey];
          if (
            list.options.existsIf &&
            (typeof existsIfKey === "undefined" ||
              existsIfKey === null ||
              existsIfKey === "")
          ) {
            continue;
          }
          const sourceType = modObj.type;
          const target = phrase(modObj.target, systemObj);
          if (target !== "") {
            let value = systemObj[modObj.source];
            if (sourceType === "number") {
              value = window.parseFloat(value);
            } else if (sourceType === "boolean") {
              // Coerce to boolean to avoid raw values
              value = !!evaluate.sync(parseExpression(modObj.condition), {
                Value: value
              });
            } else if (sourceType === "raw") {
              value = evaluate.sync(parseExpression(modObj.condition), {
                Value: value
              });
            }
            if (
              typeof value !== "undefined" &&
              value !== null &&
              value !== "" &&
              (isObject(value) ? !isEmpty(value) : true)
            ) {
              set(system, target, value);
            }
          }
        }
      }
    }
    this.update({ system });
  };
  game.systemmod = {
    refreshModifications: async actorId => {
      const actor = game.actors.get(actorId);
      if (actor && actor.flags.systemmod) {
        await actor.refreshModifications();
      }
    },
    refreshLists: async actorId => {
      const actor = game.actors.get(actorId);
      if (actor && actor.flags.systemmod) {
        await actor.refreshLists();
      }
    }
  };
});

class SystemModActorSheet extends VueSheet(ActorSheet) {
  get vueComponent() {
    return VueSystemModSheet;
  }
  constructor(...args) {
    super(...args);
    this._activeTab =
      this.actor.getFlag("systemmod", `activeTab`) || "settings";
    this._modificationSourceKey =
      this.actor.getFlag("systemmod", "modificationSourceKey") || "";
    this._modifications =
      this.actor.getFlag("systemmod", `modifications`) || [];
    this._lists = this.actor.getFlag("systemmod", "lists") || [];
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "actor", "systemmod"],
      width: 1000,
      height: 700,
      resizable: true
    });
  }
  getData() {
    const data = super.getData();
    data.modifications = this._modifications;
    data.modificationSourceKey = this._modificationSourceKey;
    data.lists = this._lists;
    data.activeTab = this._activeTab;
    return data;
  }

  async close(...args) {
    await this._saveFlags();

    return super.close(...args);
  }

  async _saveFlags() {
    if (!game.user.isGM && !this.actor.isOwner) return;
    const flags = {
      activeTab: this._activeTab,
      modificationSourceKey: this._modificationSourceKey,
      modifications: this._modifications,
      lists: this._lists
    };
    await this.actor.update({
      "flags.systemmod": flags
    });
  }
}
