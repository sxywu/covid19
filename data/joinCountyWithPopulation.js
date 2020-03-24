const fs = require('fs')
const _ = require('lodash')

const populations = fs.readFileSync('./public/population-by-zip-code.csv', {encoding: 'utf8'})
const counties = {}
_.each(fs.readFileSync('./data/zip-to-county.csv', {encoding: 'utf8'}).split('\n'), (d, i) => {
  if (i === 0) return
  const [zip, county] = d.split(',')
  counties[zip] = county
})


let data = ''
// go through each population zip code
_.each(populations.split('\n'), (pop, i) => {
  if (i === 0) {
    data += `${pop},county\n`
    return
  }
  const [zip] = pop.split(',')
  data += `${pop},${counties[zip]}\n`
})

fs.writeFileSync('./data/population-by-zip-code.csv', data, {encoding: 'utf8'})
