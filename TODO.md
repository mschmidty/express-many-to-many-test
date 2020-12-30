## Set up
[] - use express gerator to generate app with no views. 
[] - in `app.js` delete router information auto generated. 
[] - in `app.js` update error handling to return json instead of html. 
[] - install knex, pg, and nodemon. 
[] - Run Nodemon and make route to '/' to make sure that everything runs. 

## Create Database and Schema
[] - Create postgress database in terminal `createdb man-to-many`
[] - Add knex connection to postgress with `/db/knex.js` file and `knexfile.js`. 
    [] - Add `knexfile.js` with connection to database for now we will just have a development connection.
    [] - add `/db/knex.js` file with connection details to db. 
[] - Make Migrateion `knex migrate:make notes_and_tags` (if knex isn't install run `npm install knex -g`): 
    [] - Add schma for Notes, Tags, and NotesTag (join table) tables. 
        [] - Notes will be title and body.
        [] - Tags will just have name. 
        [] - notesTag will have note_id and tag_id
    [] - Run Migration `knex migrate:latest`

## Create database POST queries and routes for Many to Many relationship
[] - creat queries to create note, tag and notestag.
[] - create api folder with `notesTags.js` for all router info for notesTag. Bring in router and express. 
[] - add notes api routes to app in `app.js`. 
[] - make route to create note. 
[] - in note route make query to tags table to add tags. 
[] - get returned note id and returned tag ids and .map to create array of note_id and tag_id to add to notes_tags table. 
[] - add query to tags database to query tags table and see if the tags have already been created.  If they have, return their ids. 
[] - create if else to separate if there are new tags or if there are just old tags. 
    [] - if there are old and new tags, take the returned ids from the tags check query, post the new tags, get the responded ids from the post, combine the old and new ids and add to object with note_id and all tag_ids. 
    [] - if ther are just old tags take the returned ids from the tags check and make object with note_id and all tag_ids. 
    [] - post object with node_id and tag_ids to notes_tag table. 

## Create Get Routes for Many to Many relationship.
[] - get note based on route param id. 
[] - Use note ID to get table with id.  
[] - Use joined notes_tag returned fields to reteurn all tags. 