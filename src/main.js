// Import the VueApplicationMixin
import VueSheet from "./assets/libs/vue/VueSheet.js";
import VueSystemModSheet from "./assets/vue/SystemModSheet.vue";
import { get } from "lodash-es";

Hooks.once("init", async function () {
  Actors.registerSheet("systemmod", SystemModActorSheet, {
    label: "System Modifications",
    types: ["character", "npc", "creature", "vehicle"],
    makeDefault: false
  });
  // const originalPrepareData = Actor.prototype.prepareData;
  // Actor.prototype.prepareData = function () {
  //   originalPrepareData.call(this);
  //   // this.system.systemmod = this.getFlag("systemmod", "modifications") || [];
  //   // for (const ref of this.system.systemmod) {
  //   // if (ref.target !== "" && ref.source !== "") {
  //   // set(this.system, ref.target, get(this.system, ref.source));
  //   // }
  //   // }
  // };
  Actor.prototype.refreshModifications = async function () {
    if (this.system.systemmod) {
      const changes = {};
      for await (const ref of this.getFlag("systemmod", "modifications") ||
        []) {
        changes[ref.target] = parseFloat(get(this.system, ref.source));
      }
      await this.update({ system: changes });
      return null;
    }
    return null;
  };
  game.systemmod = {
    refreshModifications: async actorId => {
      const actor = game.actors.get(actorId);
      if (actor && actor.system.systemmod) {
        await actor.refreshModifications();
        return null;
      }
      return null;
    }
  };
});

