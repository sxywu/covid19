<template>
  <div id="decision" :class="value > 0 && 'selected'">
    <div class="content">
      <img :src="icon" :alt="label" />
      <div>
        <h4>{{ label }}</h4>
        <p>{{ byline }}</p>
      </div>
    </div>
    <div class="action">
      <button :disabled="value >= 1 ? false : true"
        @click="updateDecision(value -= 1, index)">
        -
      </button>
      <span class="value">{{ value }}</span>
      <button :disabled="value <= 6 ? false : true"
        @click="updateDecision(value += 1, index)">
        +
      </button>
    </div>
  </div>
</template>

<script>
import GroceriesIcon from '../assets/groceries.svg'

export default {
  name: 'Decision',
  data() {
    return {
      value: 0,
    }
  },
  props: {
    label: { default: 'Buy groceries' },
    byline: { default: 'Go to a supermarket' },
    icon: { default: GroceriesIcon },
    index: {default: 0},
    updateDecision: Function,
  },
}
</script>

<style lang="scss" scoped>
#decision {
  padding: 0;
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  border: 1px solid $gray;
  background: white;
  padding: 1rem;
  border-radius: 4px;

  h4 {
    margin: 0;
    margin-bottom: 4px;
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    font-size: 15px;
    opacity: 0.8;
  }

  button {
    margin: 0 10px;
    border: 1px solid $gray;
    border-radius: 4px;
    width: 40px;
    height: 40px;
    background: $primary;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.selected {
  filter: invert(95%);
}

.content {
  display: flex;
  align-items: flex-start;
  img {
    max-width: 24px;
    width: 100%;
    height: auto;
    margin-right: 0.5rem;
  }
}

.action {
  font-variant-numeric: tabular-nums;
  font-size: 20px;
}

.value {
  font-size: 20px;
}
</style>
