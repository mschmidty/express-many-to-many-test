const express = require('express');
const router = express.Router();
const queries = require('../db/notesTagQueries');

function validNote(note){
    const hasTitle = typeof note.title == 'string' && note.title.trim() != '';
    const hasBody = typeof note.body == 'string' && note.body.trim() != '';
    return hasTitle && hasBody;
}

router.get('/', (req, res, next)=>{
  queries.getAllNotes().then(notes=>{
    res.json(notes)
  })
})

// 
router.post('/', (req, res, next) => {
	const note = {
		title: req.body.title,
		body: req.body.body
	}
	if(validNote(note)){
		queries.createNote(req.body).then(createdNote=>{
			res.json(createdNote)
		})
    }else{
			next(new Error('Invalid Sticker'))
    }
})

function isValidId(req, res, next) {
  if(!isNaN(req.params.id)) return next();
  next(new Error('Invalid ID'));
}

router.get('/:id', isValidId, (req, res, next)=>{
	queries.getOneNote(req.params.id).then(note=>{
		if(note){
			queries.getOneNote(req.params.id).then(note=>{
				res.json(note)
			})
		}else{
			next();
		}
	})
})

router.put('/:id', isValidId, (req, res, next)=>{
	queries.updateNote(req.params.id, req.body).then(note=>{
		res.json(note)
	})
})

router.delete('/:id', isValidId, (req, res, next)=>{
  queries.deleteNote(req.params.id).then((result) => res.json(result))
})

module.exports = router;