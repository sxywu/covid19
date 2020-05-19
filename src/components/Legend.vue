<template>
  <div id="legend" :class="$mq">
    <h5 class="label" v-if="!isPhone && !isMinimal">Legend</h5>
    <ul :class="isMinimal ? 'minimal' : ''">
      <li v-for="i in order" :key="i">
        <div class="legend-circle" :style="{background: colorsByHealth[i]}" />
        <span class="legend-label">{{ healthStatus[i] }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Legend',
  props: ['isMinimal', 'isPhone', 'healthStatus', 'colorsByHealth'],
  data() {
    return {
      order: this.isMinimal ? [2, 3, 4, 5] :
        (this.isPhone ? [0, 2, 3, 1, 4, 5] : [0, 2, 3, 4, 5, 1])
    }
  },
}
</script>

<style lang="scss" scoped>
#legend {
  text-align: left;

  ul {
    white-space: nowrap;
  }
  ul.minimal {
    width: 100%;
    display: grid;
    grid-column-gap: 0.5rem;
    grid-template-columns: repeat(4, min-content);
  }

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
  overflow-x: auto;
  ul {
    width: 100%;
    display: grid;
    grid-column-gap: 0.5rem;
    grid-template-columns: repeat(3, min-content);
    justify-content: flex-start;
    margin: 0.25rem 0;
    padding: 0 8px;
  }
  ul.minimal {
    grid-template-columns: repeat(2, min-content);
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
}
</style>
