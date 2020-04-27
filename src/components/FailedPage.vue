<template>
  <div id="failed">
    <div class="image-content">
      <img v-if="isFoodVariant" src="../assets/empty-fridge.png" />
      <img v-else src="../assets/dirty-couch.png" />
    </div>
    <div class="content">
      <div class="item">
        <div class="item-content">
          <h3 v-if="isFoodVariant" class="label">{{ $t('food') }}</h3>
          <h3 v-else class="label">{{ $t('exercise') }}</h3>
          <div id="progress-bar">
            <progress value="0.2" max="10" />
          </div>
        </div>
      </div>
      <h1 v-if="isFoodVariant">{{ $t('failed.heading.food') }}</h1>
      <h1 v-else>{{ $t('failed.heading.exercise') }}</h1>
      <p>{{ $t('failed.body') }}</p>
      <Share />
      <button @click="playAgain" class="playBtn">{{ $t('failed.buttonCta') }}</button>
    </div>
  </div>
</template>

<script>
import Share from "./Share";

export default {
  name: "FailedPage",
  components: {
    Share
  },
  methods: {
    playAgain() {
      this.$store.dispatch("resetGame");
    }
  },
  computed: {
    foodStatus() {
      return this.$store.state.foodStatus;
    },
    exerciseStatus() {
      return this.$store.state.exerciseStatus;
    },
    isFoodVariant() {
      return this.$store.state.exerciseStatus.value >=
        this.$store.state.foodStatus.value
        ? true
        : false;
    }
  }
};
</script>

<style lang="scss" scoped>
#failed {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
}

p {
  font-size: 1.25rem;
  line-height: 1.5;
}

img {
  max-width: 300px;
  margin: 0 auto;
  display: flex;
}

input {
  display: flex;
  flex-direction: row;
  align-items: left;
  justify-content: left;
}

.content {
  margin-left: 3em;
  text-align: left;
  width: 50%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: left;
}

.item {
  // padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: left;
  justify-content: left;
  width: 100%;
}

.item-content {
  // margin-left: 0.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: left;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
  h3 {
    padding-bottom: 3px;
  }
  progress {
    margin-top: 4px;
  }
}

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
progress[value]::-webkit-progress-value {
  background-color: $red;
  border-radius: 2px;
}
progress[value]::-moz-progress-bar {
  background-color: $red;
  border-radius: 2px;
}

.playBtn {
  max-width: 250px;
  background-color: $red;
  color: #fff;
  padding: 1rem 2rem;
  margin: 1rem 0;
  border: none;
  border-radius: 5px;
  box-shadow: 0 5px #d23658;
  &:hover {
    filter: brightness(0.9) contrast(1.2) saturate(0.9);
  }
}
</style>
