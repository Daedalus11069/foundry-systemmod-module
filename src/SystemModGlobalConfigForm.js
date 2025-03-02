import VueSheet from "./libs/vue/VueSheet";
import VueSheetTemplate from "./scripts/GlobalConfigMenu.vue";

export default class SystemModConfigForm extends VueSheet(FormApplication) {
  get vueComponent() {
    return VueSheetTemplate;
  }
  getVueContext() {
    return { data: { cssClass: "systemmod-sheet" } };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["systemmod"],
      width: 1200,
      height: 700,
      resizable: true
    });
  }

  constructor(...args) {
    super(...args);
    const globalConfig = game.settings.get("systemmod", "globalConfig") || {};
    this._activeTab = globalConfig.activeTab || "one-to-one";
    this._modificationSourceKey = globalConfig.modificationSourceKey || "";
    this._modifications = globalConfig.modifications || [];
    this._lists = globalConfig.lists || [];
  }

  getData() {
    const data = super.getData();
    const globalConfig = game.settings.get("systemmod", "globalConfig") || {};
    data.activeTab = this._activeTab || "one-to-one";
    data.modificationSourceKey = this._modificationSourceKey || "";
    data.modifications =
      this._modifications || globalConfig.modifications || [];
    data.lists = this._lists || globalConfig.lists || [];
    return data;
  }

  _updateObject(data) {
    if (!game.user.isGM) return;
    game.settings.set("systemmod", "globalConfig", data);
  }
}
