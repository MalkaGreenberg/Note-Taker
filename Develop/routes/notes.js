const note = require('express').Router();
const fs = require('fs');
const util = require('util');
const uniqid = require('uniqid');
const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};
//GET Route for retrieving all notes from the JSON
note.get('/notes', (req, res) => {
    // res.sendFile(path.join(__dirname, '../db/db.json'));
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data))); 
});
    

// POST Route for submitting new notes
note.post('/notes', (req, res) => {
    console.log(req.body);

    const { title, text } = req.body;
  
    if (req.body) {
      const newNote = {
            title: title,
            text: text,
            note_id: uniqid(),
          };
  
      readAndAppend(newNote, './db/db.json');
      res.json(`Tip added successfully`);
    } else {
      res.error('Error in adding tip');
    }
  });

  
  note.delete('/notes/:id', (req, res) => {
    const noteIdToDelete = req.params.id;
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        // Find the index of the note to be deleted
        const noteIndex = parsedData.findIndex((note) => note.note_id === noteIdToDelete);
        if (noteIndex !== -1) {
          // Remove the note from the array
          parsedData.splice(noteIndex, 1);
          writeToFile('./db/db.json', parsedData);
          res.json('Note deleted successfully');
        } else {
          res.status(404).json('Note not found');
        }
      }
    });
  });
  
  module.exports = note;