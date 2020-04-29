<template>
  <div id="header" :class="$mq" :style="{ height: `${height}px` }">
    <!-- ON PHONE -->
    <div id="date" v-if="isPhone">
      <h3 class="label">{{ $tc('week', 1, { count: '' }) }}</h3>
      <h4>{{ week }}</h4>
    </div>
    <div id="date" v-if="isPhone">
      <h3 class="label">{{ $t('day') }}</h3>
      <h4>{{ day }}</h4>
    </div>
    <!-- ON BOTH -->
    <div class="item">
      <!-- ON DESKTOP, show on side -->
      <img v-if="!isPhone" src="../assets/food.png" height="22" />
      <div class="item-content">
        <h3 class="label">
          <!-- ON PHONE, show on top of progress bar -->
          <img v-if="isPhone" src="../assets/food.png" height="15" />
          {{ $t('food') }}
        </h3>
        <ProgressBar
          v-bind="foodStatus"
          :className="foodStatus.value < 7 && 'red'"
        />
      </div>
    </div>
    <div class="item">
      <!-- ON DESKTOP, show on side -->
      <img v-if="!isPhone" src="../assets/exercise.png" height="22" />
      <div class="item-content">
        <h3 class="label">
          <!-- ON PHONE, show on top of progress bar -->
          <img v-if="isPhone" src="../assets/exercise.png" height="15" />
          {{ $t('exercise') }}
        </h3>
        <ProgressBar
          v-bind="exerciseStatus"
          :className="exerciseStatus.value < 2 && 'red'"
        />
      </div>
    </div>
    <!-- ON DESKTOP -->
    <div id="date" v-if="!isPhone">
      <h3 class="label">{{ $tc('week', 1, { count: '' }) }}</h3>
      <h4>{{ week }}</h4>
    </div>
    <div id="date" v-if="!isPhone">
      <h3 class="label">{{ $t('day') }}</h3>
      <h4>{{ day }}</h4>
    </div>
    <div class="item" v-if="!isPhone">
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
        <h3 class="label">{{ $t('header.wentOut') }}</h3>
        <ProgressBar
          v-bind="{ value: wentOut.length, maxValue: infected.length }"
        />
      </div>
    </div>
    <div class="item" v-if="!isPhone">
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
        <h3 class="label">{{ $t('header.hospitalCapacity') }}</h3>
        <ProgressBar
          v-bind="{ value: filledBeds, maxValue: totalAvailableBeds }"
          :className="filledBeds / totalAvailableBeds > 0.85 && 'red'"
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
  props: ['isPhone', 'height'],
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
    wentOut() {
      return _.filter(this.infected, ({ destination }) => destination > -1)
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
h3,
h4 {
  margin: 0;
}
// DESKTOP
#header.lg, #header.md {
  display: grid;
  grid-template-columns: 1fr 1fr 80px 80px 1fr 1fr;
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
// PHONE
#header.sm {
  display: grid;
  grid-template-columns: 60px 60px 1fr 1fr;

  h4 {
    font-size: 1.5rem;
  }
  .item {
    padding: 0.5rem;
  }
  .item-content {
    margin-left: 0;
  }
}
</style>
