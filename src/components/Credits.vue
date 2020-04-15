<template>
  <div id="credits">
    <h3>Credits</h3>
    <ul>
      <li>
        <img src="../assets/avatars/shirley.jpg" alt="Shirley Wu profile photo" width="60" />
        <h4>Shirley Wu</h4>
        <p>Story, Data Visualization Design & Development, Software Architecture</p>
        <div>
          <a href="https://sxywu.com/">website</a>,
          <a href="https://twitter.com/sxywu">twitter</a>
        </div>
      </li>
      <li>
        <img src="../assets/avatars/maggie.jpg" alt="Maggie Appleton profile photo" width="60" />
        <h4>Maggie Appleton</h4>
        <p>Illustration & Visual Design</p>
        <div>
          <a href="https://maggieappleton.com/">website</a>,
          <a href="https://illustrated.dev/">illustrated.dev</a>
        </div>
      </li>
      <li>
        <img src="../assets/avatars/ian.jpg" alt="Ian Jones profile photo" width="60" />
        <h4>Ian Jones</h4>
        <p>Front & Backend Development</p>
        <a href="https://www.ianjones.us/">website</a>
      </li>
      <li>
        <img src="../assets/avatars/vojta.png" alt="Vojta Holik profile photo" width="60" />
        <h4>Vojta Holik</h4>
        <p>UI Design & Development</p>
        <a href="https://vojta.io/">website</a>
      </li>
      <li>
        <img src="../assets/avatars/sidney.jpg" alt="Sidney Bell profile photo" width="60" />
        <h4>Sidney Bell</h4>
        <p>Expert Consultant, PhD in Virus Evolution and Immunity</p>
        <a href="https://twitter.com/sidneymbell">twitter</a>
      </li>
      <li>
        <img src="../assets/eggo.svg" alt="egghead.io logomark" width="60" />
        <h4>egghead.io</h4>
        <p>
          Thank you so much to
          <a href="https://egghead.io">egghead.io</a> for sponsoring this project.
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Credits',
}
</script>

<style lang="scss" scoped>
#credits {
  padding: 0;
  width: 100%;
  max-width: 960px;
  text-align: center;
}
ul {
  list-style-type: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 1.5rem;
}
li {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
}
h3 {
  margin: 0 auto 3rem auto;
  text-transform: uppercase;
  font-weight: normal;
  letter-spacing: 1px;
  font-size: 15px;
}
h4 {
  font-size: 1.25rem;
  margin: 0.5rem 0 0 0;
}
p {
  margin: 0.5rem 0;
  opacity: 0.8;
  line-height: 1.4;
}
a {
  color: $red;
}
img {
  border-radius: 50%;
}
</style>
