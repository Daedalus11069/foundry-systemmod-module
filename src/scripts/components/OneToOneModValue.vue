<template>
  <div class="relative">
    <div v-for="(field, i) in fields" :key="i">
      <div class="flex flex-row gap-x-2 sticky">
        <div class="basis-2/12">
          {{ localize("SYSTEMMOD.OneToOne.Source") }}
        </div>
        <div class="basis-4/12 flex flex-row">
          <div class="basis-3/12">
            {{ localize("SYSTEMMOD.OneToOneModValue.SourceType") }}
          </div>
          <div
            class="basis-9/12"
            :title="localize('SYSTEMMOD.OneToOneModValue.ConditionHelp')"
            v-show="field.type === 'boolean'"
          >
            {{ localize("SYSTEMMOD.OneToOneModValue.Condition") }}
          </div>
          <div
            class="basis-9/12"
            :title="localize('SYSTEMMOD.OneToOneModValue.RawHelp')"
            v-show="field.type === 'raw'"
          >
            {{ localize("SYSTEMMOD.OneToOneModValue.Raw") }}
          </div>
        </div>
        <div class="basis-3/12">
          {{ localize("SYSTEMMOD.OneToOne.Target") }}
        </div>
        <div class="basis-3/12"></div>
      </div>
      <div class="flex flex-row gap-x-2">
        <div class="basis-2/12" v-if="!isGlobalConfig">
          <select v-model="field.source">
            <option :value="option" v-for="option in sourceOptions">
              {{ option }}
            </option>
          </select>
        </div>
        <div class="basis-2/12" v-else>
          <input type="text" v-model="field.source" />
        </div>
        <div class="basis-4/12 flex flex-row mb-2">
          <div class="basis-3/12">
            <select class="px-2!" v-model="field.type">
              <option value="text">
                {{ localize("SYSTEMMOD.OneToOneModValue.SourceTypes.Text") }}
              </option>
              <option value="number">
                {{ localize("SYSTEMMOD.OneToOneModValue.SourceTypes.Number") }}
              </option>
              <option value="boolean">
                {{ localize("SYSTEMMOD.OneToOneModValue.SourceTypes.Boolean") }}
              </option>
              <option value="raw">
                {{ localize("SYSTEMMOD.OneToOneModValue.SourceTypes.Raw") }}
              </option>
            </select>
          </div>
          <div
            class="basis-9/12"
            v-show="field.type === 'boolean' || field.type === 'raw'"
          >
            <input type="text" v-model="field.condition" />
          </div>
        </div>
        <div class="basis-3/12">
          <input
            type="text"
            v-model="field.target"
            :placeholder="localize('SYSTEMMOD.OneToOne.Target')"
          />
        </div>
        <div class="basis-3/12">
          <button type="button" class="close" @click="removeMod(i)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="flex flex-row gap-x-2">
      <div class="basis-full">
        <button type="button" @click="addMod">
          {{ localize("SYSTEMMOD.OneToOne.AddModification") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { localize } from "../../libs/vue/VueHelpers";

const props = defineProps({
  sourceOptions: {
    type: Array
  },
  isGlobalConfig: {
    type: Boolean,
    default: false
  }
});

const fields = defineModel();

const addMod = () => {
  fields.value.push({
    source: "",
    type: "text",
    condition: "",
    target: ""
  });
};

const removeMod = idx => {
  if (
    window.confirm(
      localize("SYSTEMMOD.AreYouSure", {
        thing: localize("SYSTEMMOD.OneToOne.Modification")
      })
    )
  ) {
    fields.value.splice(idx, 1);
  }
};
</script>

<style lang="scss" scoped></style>
