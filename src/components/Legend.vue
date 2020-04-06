<template>
  <div id="legend">
    <h5 class="label">Legend</h5>
    <ul>
      <li v-for="legend in legends" :key="legend.label">
        <span>
          <div class="legend-circle" :style="{background: legend.color}" />
          <!-- <span class="value">{{ legend.value }}</span> -->
        </span>
        <span class="legend-label">{{ legend.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Legend',
  data() {
    return {
      legends: [
        {
          value: 5630,
          label: 'Uninfected',
          color: '#CCCCCC',
        },
        {
          value: 2450,
          label: 'Asymptomatic',
          color: '#999999',
        },
        {
          value: 1280,
          label: 'Mild Symptoms',
          color: '#999999',
        },
        {
          value: 980,
          label: 'Severe Symptoms',
          color: '#333333',
        },
        {
          value: 300,
          label: 'Deceased',
          color: '#000000',
        },
        {
          value: 2,
          label: 'Recovered',
          color: '#000000',
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
#legend {
  ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
  .value {
    font-weight: bold;
    padding: 0 1rem 0 0.4rem;
  }
  .legend-label {
    font-size: 12.5px;
  }
  .legend-circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }
}
</style>

