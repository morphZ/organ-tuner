<script setup lang="ts">
import useTuning from '~/composables/useTuning';

const { mode } = useTuning();
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm text-slate-500">Mode</label>
    <select v-model="mode" class="px-2 py-1 border rounded">
      <option value="absolute">absolute</option>
      <option value="relative">relative</option>
    </select>
  </div>
</template>
