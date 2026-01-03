<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { sub } from 'date-fns';
import PitchDisplay from '~/components/tuning/PitchDisplay.vue';
import TemperamentSelector from '~/components/tuning/TemperamentSelector.vue';
import TuningModeSelector from '~/components/tuning/TuningModeSelector.vue';
import TuningNavigation from '~/components/tuning/TuningNavigation.vue';
import useTuning from '~/composables/useTuning';
import type { Period, Range } from '~/types';

const { isNotificationsSlideoverOpen } = useDashboard();

const items = [
  [
    {
      label: 'New mail',
      icon: 'i-lucide-send',
      to: '/inbox',
    },
    {
      label: 'New customer',
      icon: 'i-lucide-user-plus',
      to: '/customers',
    },
  ],
] satisfies DropdownMenuItem[][];

const tuning = useTuning();
const { mode, temperament } = tuning;

// temporary dummy measured Hz until audio is wired
tuning.measuredHz.value = 440;
const referenceLabel = computed(() => {
  const refNote = tuning.referenceNote;
  // `tuning` is an object; its nested refs are not auto-unwrapped in template context.
  // Unwrap safely here for display.
  const note = refNote && typeof refNote === 'object' && 'value' in refNote ? refNote.value : refNote;
  return note ? note.toSpecifier() : '—';
});
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
            <TuningModeSelector v-model="mode" />
            <TemperamentSelector v-model="temperament" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
          <TuningNavigation />
          <PitchDisplay />
    </template>
  </UDashboardPanel>
</template>
