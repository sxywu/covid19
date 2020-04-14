<template>
  <div id="failed">
    <div class="content">
      <div class="item">
        <svg
          v-if="isFoodVariant"
          xmlns="http://www.w3.org/2000/svg"
          width="23"
          height="22"
          viewBox="0 0 23 22"
        >
          <path
            d="M6,0.586 L11.707,6.293 C12.0973819,6.68349985 12.0973819,7.31650015 11.707,7.707 L11.707,7.707 L10.414,9 L12,10.586 L21.293,1.289 C21.5538132,1.02861004 21.9367094,0.932782341 22.2894296,1.03962289 C22.6421498,1.14646345 22.907514,1.43865222 22.98,1.8 C23.026,2.029 23.329,6.672 19,11 C14.745,15.252 12,15.312 10.262,15.152 L10.262,15.152 L3.707,21.707 L2.293,20.293 L10.586,12 L9,10.414 L7.707,11.707 C7.31650015,12.0973819 6.68349985,12.0973819 6.293,11.707 L6.293,11.707 L0.586,6 L2,4.586 L7,9.586 L7.586,9 L2.586,4 L4,2.586 L9,7.586 L9.586,7 L4.586,2 L6,0.586 Z M16.8,15.39 L21.414,20 L20,21.414 L14.952,16.366 C15.5935047,16.091438 16.2115527,15.7650231 16.8,15.39 L16.8,15.39 Z"
          />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
          <path
            d="M19.5,0 C20.8807119,0 22,1.11928813 22,2.5 L22,2.5 L22,7 L24,7 L24,9 L22,9 L22,13.5 C22,14.8807119 20.8807119,16 19.5,16 C18.1192881,16 17,14.8807119 17,13.5 L17,13.5 L17,2.5 C17,1.11928813 18.1192881,0 19.5,0 Z M4.5,0 C5.16304122,0 5.79892601,0.263392101 6.26776695,0.732233047 C6.7366079,1.20107399 7,1.83695878 7,2.5 L7,2.5 L7,13.5 C7,14.8807119 5.88071187,16 4.5,16 C3.11928813,16 2,14.8807119 2,13.5 L2,13.5 L2,9 L-4.4408921e-16,9 L-4.4408921e-16,7 L2,7 L2,2.5 C2,1.11928813 3.11928813,0 4.5,0 Z M16,7 L16,9 L8,9 L8,7 L16,7 Z"
          />
        </svg>
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
import Share from './Share'

export default {
  name: 'FailedPage',
  components: {
    Share,
  },
  methods: {
    playAgain() {
      this.$store.dispatch('resetGame')
    },
  },
  computed: {
    foodStatus() {
      return this.$store.state.foodStatus
    },
    exerciseStatus() {
      return this.$store.state.exerciseStatus
    },
    isFoodVariant() {
      return this.$store.state.exerciseStatus.value >=
        this.$store.state.foodStatus.value
        ? true
        : false
    },
  },
}
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

.content {
  text-align: center;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.item {
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.item-content {
  margin-left: 0.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
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
