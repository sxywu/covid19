<template>
  <div id="header">
    <div class="item">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="22"
        viewBox="0 0 23 22"
      >
        <path
          d="M6,0.586 L11.707,6.293 C12.0973819,6.68349985 12.0973819,7.31650015 11.707,7.707 L11.707,7.707 L10.414,9 L12,10.586 L21.293,1.289 C21.5538132,1.02861004 21.9367094,0.932782341 22.2894296,1.03962289 C22.6421498,1.14646345 22.907514,1.43865222 22.98,1.8 C23.026,2.029 23.329,6.672 19,11 C14.745,15.252 12,15.312 10.262,15.152 L10.262,15.152 L3.707,21.707 L2.293,20.293 L10.586,12 L9,10.414 L7.707,11.707 C7.31650015,12.0973819 6.68349985,12.0973819 6.293,11.707 L6.293,11.707 L0.586,6 L2,4.586 L7,9.586 L7.586,9 L2.586,4 L4,2.586 L9,7.586 L9.586,7 L4.586,2 L6,0.586 Z M16.8,15.39 L21.414,20 L20,21.414 L14.952,16.366 C15.5935047,16.091438 16.2115527,15.7650231 16.8,15.39 L16.8,15.39 Z"
        />
      </svg>
      <div class="item-content">
        <h3 class="label">{{ $t('food') }}</h3>
        <ProgressBar v-bind="foodStatus" />
      </div>
    </div>
    <div class="item">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="16"
        viewBox="0 0 24 16"
      >
        <path
          d="M19.5,0 C20.8807119,0 22,1.11928813 22,2.5 L22,2.5 L22,7 L24,7 L24,9 L22,9 L22,13.5 C22,14.8807119 20.8807119,16 19.5,16 C18.1192881,16 17,14.8807119 17,13.5 L17,13.5 L17,2.5 C17,1.11928813 18.1192881,0 19.5,0 Z M4.5,0 C5.16304122,0 5.79892601,0.263392101 6.26776695,0.732233047 C6.7366079,1.20107399 7,1.83695878 7,2.5 L7,2.5 L7,13.5 C7,14.8807119 5.88071187,16 4.5,16 C3.11928813,16 2,14.8807119 2,13.5 L2,13.5 L2,9 L-4.4408921e-16,9 L-4.4408921e-16,7 L2,7 L2,2.5 C2,1.11928813 3.11928813,0 4.5,0 Z M16,7 L16,9 L8,9 L8,7 L16,7 Z"
        />
      </svg>
      <div class="item-content">
        <h3 class="label">{{ $t('exercise') }}</h3>
        <ProgressBar v-bind="exerciseStatus" />
      </div>
    </div>
    <div id="date">
      <h3 class="label">{{ $t('week') }}</h3>
      <h4>{{ week }}</h4>
    </div>
    <div id="date">
      <h3 class="label">{{ $t('day') }}</h3>
      <h4>{{ day }}</h4>
    </div>
    <div class="item">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="22"
        viewBox="0 0 24 22"
      >
        <path
          d="M23.6211128,9.00519627 L12.621134,0.22044666 C12.252855,-0.07348222 11.7234154,-0.07348222 11.3551364,0.22044666 L0.355157603,9.00519627 C-0.0623816538,9.34906588 -0.119919047,9.95636792 0.225933481,10.3691453 C0.571786008,10.7819227 1.19301227,10.8473873 1.62115517,10.5161732 L2.98815253,9.42491208 L2.98815253,20.4976009 C2.98815253,21.0366768 3.43586692,21.4736842 3.98815061,21.4736842 L9.98813906,21.4736842 L9.98813906,15.6171845 L13.9881314,15.6171845 L13.9881314,21.4736842 L19.9881198,21.4736842 C20.5404035,21.4736842 20.9881179,21.0366768 20.9881179,20.4976009 L20.9881179,9.42491208 L22.3551152,10.5161732 C22.6309637,10.7433516 23.0108241,10.8078149 23.3490411,10.6848451 C23.687258,10.5618752 23.9313454,10.2705552 23.9877093,9.92259014 C24.0440731,9.57462508 23.9039666,9.22401376 23.6211128,9.00519627 L23.6211128,9.00519627 Z"
        />
      </svg>
      <div class="item-content">
        <h3 class="label">{{ $t('header.stayedHome') }}</h3>
        <ProgressBar
          v-bind="{value: stayedHome.length, maxValue: infected.length}"
        />
      </div>
    </div>
    <div class="item">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
      >
        <path
          d="M21.0833333,6.41666667 L15.5833333,6.41666667 L15.5833333,0.916666667 C15.5833333,0.366666667 15.2166667,0 14.6666667,0 L7.33333333,0 C6.78333333,0 6.41666667,0.366666667 6.41666667,0.916666667 L6.41666667,6.41666667 L0.916666667,6.41666667 C0.366666667,6.41666667 0,6.78333333 0,7.33333333 L0,14.6666667 C0,15.2166667 0.366666667,15.5833333 0.916666667,15.5833333 L6.41666667,15.5833333 L6.41666667,21.0833333 C6.41666667,21.6333333 6.78333333,22 7.33333333,22 L14.6666667,22 C15.2166667,22 15.5833333,21.6333333 15.5833333,21.0833333 L15.5833333,15.5833333 L21.0833333,15.5833333 C21.6333333,15.5833333 22,15.2166667 22,14.6666667 L22,7.33333333 C22,6.78333333 21.6333333,6.41666667 21.0833333,6.41666667 Z"
        />
      </svg>
      <div class="item-content">
        <h3 class="label">{{ $t('hospitalCapacity') }}</h3>
        <ProgressBar
          v-bind="{value: filledBeds, maxValue: totalAvailableBeds}"
        />
      </div>
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
      return this.$store.getters.week
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
      return _.filter(this.infected, ({destination}) => destination === -1)
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
  grid-template-columns: 1fr 1fr 80px 80px 1fr 1fr;
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
  flex-direction: row;
  align-items: center;
  &:not(:first-of-type) {
    border-left: 1px solid $gray;
  }
}
.item-content {
  margin-left: 0.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  h3 {
    padding-bottom: 3px;
  }
  progress {
    margin-top: 4px;
  }
}
</style>
