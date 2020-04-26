<template>
  <div id="legend" :class="$mq">
    <h5 class="label" v-if="!isPhone">Legend</h5>
    <ul>
      <li v-if="!isPhone" v-for="i in [0, 2, 3, 4, 5, 1]" :key="i">
        <div class="legend-circle" :style="{background: colorsByHealth[i]}" />
        <span class="legend-label">{{ healthStatus[i] }}</span>
      </li>
      <li v-if="isPhone" v-for="i in [0, 2, 3, 1, 4, 5]" :key="i">
        <div class="legend-circle" :style="{background: colorsByHealth[i]}" />
        <span class="legend-label">{{ healthStatus[i] }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Legend',
  props: ['isPhone', 'healthStatus', 'colorsByHealth'],
}
</script>

<style lang="scss" scoped>
#legend {
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

#legend.sm {
  border-top: 1px solid $gray;

  ul {
    width: 100%;
    display: grid;
    grid-column-gap: 0.5rem;
    grid-template-columns: repeat(3, min-content);
    white-space: nowrap;
    justify-content: center;
    margin: 0.25rem 0;
  }
  li {
    grid-template-columns: 14px 1fr;
  }
  .legend-circle {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  // ul, li {
  //   display: inline-block;
  //   padding: 0rem;
  // }
  // .legend-label {
  //   vertical-align: middle;
  // }
}
</style>