class SystemModActorSheet extends VueSheet(ActorSheet) {
  get vueComponent() {
    return VueSystemModSheet;
  }
  constructor(...args) {
    super(...args);
    if ((this.actor.getFlag("systemmod", "modifications") || []).length === 0) {
      this.actor.setFlag("systemmod", `modifications`, []);
    }
    // this._refetchAllCellValues();
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "actor", "systemmod"],
      width: 1200,
      height: 700,
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "modifications"
        }
      ]
    });
  }
  async getData() {
    const data = super.getData();
    data.systemModifications = this._systemModifications;
    return data;
  }
  async _refetchAllCellValues() {
    // if (!this._sheetId || !this._currentSheetName) return;
    //
    // for (let i = 0; i < this._cellReferences.length; i++) {
    // await this._updateCellValue(i);
    // }
    //
    // const modificationData = this.actor.system;
    //
    // for await (const ref of this.getFlag("systemmod", "systemModifications") ||
    // []) {
    // set(modificationData, ref.path, ref.value);
    // }
    // await this.actor.update({
    // system: modificationData
    // });
  }
  activateListeners(html) {
    //$(document).on(
    //  "field-save",
    //  ".systemmod-modifications button",
    //  async evt => {
    //    const { source, target, index } = evt.detail;
    //    const mods = this.actor.getFlag("systemmod", "modifications") || [];
    //    mods[index] = { source, target, index };
    //    await this.actor.setFlag("systemmod", `modifications`, mods);
    //  }
    //);
    //$(document).on(
    //  "field-remove",
    //  ".systemmod-modifications button",
    //  async evt => {
    //    const { index } = evt.detail;
    //    const mods = this.actor.getFlag("systemmod", "modifications") || [];
    //    if (index > -1) {
    //      mods.splice(index, 1);
    //      await this.actor.setFlag("systemmod", `modifications`, mods);
    //    }
    //  }
    //);
  }
  // async _onUpdateSheet(event) {
  //   event.preventDefault();
  //   let sheetUrl = this.element.find('input[name="sheetUrl"]').val();
  //   if (!sheetUrl) {
  //     this.sheetId = null;
  //     this.currentSheetName = null;
  //     this.sheetNames = [];
  //     this.render(false);
  //     return;
  //   }
  //   const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  //   if (sheetIdMatch) {
  //     this._sheetId = sheetIdMatch[1];
  //     await this._fetchSheetNames();
  //   }
  //   await this.actor.setFlag("systemmod", "sheetId", this._sheetId);
  //   await this.actor.setFlag("systemmod", "sheetName", this._currentSheetName);
  //   await this.actor.setFlag("systemmod", "sheetNames", this._sheetNames);
  //   await this.actor.setFlag("systemmod", "sheetUrl", sheetUrl);
  //   this.render(false);
  // }
  // async _fetchSheetNames() {
  //   if (!this._sheetId) return;
  //   const url = `https://docs.google.com/spreadsheets/d/${this._sheetId}/edit`;
  //   try {
  //     const response = await fetch(url);
  //     if (!response.ok)
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     const html = await response.text();
  //     const parser = new DOMParser();
  //     const doc = parser.parseFromString(html, "text/html");
  //     const container = doc.querySelector(".docs-sheet-container-bar");
  //     if (container) {
  //       this._sheetNames = [];
  //       const sheetTabs = container.querySelectorAll(".docs-sheet-tab");
  //       sheetTabs.forEach(tab => {
  //         const nameElement = tab.children[0].children[0].children[0];
  //         if (nameElement) {
  //           const sheetName = nameElement.innerHTML.trim();
  //           this._sheetNames.push(sheetName);
  //         }
  //       });
  //       this._currentSheetName = this._sheetNames[0];
  //     } else {
  //       console.error("Sheet container not found");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching sheet names:", error);
  //   }
  //   return this._sheetNames;
  // }
  // _onAddReference(event) {
  //   event.preventDefault();
  //   this._fetchSheetNames();
  //   this._cellReferences.push({
  //     sheet: this._currentSheetName,
  //     cell: "",
  //     keyword: "",
  //     value: ""
  //   });
  //   const references = $(
  //     event.currentTarget.parentElement.previousElementSibling
  //   );
  //   let sheets;
  //   if (this._sheetNames.length > 1) {
  //     sheets = `<select class="sheexcel-sheet" name="sheet">`;
  //     sheets += this._sheetNames
  //       .map((name, i) => `<option value="${i}">${name}</option>`)
  //       .join("");
  //     sheets += "</select>";
  //   } else {
  //     sheets = `<span class="sheexcel-reference-cell-sheet">${this._currentSheetName}</span>`;
  //   }
  //   const refHtml = `<div class="sheexcel-reference-cell">
  //                   <input class="sheexcel-cell" type="text" value="" placeholder="${game.i18n.localize(
  //                     "SYSTEMMODL.Cell"
  //                   )}">
  //                   <input class="sheexcel-keyword" type="text" value="" placeholder="${game.i18n.localize(
  //                     "SYSTEMMOD.Keyword"
  //                   )}">
  //                   ${sheets}
  //                   <div class="sheexcel-reference-remove">
  //                       <button class="sheexcel-reference-remove-button">${game.i18n.localize(
  //                         "SYSTEMMOD.Remove"
  //                       )}</button>
  //                       <span class="sheexcel-reference-remove-value"></span>
  //                   </div>
  //               </div>`;
  //   references.append(refHtml);
  // }
  // _onRemoveReference(event) {
  //   event.preventDefault();
  //   const parent = event.currentTarget.parentElement.parentElement;
  //   const siblings = Array.from(parent.parentElement.children);
  //   const index = siblings.indexOf(parent);
  //   this._cellReferences.splice(index, 1);
  //   parent.remove();
  // }
  // _onSaveReference(event) {
  //   event.preventDefault();
  //   this._refetchAllCellValues();
  //   this._saveFlags();
  // }
  // async _fetchCellValue(sheetId, sheetName, cellRef) {
  //   if (cellRef === "") return "";
  //   const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
  //     sheetName
  //   )}&range=${cellRef}`;
  //   const response = await fetch(url);
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //   const text = (await response.text()).trim().replace(/^"(.*)"$/, "$1");
  //   return text;
  // }
  // async _onCellReferenceChange(event) {
  //   const index = $(event.currentTarget)
  //     .closest(".sheexcel-reference-cell")
  //     .index();
  //   if (event.currentTarget.id === "sheexcel-cell") {
  //     this._cellReferences[index].cell = event.currentTarget.value;
  //   } else {
  //     this._cellReferences[index].sheet = event.target.value;
  //   }
  //   if (
  //     this._cellReferences[index].cell &&
  //     this._cellReferences[index].cell.length &&
  //     this._cellReferences[index].sheet
  //   ) {
  //     this._cellReferences[index].value = await this._fetchCellValue(
  //       this._sheetId,
  //       this._cellReferences[index].sheet,
  //       this._cellReferences[index].cell
  //     );
  //     const span = $(
  //       event.currentTarget.parentElement.children[3].lastElementChild
  //     );
  //     span.text(this._cellReferences[index].value.slice(0, 10));
  //   }
  //   const ref = foundry.utils.duplicate(this.actor.system.systemmod);
  //   ref[this._cellReferences[index].keyword] =
  //     this._cellReferences[index].value;
  //   this.actor.update({ "system.systemmod": ref });
  // }
  // _onKeywordReferenceChange(event) {
  //   const index = $(event.currentTarget)
  //     .closest(".sheexcel-reference-cell")
  //     .index();
  //   this._cellReferences[index].keyword = event.currentTarget.value;
  //   const ref = foundry.utils.duplicate(this.actor.system.systemmod);
  //   ref[this._cellReferences[index].keyword] =
  //     this._cellReferences[index].value;
  //   this.actor.update({ "system.systemmod": ref });
  // }
  // _onAddModification(event) {
  //   event.preventDefault();
  //   this._fetchSheetNames();
  //   this._systemModifications.push({
  //     sheet: this._currentSheetName,
  //     cell: "",
  //     path: "",
  //     keyword: "",
  //     value: ""
  //   });
  //   const modifications = $(
  //     event.currentTarget.parentElement.previousElementSibling
  //   );
  //   let sheets;
  //   if (this._sheetNames.length > 1) {
  //     sheets = `<select class="sheexcel-sheet" name="sheet">`;
  //     sheets += this._sheetNames
  //       .map((name, i) => `<option value="${i}">${name}</option>`)
  //       .join("");
  //     sheets += "</select>";
  //   } else {
  //     sheets = `<span class="sheexcel-modification-cell-sheet">${this._currentSheetName}</span>`;
  //   }
  //   const modHtml = `<div class="sheexcel-modification-cell">
  //                   <input class="sheexcel-cell" type="text" value="" placeholder="${game.i18n.localize(
  //                     "SYSTEMMODL.Cell"
  //                   )}">
  //                   <input class="sheexcel-path" type="text" value="" placeholder="${game.i18n.localize(
  //                     "SYSTEMMOD.Path"
  //                   )}">
  //                   <input class="sheexcel-keyword" type="text" value="" placeholder="${game.i18n.localize(
  //                     "SYSTEMMOD.Keyword"
  //                   )}">
  //                   ${sheets}
  //                   <div class="sheexcel-modification-remove">
  //                       <button class="sheexcel-modification-remove-button">${game.i18n.localize(
  //                         "SYSTEMMOD.Remove"
  //                       )}</button>
  //                       <span class="sheexcel-modification-remove-value"></span>
  //                   </div>
  //               </div>`;
  //   modifications.append(modHtml);
  // }
  // async _onCellModificationChange(event) {
  //   const index = $(event.currentTarget)
  //     .closest(".sheexcel-modification-cell")
  //     .index();
  //   if (event.currentTarget.className === "sheexcel-cell") {
  //     this._systemModifications[index].cell = event.currentTarget.value;
  //   } else {
  //     this._systemModifications[index].sheet = event.target.value;
  //   }
  //   if (
  //     this._systemModifications[index].cell &&
  //     this._systemModifications[index].cell.length &&
  //     this._systemModifications[index].sheet
  //   ) {
  //     this._systemModifications[index].value = await this._fetchCellValue(
  //       this._sheetId,
  //       this._systemModifications[index].sheet,
  //       this._systemModifications[index].cell
  //     );
  //     const span = $(
  //       event.currentTarget.parentElement.children[3].lastElementChild
  //     );
  //     span.text(this._systemModifications[index].value.slice(0, 10));
  //   }
  //   const ref = foundry.utils.duplicate(this.actor.system.systemmod);
  //   ref[this._systemModifications[index].keyword] =
  //     this._systemModifications[index].value;
  //   this.actor.update({ "system.systemmod": ref });
  // }
  // _onSaveModification(event) {
  //   event.preventDefault();
  //   this._refetchAllCellValues();
  //   this._saveFlags();
  // }
  // _onRemoveModification(event) {
  //   event.preventDefault();
  //   const parent = event.currentTarget.parentElement.parentElement;
  //   const siblings = Array.from(parent.parentElement.children);
  //   const index = siblings.indexOf(parent);
  //   this._systemModifications.splice(index, 1);
  //   parent.remove();
  // }
  // _onSystemModificationChange(event) {
  //   const index = $(event.currentTarget)
  //     .closest(".sheexcel-modification-cell")
  //     .index();
  //   this._systemModifications[index].path = event.currentTarget.value;
  //   const ref = foundry.utils.duplicate(this.actor.system);
  //   set(
  //     ref,
  //     this._systemModifications[index].path,
  //     this._systemModifications[index].value
  //   );
  //   this.actor.update({ system: ref });
  // }
  // _onRemoveSystemModification(event) {
  //   event.preventDefault();
  //   const parent = event.currentTarget.parentElement.parentElement;
  //   const siblings = Array.from(parent.parentElement.children);
  //   const index = siblings.indexOf(parent);
  //   this._systemModifications.splice(index, 1);
  //   parent.remove();
  // }
  // _onSaveSystemModification(event) {
  //   event.preventDefault();
  //   this._refetchAllCellValues();
  //   this._saveFlags();
  // }
  // async _updateCellValue(i) {
  //   const ref = this._cellReferences[i];
  //   const value = await this._fetchCellValue(
  //     this._sheetId,
  //     ref.sheet || this._currentSheetName,
  //     ref.cell
  //   );
  //   this._cellReferences[i].value = value;
  // }
  // _setupZoom(html, iframe) {
  //   const zoomSlider = html.find("#sheexcel-setting-zoom-slider")[0];
  //   const zoomValue = html.find("#sheexcel-setting-zoom-value")[0];
  //   if (zoomSlider && zoomValue) {
  //     zoomSlider.addEventListener("input", event => {
  //       const zoomLevel = parseInt(event.target.value);
  //       this._currentZoomLevel = zoomLevel;
  //       zoomValue.textContent = `${zoomLevel}%`;
  //       this._applyZoom(iframe, zoomLevel);
  //     });
  //   }
  // }
  // _applyZoom(iframe, zoomLevel) {
  //   if (iframe) {
  //     iframe.style.transform = `scale(${zoomLevel / 100})`;
  //     iframe.style.transformOrigin = "top left";
  //     iframe.style.width = `${100 * (100 / zoomLevel)}%`;
  //     iframe.style.height = `${100 * (100 / zoomLevel)}%`;
  //   }
  // }
  // _setupHideMenu(html, iframe) {
  //   const hideMenuCheckbox = html.find("#sheexcel-setting-hide-menu")[0];
  //   if (hideMenuCheckbox) {
  //     hideMenuCheckbox.addEventListener("change", async event => {
  //       const hideMenu = event.target.checked;
  //       await this.actor.setFlag("systemmod", "hideMenu", hideMenu);
  //       this._updateIframeSrc(iframe, hideMenu);
  //     });
  //   }
  // }
  // _updateIframeSrc(iframe, hideMenu) {
  //   if (!iframe) return;
  //   const sheetUrl = this.actor.getFlag("systemmod", "sheetUrl");
  //   if (!sheetUrl) return;
  //   const rmParam = hideMenu ? "minimal" : "embedded";
  //   iframe.src = `${sheetUrl}?embedded=true&rm=${rmParam}`;
  // }
  // async close(...args) {
  //   await this._saveFlags();
  //   return super.close(...args);
  // }
  // async _saveFlags() {
  //   if (!game.user.isGM && !this.actor.isOwner) return;
  //   const flags = {
  //     zoomLevel: this._currentZoomLevel,
  //     sidebarCollapsed: this._sidebarCollapsed,
  //     cellReferences: this._cellReferences,
  //     currentSheetName: this._currentSheetName,
  //     sheetNames: this._sheetNames
  //   };
  //   await this.actor.update({
  //     "flags.systemmod": flags
  //   });
  // }
}
