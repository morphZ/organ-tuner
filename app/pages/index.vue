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

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});
const period = ref<Period>('daily');
const tuning = useTuning();
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
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats :period="period" :range="range" />
      <HomeChart :period="period" :range="range" />
      <HomeSales :period="period" :range="range" />
      <section class="mt-8">
        <h3 class="text-lg font-medium mb-2">Tuner</h3>
        <div class="flex items-center gap-4">
          <TuningNavigation />
          <PitchDisplay />
          <div class="flex flex-col gap-2">
            <TuningModeSelector />
            <TemperamentSelector />
            <div class="flex gap-2 items-center">
              <button
                class="px-3 py-1 border rounded bg-neutral-50"
                @click="tuning.setReferenceNote(tuning.currentNote)"
              >
                Set reference
              </button>
              <button
                class="px-3 py-1 border rounded bg-neutral-50"
                @click="tuning.setReferenceNote(null)"
              >
                Clear reference
              </button>
            </div>
            <div class="text-sm text-slate-500">Ref: {{ referenceLabel }}</div>
          </div>
        </div>
      </section>
    </template>
  </UDashboardPanel>
</template>
