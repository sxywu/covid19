const fs = require('fs')
const _ = require('lodash')
const csv = require('csvtojson')
const {parse} = require('json2csv')

csv().fromFile('./data/zip-to-county.csv')
  .then(counties => {
    counties = _.keyBy(counties, 'zip')

    csv().fromFile('./public/population-by-zip-code.csv')
      .then(population => {
        _.each(population, pop => Object.assign(pop, {
          county: counties[pop.zip] && counties[pop.zip].county
        }))

        fs.writeFileSync('./data/population-by-zip-code.csv', parse(population), {encoding: 'utf8'})
      })
  })
