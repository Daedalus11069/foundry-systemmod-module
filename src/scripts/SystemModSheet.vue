<template>
  <div class="systemmod-container">
    <header>
      <h1>{{ actor.name }}</h1>
    </header>
    <nav class="systemmod-sheet-tabs" ref="focusElm">
      <a
        :class="{ active: activeTab === 'one-to-one' }"
        :title="localize('SYSTEMMOD.OneToOne.OneToOne')"
        @click="toggleTab('one-to-one')"
      >
        <div>
          <svg
            width="30"
            height="24"
            viewBox="0 -4 27 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="1"
              width="25"
              height="20"
              fill="#262626"
              stroke="#000000"
              stroke-width="2"
            />
            <rect x="5" y="6" width="15" height="2" fill="#eeeeee" />
            <rect x="5" y="10" width="15" height="2" fill="#eeeeee" />
            <rect x="5" y="14" width="15" height="2" fill="#eeeeee" />
          </svg>
        </div>
      </a>
      <a
        :class="{ active: activeTab === 'lists' }"
        :title="localize('SYSTEMMOD.Lists.Lists')"
        @click="toggleTab('lists')"
      >
        <div>
          <svg width="30" height="24" viewBox="0 -4 27 26" fill="none">
            <rect
              x="1"
              y="1"
              width="25"
              height="20"
              fill="#262626"
              stroke="#000000"
              stroke-width="2"
            />
            <rect x="5" y="6" width="2" height="2" fill="#eeeeee" />
            <rect x="10" y="6" width="10" height="2" fill="#eeeeee" />

            <rect x="5" y="10" width="2" height="2" fill="#eeeeee" />
            <rect x="10" y="10" width="10" height="2" fill="#eeeeee" />

            <rect x="5" y="14" width="2" height="2" fill="#eeeeee" />
            <rect x="10" y="14" width="10" height="2" fill="#eeeeee" />
          </svg>
        </div>
      </a>
    </nav>

    <div>
      <div class="systemmod-tab" v-show="activeTab === 'one-to-one'">
        <div class="flex flex-col">
          <h3 class="py-2!">{{ localize("SYSTEMMOD.OneToOne.OneToOne") }}</h3>
          <OneToOne
            v-model:sourceKey="modificationSourceKey"
            v-model="modifications"
          />
        </div>
      </div>
      <div class="systemmod-tab" v-show="activeTab === 'lists'">
        <div class="flex flex-col">
          <h3 class="py-2!">{{ localize("SYSTEMMOD.Lists.Lists") }}</h3>
          <Lists v-model="lists" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { localize } from "../libs/vue/VueHelpers";
import OneToOne from "./components/OneToOne.vue";
import Lists from "./components/Lists.vue";

const actor = inject("actor");
const actorSheet = inject("actorSheet");

const data = ref(actorSheet.getData());

const focusEl = useTemplateRef("focusElm");
const { activate, deactivate } = useFocusTrap(focusEl);
const activeTab = ref(data.value.activeTab || "one-to-one");
const modificationSourceKey = ref(data.value.modificationSourceKey);
const modifications = ref(data.value.modifications || []);
const lists = ref(data.value.lists || []);

const toggleTab = active => {
  activeTab.value = active;
};

onMounted(() => {
  activate();
  data.value = actorSheet.getData();
});

onUnmounted(async () => {
  deactivate();
  actorSheet._activeTab = activeTab.value;
  actorSheet._modificationSourceKey = modificationSourceKey.value;
  actorSheet._modifications = modifications.value.filter(mod => {
    return mod.source !== "" && mod.target !== "";
  });
  actorSheet._lists = lists.value;
  await actor.prepareData();
  await actorSheet._saveFlags();
});
</script>

<style>
@plugin "flowbite/plugin";
@source "../node_modules/flowbite";
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css" layer(utilities);

@import "../systemmod.css";
</style>

<style lang="scss" scoped>
.systemmod-sheet-tabs {
  display: flex;
  flex-direction: row;
  height: 35px;
  background: #fdfdfd;
  color: #151515;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 0;
    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    &.active {
      box-shadow: inset 0 0 5px rgba(255, 165, 0, 0.2),
        inset 0 0 10px rgba(255, 100, 0, 0.3);
      transition: box-shadow 0.3s ease;
    }
  }
}

.systemmod-tab {
  flex-direction: column;
  height: 100%;
}
</style>
