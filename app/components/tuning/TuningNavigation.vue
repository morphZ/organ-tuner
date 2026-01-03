<script setup lang="ts">
import useTuning from '~/composables/useTuning';

const { currentNote, nextNote, prevNote, nextOctave, prevOctave } = useTuning();
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="flex gap-1">
      <UButton size="sm" @click="prevNote">◀</UButton>
      <UButton size="sm" @click="nextNote">▶</UButton>
    </div>

    <div class="px-4 py-2 border rounded">{{ currentNote.toSpecifier() }}</div>

    <div class="flex gap-1">
      <UButton size="sm" @click="prevOctave">-</UButton>
      <UButton size="sm" @click="nextOctave">+</UButton>
    </div>
  </div>
</template>
