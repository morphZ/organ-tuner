<script setup lang="ts">
import useTuning from '~/composables/useTuning';

const { temperament } = useTuning();
</script>

<template>
  <div class="flex items-center gap-2">
    <label class="text-sm text-slate-500">Temperament</label>
    <select v-model="temperament" class="px-2 py-1 border rounded">
      <option value="equal">Equal</option>
      <option value="werckmeister3">Werckmeister III</option>
      <option value="meantone">Meantone</option>
    </select>
  </div>
</template>
