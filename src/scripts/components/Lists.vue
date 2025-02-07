<template>
  <div :key="tabsKey" ref="focusElm">
    <div :id="accordionId" data-accordion="collapse">
      <VueDraggable
        class="w-full"
        :animation="150"
        handle=".list-sort-handle"
        v-model="lists"
      >
        <div class="mb-2" v-for="(list, idx) in lists">
          <h2 :id="`${list.id}-collapse-heading`" class="flex flex-row">
            <div class="list-sort-handle basis-[30px] icon p-2">
              <div class="fa fa-sort"></div>
            </div>
            <button
              type="button"
              class="flex flex-row items-center justify-between w-full p-1 px-4 font-medium rtl:text-right text-gray-500 border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
              :data-accordion-target="`#${list.id}-collapse-body`"
              aria-expanded="true"
            >
              <span>{{ list.key || "&lt;insert key&gt;" }}</span>
              <svg
                data-accordion-icon
                class="w-3 h-3 rotate-180 shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div :id="`${list.id}-collapse-body`" class="hidden">
            <div class="flex flex-row gap-x-2">
              <div class="basis-1/2">
                <label>{{ localize("SYSTEMMOD.Lists.Key") }}:</label>
                <input
                  type="text"
                  v-model="list.key"
                  :placeholder="localize('SYSTEMMOD.Lists.Key')"
                />
              </div>
              <div class="basis-4/12 ms-8 pe-8">
                <label>&nbsp;</label>
                <button type="button" @click="onDuplicateList(idx)">
                  {{ localize("SYSTEMMOD.Lists.Duplicate") }}
                  {{ localize("SYSTEMMOD.Lists.List") }}
                </button>
              </div>
              <div class="basis-1/2">
                <label>&nbsp;</label>
                <button type="button" @click="removeList(idx)">
                  {{ localize("SYSTEMMOD.Lists.Remove") }}
                </button>
              </div>
            </div>
            <div
              class="flex flex-row my-2"
              :title="localize('SYSTEMMOD.Lists.SubKeyHelp')"
            >
              <div class="basis-4/12">
                <label>
                  {{ localize("SYSTEMMOD.Lists.AvailableSubKeys") }}:
                </label>
              </div>
              <div class="basis-8/12">
                {{ joinedSubKeys(list.key) }}
              </div>
            </div>
            <div class="flex flex-row my-2">
              <div class="basis-8/12 flex flex-row gap-x-2">
                <div
                  class="basis-auto me-3"
                  :title="localize('SYSTEMMOD.Lists.ExistsIfHelp')"
                >
                  <label
                    class="ms-2 text-sm font-medium inert:opacity-50"
                    :for="`${list.id}-checkbox-ei`"
                  >
                    <input
                      :id="`${list.id}-checkbox-ei`"
                      class="w-5! h-5! text-blue-600 bg-gray-100 border-gray-300 rounded-sm ring-1 ring-gray-500 hover:ring-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                      type="checkbox"
                      v-model="list.options.existsIf"
                    />
                    {{ localize("SYSTEMMOD.Lists.ListOption.ExistsIf") }}:
                  </label>
                </div>
                <div class="basis-auto">
                  <select
                    class="inert:opacity-40"
                    :inert="!list.options.existsIf"
                    v-model="list.options.existsIfKey"
                  >
                    <option :value="key" v-for="key in getSubKeys(list.key)">
                      {{ key }}
                    </option>
                  </select>
                </div>
                <div class="basis-auto">
                  {{ localize("SYSTEMMOD.Lists.ExistsIfExists") }}
                </div>
              </div>
            </div>
            <div class="flex flex-row my-2">
              <div class="basis-full">
                <OneToOneModValue
                  v-model="list.modifications"
                  :source-options="getSubKeys(list.key)"
                />
              </div>
            </div>
          </div>
        </div>
      </VueDraggable>
    </div>
    <div>
      <button type="button" @click="addList">
        {{ localize("SYSTEMMOD.Lists.Add") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef
} from "vue";
import { promiseTimeout } from "@vueuse/core";
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { VueDraggable } from "vue-draggable-plus";
import { initFlowbite } from "flowbite";
import { cloneDeep, get } from "lodash-es";
import { localize } from "../../libs/vue/VueHelpers";
import { nanoid } from "../../libs/nanoid";
import OneToOneModValue from "./OneToOneModValue.vue";

const actor = inject("actor");

const lists = defineModel();
const tabsKey = defineModel("tabsKey");

const focusEl = useTemplateRef("focusElm");
const { activate, deactivate } = useFocusTrap(focusEl);
const accordionId = nanoid();

const addList = async () => {
  lists.value.push({
    id: nanoid(),
    key: "",
    options: { existsIf: false, existsIfKey: "" },
    modifications: []
  });
  await promiseTimeout(0);
  initFlowbite();
};

const getSubKeys = key => {
  const data = get(actor.system, `${key}.0`, "");
  if (Array.isArray(data) || typeof data !== "object") {
    return [localize("SYSTEMMOD.Lists.InvalidKeyType")];
  } else if (typeof data === "object") {
    return Object.keys(data);
  }
};

const joinedSubKeys = key => {
  if (key !== "") {
    const keys = getSubKeys(key);
    if (typeof keys === "undefined") {
      return [];
    } else {
      return keys.join(", ");
    }
  } else {
    return "";
  }
};

const onDuplicateList = async idx => {
  if (
    window.confirm(
      localize("SYSTEMMOD.DoYouWantTo", {
        action: localize("SYSTEMMOD.Lists.Duplicate").toLowerCase(),
        thing: localize("SYSTEMMOD.Lists.List").toLowerCase()
      })
    )
  ) {
    const list = cloneDeep(lists.value[idx]);
    list.id = nanoid();
    lists.value.push(list);
    await promiseTimeout(0);
    initFlowbite();
  }
};

const removeList = idx => {
  if (
    window.confirm(
      localize("SYSTEMMOD.AreYouSure", {
        thing: localize("SYSTEMMOD.Lists.List")
      })
    )
  ) {
    lists.value.splice(idx, 1);
  }
};

onMounted(async () => {
  activate();
  await nextTick();
  await promiseTimeout(0);
  initFlowbite();
});

onUnmounted(async () => {
  deactivate();
});
</script>

<style lang="scss" scoped></style>
