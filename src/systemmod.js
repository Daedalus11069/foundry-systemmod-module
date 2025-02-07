import { dollar as phrase } from "paraphrase";
import { set, get, isEmpty, isObject } from "lodash-es";
import { parseExpression } from "@babel/parser";
import { evaluate } from "eval-estree-expression";
import VueSheet from "./libs/vue/VueSheet.js";
import VueSystemModSheet from "./scripts/SystemModSheet.vue";

Hooks.once("init", async function () {
  Actors.registerSheet("systemmod", SystemModActorSheet, {
    label: "System Modifications",
    types: ["character", "npc", "creature", "vehicle"],
    makeDefault: false
  });
  const originalPrepareData = Actor.prototype.prepareData;
  Actor.prototype.prepareData = function () {
    originalPrepareData.call(this);
    const systemmod = this.getFlag("systemmod", "modifications") || [];
    const modificationSourceKey =
      this.getFlag("systemmod", "modificationSourceKey") || "";
    if (modificationSourceKey !== "") {
      for (const ref of systemmod) {
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
    const lists = this.getFlag("systemmod", "lists") || [];
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
    if (this.getFlag("systemmod", "modifications")) {
      const changes = {};
      const modifications = this.getFlag("systemmod", "modifications") || [];
      const modificationSourceKey =
        this.getFlag("systemmod", "modificationSourceKey") || "";
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
    const lists = this.getFlag("systemmod", "lists") || [];
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
