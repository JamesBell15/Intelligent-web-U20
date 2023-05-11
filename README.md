Requirements:
* node.js v19.6.1
* mongoDB v6.0.4

Installation:
* Install latest version of MongoDB https://www.mongodb.com/docs/manual/installation/
* Run database with `mongod --dbpath {path to database}`
* Install latest version of Node.js
* Navigate to project directory
* Run `npm install`
* Run `node www/bin`
* Open a browser (preferably Chrome) and go to `http://localhost:3000/`

Quick video guide to features:
* Online messaging and creating a new sighting https://www.youtube.com/watch?v=cqZuNUIxnDw
* different sighting filters https://www.youtube.com/watch?v=Z5ZzRrqCGwY
* Offline sighting creation and messages https://youtu.be/svJoPXcJmPU
* PWA https://youtu.be/-6I6N3yZ0D8

Summary of functionality:
* Index Page
  * Index page shows a list of all sightings, with a selection of their data:
    *   Species name, Confirmation status, observer, location  and time observed
  * When offline, a list of all sightings will be displayed, but further details can only be viewed for sightings the user authored (this requires signing in when online to cache the relevant information)
  * Sightings can be sorted by Name, Distance and by most recent
  * Sightings can also be searched for by name
  * A user can log in, allowing them to create sightings, send messages and receive notifications when comments have been left on their sightings
* Create Sighting
  * Input information about the observed bird, including an option to identify the species
    * Enter a search query to find species with matching names, 
  * An image must be supplied, but can be either an image file or image URL
  * Can be done while offline, but identification can only be a preliminary text entry
* View Sighting Details
  * Shows all information for the selected sighting, including the image and chat messages
  * Additionally, if the sighting identification has been obtained from DBPedia, related information is shown from its DBPedia page, such as its Latin name and an example image
  * A link to the DBPedia page will also be present if available
  * Chat:
    * Messages can be send by any logged in user, to provide feedback for the sighting and identification
    * Messages can be sent offline, and will update when the user reconnects. 
        * The user must have been logged in when online, or supplied a nickname when creating a sighting while offline
  * Edit Sighting
    * A sighting can be edited if the user is logged in as the author of the sighting
    * The Identification details and status can be updated, to confirm or change the species 

