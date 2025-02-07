<template>
  <div>
    <div class="flex flex-row mb-2">
      <div class="basis-4/12">
        {{ localize("SYSTEMMOD.OneToOne.SourceKey") }}
        <input type="text" v-model="sourceKey" />
      </div>
    </div>
    <div v-for="(field, i) in fields" :key="i">
      <div class="flex flex-row gap-x-2">
        <div class="basis-2/12">
          {{ localize("SYSTEMMOD.OneToOne.Source") }}
        </div>
        <div class="basis-4/12 flex flex-row">
          <div class="basis-3/12">
            {{ localize("SYSTEMMOD.OneToOne.SourceType") }}
          </div>
          <div
            class="basis-9/12"
            :title="localize('SYSTEMMOD.OneToOne.ConditionHelp')"
            v-show="field.type === 'boolean'"
          >
            {{ localize("SYSTEMMOD.OneToOne.Condition") }}
          </div>
        </div>
        <div class="basis-3/12">
          {{ localize("SYSTEMMOD.OneToOne.Target") }}
        </div>
        <div class="basis-3/12"></div>
      </div>
      <div class="flex flex-row gap-x-2">
        <div class="basis-2/12">
          <select
            v-model="field.source"
            :placeholder="localize('SYSTEMMOD.OneToOne.Source')"
          >
            <option :value="key" v-for="key in sourceKeys">{{ key }}</option>
          </select>
        </div>
        <div class="basis-4/12 flex flex-row">
          <div class="basis-3/12">
            <select class="px-2!" v-model="field.type">
              <option value="text">
                {{ localize("SYSTEMMOD.OneToOne.SourceTypes.Text") }}
              </option>
              <option value="number">
                {{ localize("SYSTEMMOD.OneToOne.SourceTypes.Number") }}
              </option>
              <option value="boolean">
                {{ localize("SYSTEMMOD.OneToOne.SourceTypes.Boolean") }}
              </option>
            </select>
          </div>
          <div class="basis-9/12" v-show="field.type === 'boolean'">
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
        <div class="basis-3/12 mb-1">
          <button type="button" class="close" @click="onRemoveMod(i)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="flex flex-row gap-x-2">
      <div class="basis-full">
        <button type="button" @click="onAddMod">
          {{ localize("SYSTEMMOD.OneToOne.AddModification") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { localize } from "../../libs/vue/VueHelpers";

const actor = inject("actor");

const fields = defineModel();
const sourceKey = defineModel("sourceKey");

const sourceKeys = computed(() => {
  return Object.keys(actor.system[sourceKey.value]);
});

const onAddMod = () => {
  fields.value.push({ source: "", target: "", type: "text", condition: "" });
};

const onRemoveMod = idx => {
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
