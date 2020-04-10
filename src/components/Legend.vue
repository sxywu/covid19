<template>
  <div id="legend">
    <h5 class="label">Legend</h5>
    <ul>
      <li v-for="i in [0, 2, 3, 4, 5, 1]" :key="i">
        <div class="legend-circle" :style="{background: colorsByHealth[i]}" />
        <span class="legend-label">{{ healthStatus[i] }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Legend',
  props: ['healthStatus', 'colorsByHealth'],
}
</script>

<style lang="scss" scoped>
#legend {
  min-width: 180px;

  ul,
  li {
    list-style-type: none;
    padding: 0;
  }
  li {
    padding: 0.25rem 0;
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
  }
  .legend-label {
    font-size: 12.5px;
  }
  .legend-circle {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }
}
</style>
