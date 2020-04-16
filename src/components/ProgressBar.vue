ProgressBar.vue

<template>
  <div id="progress-bar" :class="isLow ? 'low' : 'default'">
    <progress :value="value" :max="maxValue" />
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    isLow: { default: false },
    value: { default: 0 },
    maxValue: { default: 100 },
    color: { default: '#393939', low: '#fe476f' }, // put in a random default color, please change!
  },
}
</script>

<style lang="scss" scoped>
#progress-bar {
  padding: 0;
  width: 100%;
}
progress {
  width: 100%;
  border: none;
  border-radius: 2px;
}
progress[value] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
progress[value]::-webkit-progress-bar {
  background-color: $gray;
  border-radius: 2px;
}
.default {
  progress[value]::-webkit-progress-value {
    background-color: $primary;
    border-radius: 2px;
  }
  progress[value]::-moz-progress-bar {
    background-color: $primary;
    border-radius: 2px;
  }
}
.low {
  progress[value]::-webkit-progress-value {
    background-color: $red;
    border-radius: 2px;
  }
  progress[value]::-moz-progress-bar {
    background-color: $red;
    border-radius: 2px;
  }
}
</style>
