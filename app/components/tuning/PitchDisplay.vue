<script setup lang="ts">
import { computed } from 'vue';
import useTuning from '~/composables/useTuning';

const { pitchCents } = useTuning();

const display = computed(() => (pitchCents.value == null ? '—' : `${pitchCents.value.toFixed(1)} ct`));

const color = computed(() => {
  const c = pitchCents.value ?? 9999;
  if (Math.abs(c) < 5) return 'text-green-600';
  if (Math.abs(c) < 25) return 'text-yellow-600';
  return 'text-red-600';
});
</script>

<template>
  <div class="flex flex-col items-center px-4 py-2 border rounded-md">
    <div class="text-sm text-slate-500 mb-1">Pitch deviation</div>
    <div :class="['text-2xl font-semibold', color]">{{ display }}</div>
  </div>
</template>
