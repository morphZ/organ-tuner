<script setup lang="ts">
import type { TuningMode } from '~/core/tuning/types';

const model = defineModel<TuningMode>({ required: true });

const items: string[] = ['absolute', 'relative'];
</script>

<template>
    <label class="text-sm text-slate-500">Mode</label>
    <USelect
      v-model="model"
      :items="items"
      variant="ghost"
      class="w-32"
      :ui="{ value: 'capitalize', itemLabel: 'capitalize' }"
    />
</template>
