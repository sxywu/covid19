<template>
  <div id="header">
    <div id="date">
      <h3 class="label">week</h3>
      <h4>{{ week }}</h4>
    </div>
    <div id="date">
      <h3 class="label">day</h3>
      <h4>{{ day }}</h4>
    </div>
    <div class="item">
      <h3 class="label">Food</h3>
      <ProgressBar v-bind="foodStatus" />
    </div>
    <div class="item">
      <h3 class="label">Exercise</h3>
      <ProgressBar v-bind="exerciseStatus" />
    </div>
    <div class="item">
      <h3 class="label">Stayed Home</h3>
      <ProgressBar v-bind="{value: stayedHome.length, maxValue: infected.length}" />
    </div>
    <div class="item">
      <h3 class="label">Hospital Capacity</h3>
      <ProgressBar v-bind="{value: filledBeds, maxValue: totalAvailableBeds}" />
    </div>
  </div>
</template>

<script>
import ProgressBar from './ProgressBar'

export default {
  name: 'Header',
  components: {
    ProgressBar,
  },
  computed: {
    day() {
      return this.$store.state.day
    },
    week() {
      return Math.ceil(this.day / 7)
    },
    foodStatus() {
      return this.$store.state.foodStatus
    },
    exerciseStatus() {
      return this.$store.state.exerciseStatus
    },
    infected() {
      return this.$store.getters.infected || []
    },
    stayedHome() {
      return _.filter(this.infected, ({ destination }) => destination === -1)
    },
    totalAvailableBeds() {
      return this.$store.getters.totalAvailableBeds
    },
    filledBeds() {
      return this.$store.getters.filledBeds
    },
  },
}
</script>

<style lang="scss" scoped>
#header {
  display: grid;
  grid-template-columns: 80px 80px 1fr 1fr 1fr 1fr;
  height: 100%;

  h3,
  h4 {
    margin: 0;
  }
}
#date {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  h3 {
    margin-top: 5px;
  }
  h4 {
    font-size: 2rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: -2px;
    padding-right: 2px;
  }

  &:not(:first-of-type) {
    border-left: 1px solid $gray;
  }
}
.item {
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  &:not(:first-of-type) {
    border-left: 1px solid $gray;
  }
  h3 {
    padding-bottom: 3px;
  }
  progress {
    margin-top: 4px;
  }
}
</style>
