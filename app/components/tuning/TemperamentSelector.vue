<script setup lang="ts">
import type { TemperamentId } from '~/core/tuning/types';

const model = defineModel<TemperamentId>({ required: true });

const items: string[] = ['equal', 'werckmeister3', 'meantone'];
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm text-slate-500">Temperament</label>
    <USelect
      v-model="model"
      :items="items"
      variant="ghost"
      class="w-40"
      :ui="{ value: 'capitalize', itemLabel: 'capitalize' }"
    />
  </div>
</template>
