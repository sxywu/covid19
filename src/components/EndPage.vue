<template>
  <div id="end">
    <div class='content'>
      <div>Some End Screen</div>
      <button @click='playAgain'>Play Again</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EndPage',
  methods: {
    playAgain() {
      this.$store.dispatch('resetGame')
    },
  },
}
</script>

<style lang="scss">
#end {
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