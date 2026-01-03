import { onUnmounted, ref } from 'vue';

export function useAudioPitch() {
  const isActive = ref(false);
  const hz = ref<number | null>(null);
  let _interval: number | null = null;

  async function start() {
    if (isActive.value) return;
    if (typeof window === 'undefined') return;

    // For initial implementation we mock pitch detection.
    // Replace with real AudioWorkletNode + processor later.
    isActive.value = true;
    hz.value = 440;
    _interval = window.setInterval(() => {
      hz.value = 440 + (Math.random() - 0.5) * 4; // ~±2 Hz noise
    }, 200);
  }

  function stop() {
    if (!isActive.value) return;
    isActive.value = false;
    if (_interval) {
      clearInterval(_interval);
      _interval = null;
    }
    hz.value = null;
  }

  onUnmounted(() => stop());

  return {
    isActive,
    hz,
    start,
    stop,
  } as const;
}

export default useAudioPitch;
