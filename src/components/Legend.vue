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
          label: this.$t('healthStatus.healthy'),
          color: '#e1e0ed',
        },
        {
          value: 2450,
          label: this.$t('healthStatus.infectedAsymptomatic'),
          color: '#8f6dbd',
        },
        {
          value: 1280,
          label: this.$t('healthStatus.mildSymptoms'),
          color: '#fe8f55',
        },
        {
          value: 980,
          label: this.$t('healthStatus.severeSymptoms'),
          color: '#fe476f',
        },
        {
          value: 300,
          label: this.$t('healthStatus.deceased'),
          color: '#4b3b59',
        },
        {
          value: 2,
          label: this.$t('healthStatus.recovered'),
          color: '#63cbe2',
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
