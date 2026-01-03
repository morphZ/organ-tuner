class PitchProcessor extends AudioWorkletProcessor {
  process(_inputs, _outputs, _parameters) {
    // Placeholder processor: no-op. Replace with real pitch detection.
    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
