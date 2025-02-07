<template>
  <div class="systemmod-container">
    <header>
      <h1>{{ actor.name }}</h1>
    </header>
    <nav class="systemmod-sheet-tabs">
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
      <a
        :class="{ active: activeTab === 'settings' }"
        :title="localize('SYSTEMMOD.Settings')"
        @click="toggleTab('settings')"
      >
        <div>
          <svg
            width="30"
            height="30"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#151515"
              d="M12 8.595C10.1315 8.595 8.595 10.1315 8.595 12C8.595 13.8685 10.1315 15.405 12 15.405C13.8685 15.405 15.405 13.8685 15.405 12C15.405 10.1315 13.8685 8.595 12 8.595ZM22 12.9415V11.0585L19.6615 9.91477C19.5254 9.16677 19.2908 8.44523 18.9754 7.76923L20.2754 5.53846L18.4615 3.72462L16.2308 5.02462C15.5548 4.70923 14.8332 4.47462 14.0852 4.33846L12.9415 2H11.0585L9.91477 4.33846C9.16677 4.47462 8.44523 4.70923 7.76923 5.02462L5.53846 3.72462L3.72462 5.53846L5.02462 7.76923C4.70923 8.44523 4.47462 9.16677 4.33846 9.91477L2 11.0585V12.9415L4.33846 14.0852C4.47462 14.8332 4.70923 15.5548 5.02462 16.2308L3.72462 18.4615L5.53846 20.2754L7.76923 18.9754C8.44523 19.2908 9.16677 19.5254 9.91477 19.6615L11.0585 22H12.9415L14.0852 19.6615C14.8332 19.5254 15.5548 19.2908 16.2308 18.9754L18.4615 20.2754L20.2754 18.4615L18.9754 16.2308C19.2908 15.5548 19.5254 14.8332 19.6615 14.0852L22 12.9415ZM12 16.5C9.51477 16.5 7.5 14.4852 7.5 12C7.5 9.51477 9.51477 7.5 12 7.5C14.4852 7.5 16.5 9.51477 16.5 12C16.5 14.4852 14.4852 16.5 12 16.5Z"
            />
          </svg>
        </div>
      </a>
    </nav>

    <div :key="tabsKey">
      <div class="systemmod-tab" v-show="activeTab === 'one-to-one'">
        <div class="flex flex-col">
          <h3 class="py-2!">{{ localize("SYSTEMMOD.OneToOne.OneToOne") }}</h3>
          <OneToOne
            v-model:sourceKey="modificationSourceKey"
            v-model:tabsKey="tabsKey"
            v-model="modifications"
          />
        </div>
      </div>
      <div class="systemmod-tab" v-show="activeTab === 'lists'">
        <div class="flex flex-col">
          <h3 class="py-2!">{{ localize("SYSTEMMOD.Lists.Lists") }}</h3>
          <Lists v-model:tabsKey="tabsKey" v-model="lists" />
        </div>
      </div>
      <div class="systemmod-tab" v-show="activeTab === 'settings'">
        <div class="flex flex-col">
          <h3 class="py-2!">{{ localize("SYSTEMMOD.Settings") }}</h3>
          <div class="flex flex-row gap-x-2">
            <div class="basis-6/12">
              <button type="button" @click="onExportConfig">
                {{ localize("SYSTEMMOD.ExportConfig") }}
              </button>
            </div>
            <div class="basis-6/12">
              <button type="button" @click="open">
                {{ localize("SYSTEMMOD.ImportConfig") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, nextTick, onMounted, onUnmounted, ref } from "vue";
import { promiseTimeout, useFileDialog } from "@vueuse/core";
import { saveAs } from "file-saver";
import { FileReader } from "@tanker/file-reader";
import { initFlowbite } from "flowbite";
import { localize } from "../libs/vue/VueHelpers";
import { deepUnref } from "../libs/utils";
import OneToOne from "./components/OneToOne.vue";
import Lists from "./components/Lists.vue";
import { nanoid } from "../libs/nanoid";

const actor = inject("actor");
const actorSheet = inject("actorSheet");

const data = ref(actorSheet.getData());

const tabsKey = ref(nanoid());

const activeTab = ref(data.value.activeTab || "one-to-one");
const modificationSourceKey = ref(data.value.modificationSourceKey || "");
const modifications = ref(data.value.modifications || []);
const lists = ref(data.value.lists || []);

const { open, onChange } = useFileDialog({
  accept: "*.json",
  multiple: false
});

const toggleTab = active => {
  activeTab.value = active;
};

const saveData = async () => {
  actorSheet._activeTab = activeTab.value;
  actorSheet._modificationSourceKey = modificationSourceKey.value;
  actorSheet._modifications = modifications.value.filter(mod => {
    return mod.source !== "" && mod.target !== "";
  });
  actorSheet._lists = lists.value;
  await actor.prepareData();
  await actorSheet._saveFlags();
};

const onExportConfig = () => {
  const config = deepUnref({
    activeTab,
    modificationSourceKey,
    modifications,
    lists
  });
  const blob = new Blob([JSON.stringify(config)], {
    type: "application/json;charset=utf-8"
  });
  saveAs(blob, "systemmod_config.json");
};

onChange(async fileList => {
  const reader = new FileReader(fileList[0]);
  try {
    const configData = JSON.parse(await reader.readAsText("UTF-8"));
    activeTab.value = configData.activeTab;
    modificationSourceKey.value = configData.modificationSourceKey;
    modifications.value = configData.modifications;
    lists.value = configData.lists;

    tabsKey.value = nanoid();
    await nextTick();

    await promiseTimeout(0);
    initFlowbite();
    ui.notifications.info(
      localize("SYSTEMMOD.LoadedConfig", { actor: actor.name })
    );
  } catch (e) {
    ui.notifications.error(
      localize("SYSTEMMOD.Error.FailedLoadingConfig", {
        actor: actor.name,
        error: e.message
      })
    );
  }
});

onMounted(() => {
  data.value = actorSheet.getData();
});

onUnmounted(async () => {
  saveData();
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
