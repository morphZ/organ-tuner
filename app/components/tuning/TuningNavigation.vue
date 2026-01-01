<script setup lang="ts">
import useTuning from '~/composables/useTuning';

const { currentNote, nextNote, prevNote, nextOctave, prevOctave } = useTuning();
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="flex gap-1">
      <button class="px-3 py-1 border rounded" @click="prevNote">◀</button>
      <button class="px-3 py-1 border rounded" @click="nextNote">▶</button>
    </div>

    <div class="px-4 py-2 border rounded">{{ currentNote.toSpecifier() }}</div>

    <div class="flex gap-1">
      <button class="px-3 py-1 border rounded" @click="prevOctave">-</button>
      <button class="px-3 py-1 border rounded" @click="nextOctave">+</button>
    </div>
  </div>
</template>
