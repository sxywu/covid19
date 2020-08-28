# covid19


## Contributing
We'd greatly appreciate your help in two areas: translating the project into your own local language, and/or supplying local data for your country.

### Localization
The localization files can be found in `src/locales/`.  Copy over [`en.json`](src/locales/en.json) file and rename it with your ISO-639-1 two-letter language code.  Add your translations.

### Data
To add country-specific data, create a new folder under `public/` with your **two-letter country code** (ISO 3166-1 alpha-2).

Within the folder, add three files:

    [two-letter country code]/
    ├── population-by-zip-code.csv
    ├── hospitals-by-zip-code.csv
    └── zip-to-city-county.csv

For each country, we need the following information:
- Population by age per zip code (`population-by-zip-code.csv`)
- Number of beds per hospital or county (`hospitals-by-zip-code.csv`)
- Map zip code to county (`zip-to-city-county.csv`)

#### Population by age per zip code
File includes **total population** as well as population per age group for every **20 years**.  This file allows enables the model, which determines [rate of infection and hospitalization based on age](https://observablehq.com/@osserman/people-of-the-pandemic-simulation-methodology#parameters).

**Columns**: `zip, total, 0, 20, 40, 60, 80`  
Example: [public/us/population-by-zip-code.csv](public/us/population-by-zip-code.csv)

#### Number of hospital beds
This file can take in the number of beds per **hospital**, or by **county**—whichever is easier to obtain for your country.  This file is used for calculating the number of beds that might be available to the people living in a zip code, which is an [equation of number of beds in the county multipled by ratio of population in zip code to in county](https://observablehq.com/@osserman/people-of-the-pandemic-simulation-methodology#housesAndDestinations).

**Columns (by zip code)**: `name, city, zip, beds`  
Required columns: zip code, total number of beds in hospital.
Optional columns: name for hospital, city the hospital is located in.  
Example: [public/us/hospitals-by-zip-code.csv](public/us/hospitals-by-zip-code.csv)

**Columns (by county)**: `county, beds, population`  
ID for county, total number of hospital beds in county, and population number for that county.  
Example: [public/fr/hospitals-by-zip-code.csv](public/fr/hospitals-by-zip-code.csv)

#### Map zip code to county
This file is used for supporting the [hospital beds calculation](https://observablehq.com/@osserman/people-of-the-pandemic-simulation-methodology#housesAndDestinations), as well as displaying the city and state names in the game.

**Columns**: `zip, city, state, county`. 
Example: [public/us/zip-to-city-county.csv](public/us/zip-to-city-county.csv)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Database Setup

We use Firebase's [Firestore (docs link)](https://firebase.google.com/docs/firestore) to store game data. You will have to create a freemium account to run the game locally.

All of our firestore related code is in `src/firebase/`. In this folder we have 4 files:

    firebase
    ├── admin-credentials.json
    ├── app.js
    ├── credentials.js
    └── db.js

Inside of `credentials.js` you will see that we are exporting a `config` object with a bunch of environment variables set by Vue. You will need to create a file called `.env.local` and copy the values from `.env.template` into that file.

Your file will look like this:

    VUE_APP_FIREBASE_API_KEY=vue-app-firebase-api-key
    VUE_APP_FIREBASE_AUTH_DOMAIN=vue-app-firebase-auth-domain
    VUE_APP_FIREBASE_DATABASE_URL=vue-app-firebase-database-url
    VUE_APP_FIREBASE_PROJECT_ID=vue-app-firebase-project-id
    VUE_APP_FIREBASE_STORAGE_BUCKET=vue-app-firebase-storage-bucket
    VUE_APP_FIREBASE_MESSAGING_SENDER_ID=vue-app-firebase-messaging-sender-id
    VUE_APP_FIREBASE_APP_ID=vue-app-firebase-app-id
    VUE_APP_FIREBASE_MEASUREMENT_ID=vue-app-firebase-measurement-id (this won't be there if you unselected analytics)

Now you will need to go get the correct values for these variables. Navigate to the firebase website, login, and click "Go to Console". You will need to add a new project if you dont have one for this game already.

Click the project and go to project settings. It will be under the pop out menu when you click the cog on the left sidebar.

Under the General tab, scroll down and you will see a code block with section titled "your apps". You need to create a web app (the one with `</>` symbol). You can name it whatever you want. Copy the `firebaseConfig` object. These are the values you need in your `.env.local`.

Now you will need to create your database. Make it a test database so you dont have to worry about permissions.

Now when you click make a descision in the game, it will be stored in your database.

You can take a look at the methods we use to interact with the database in `src/firebase/db.js`.

## License
This work is licensed under
<a rel="license" href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>.

