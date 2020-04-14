<template>
  <div id="share">
    <h3>{{ $t('share.heading') }}</h3>
    <form>
      <input
        :value="siteUrl"
        v-on:focus="$event.target.select()"
        v-on:click="$event.target.select()"
        readonly
      />
      <button
        type="button"
        v-clipboard:copy="siteUrl"
        v-clipboard:success="onCopy"
        :class="{'copied': isCopied}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <title>link</title>
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2"
            fill="none"
            stroke="currentColor"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </g>
        </svg>
        <span v-if="this.isCopied">{{ $t('share.success') }}</span>
        <span v-else>{{ $t('share.buttonCta') }}</span>
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Share',
  props: {
    isCopied: { type: Boolean, default: false },
  },
  data: function() {
    return {
      siteUrl: 'https://sxywu.com/covid19',
    }
  },
  methods: {
    onCopy: function(e) {
      this.isCopied = true
      e.preventDefault()
    },
  },
}
</script>

<style lang="scss" scoped>
#share {
  padding: 0;
  width: 100%;
}
form {
  display: grid;
  grid-template-columns: 8fr 2fr;
  align-items: center;
  max-width: 380px;
  margin: 0 auto;
  margin-bottom: 1rem;
}
input {
  font-size: 17px;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 5px 0 0 5px;
  border: 1px solid $silver;
  height: 40px;
}
.copied {
  background: $primary;
}
button {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  padding: 0.5rem;
  font-size: 17px;
  margin: 0;
  border: none;
  height: 40px;
  border-radius: 0 5px 5px 0;
  background: $purple;
  svg {
    margin-right: 4px;
    max-width: 18px;
  }
}
</style>
