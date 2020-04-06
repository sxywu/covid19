<template>
  <div id="landing">
    <div class='content'>
      Enter zip code:
      <input type='number' v-model='zipCode' />
      <button @click='startPlay'>Start Playing →</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      zipCode: '60605',
    }
  },
  methods: {
    startPlay() {
      this.$store.commit('setZipCode', this.zipCode)
      this.$store.commit('setCurrentPage', 'game')
    },
  },
}
</script>

<style lang="scss">
#landing {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
}

.content {
  margin-left: 50%;
  margin-top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
</style>
