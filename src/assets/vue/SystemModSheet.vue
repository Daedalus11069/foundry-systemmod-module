<template>
  <div>
    <header class="systemmod-sheet-header">
      <h1>{{ actor.name }}</h1>
    </header>
    <div>
      <div>
        <h3>{{ localize("SYSTEMMOD.Modifications") }}</h3>
        <div class="systemmod-modifications">
          <div
            class="flex flex-row gap-x-4"
            v-for="(field, i) in fields"
            :key="i"
          >
            <input
              type="text"
              class="basis-2/12"
              v-model="field.source"
              :placeholder="localize('SYSTEMMOD.Source')"
              tabindex="1"
            />
            <input
              type="text"
              class="basis-2/12"
              v-model="field.target"
              :placeholder="localize('SYSTEMMOD.Target')"
              tabindex="2"
            />
            <div class="basis-1/12 me-8">
              <button
                type="button"
                :title="localize('SYSTEMMOD.SaveModification')"
                @click="saveMod"
              >
                <i class="fas fa-save"></i>
              </button>
            </div>
            <div class="basis-2/12">
              <button
                type="button"
                class="close float-left w-1/4!"
                @click="removeMod(i)"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <div>
          <button type="button" @click="addMod">
            {{ localize("SYSTEMMOD.AddModification") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from "vue";
import { localize } from "../libs/vue/VueHelpers";

const actor = inject("actor");

const fields = ref(actor.getFlag("systemmod", "modifications") || []);

const addMod = () => {
  fields.value.push({ source: "", target: "" });
};

const saveMod = () => {
  actor.setFlag("systemmod", "modifications", fields.value);
};
const removeMod = idx => {
  if (window.confirm(`Remove modification?`)) {
    fields.value.splice(idx, 1);
    actor.setFlag("systemmod", "modifications", fields.value);
  }
};
</script>

<style scoped>
@import "../../systemmod.css";
</style>
