const knex = require("./knex");

//This function takes in a list of tag names then:
// 1. queries the tags database for matches
// 2. if all tags match it just returns all of the matched tags that hvae been returned.
// 3. else if some of the matched tags exist post the non matching, get response combine
//    the matcheing with the new response and return both concatenated.
// 4. else if non of the tags match return all of them.
// All results are an array of tags [{id:'', name:''}, {id:'', name:''}]
function manyToManyTags(tags) {
  return knex("tags")
    .whereIn("name", tags)
    .then((matchedTags) => {
      if (matchedTags.length == tags.length) {
        return matchedTags;
      } else if (matchedTags.length > 0) {
        const matchedTagNames = matchedTags.map((tag) => tag.name);
        const tagNamesToPost = tags.filter((x) => !matchedTagNames.includes(x));
        const tagNamesToPostFormat = tagNamesToPost.map((tag) => ({name: tag}));
        return knex("tags")
          .insert(tagNamesToPostFormat, "*")
          .then((postedTags) => {
            return postedTags.concat(matchedTags);
          });
      } else {
        const tagsWithName = tags.map((tag) => ({ name: tag }));
        return knex("tags").insert(tagsWithName, "*");
      }
    });
}

function getTagsForNote(noteId){
  return knex("notes_tag")
    .where("note_id", noteId)
    .then((notes_tag) => {
      const tag_ids = notes_tag.map((tag) => tag.tag_id);
      return knex("tags")
        .whereIn("id", tag_ids)
    });
}

module.exports = {
  getTagsMatch(tagNameArray) {
    return knex("tags").whereIn("name", tagNameArray);
  },
  getTagsMatchId(tagIdArray) {
    return knex("tags").whereIn("id", tagIdArray);
  },
  createNotesTag(notesTag) {
    return knex("notes_tag").insert(notesTag, "*");
  },
  getNotesTagMatch(noteId) {
    return knex("notes_tag").where("note_id", noteId);
  },
  async getAllNotes(){
    const allNotes = await knex('notes')
    const endNotes = await Promise.all(
      allNotes.map(async (note)=>{
        const tagsNotes = await knex('notes_tag').where('note_id', note.id)
        const tagIDs = tagsNotes.map(tag=>tag.tag_id)
        const tags = await knex('tags').whereIn('id', tagIDs)

        const notes = {
          ...note,
          tags
        }

        return notes
      })
    )
    return endNotes;
  },
  createNote(fullNote) {
    let noteReq = {
      title: fullNote.title,
      body: fullNote.body,
    };
    const tags = fullNote.tags.map((tag) => tag.trim());
    return knex("notes")
      .insert(noteReq, "*")
      .then((note) => {
        return knex("tags")
          .whereIn("name", tags)
          .then((matchedTags) => {
            if (matchedTags.length === tags.length) {
              return matchedTags;
            } else {
              if (matchedTags.length > 0) {
                const matchedTagNames = matchedTags.map((tag) => tag.name);
                const tagNamesToPost = tags.filter(
                  (x) => !matchedTagNames.includes(x)
                );
                const tagNamesToPostFormat = tagNamesToPost.map((tag) => ({
                  name: tag,
                }));
                return knex("tags")
                  .insert(tagNamesToPostFormat, "*")
                  .then((postedTags) => {
                    return postedTags.concat(matchedTags);
                  });
              } else {
                const tagsWithName = tags.map((tag) => ({ name: tag }));
                return knex("tags").insert(tagsWithName, "*");
              }
            }
          })
          .then((allTags) => {
            const notes_tag = allTags.map((tag) => ({
              note_id: note[0].id,
              tag_id: tag.id,
            }));
            return knex("notes_tag")
              .insert(notes_tag, "*")
              .then((notesTags) => {
                const finalRes = {
                  ...note[0],
                  notesTags,
                  allTags,
                };
                return finalRes;
              });
          });
      });
  },
  getOneNote(noteId) {
    return knex("notes")
      .where("id", noteId)
      .first()
      .then((note) => {
        return knex("notes_tag")
          .where("note_id", note.id)
          .then((notes_tag) => {
            const tag_ids = notes_tag.map((tag) => tag.tag_id);
            return knex("tags")
              .whereIn("id", tag_ids)
              .then((tags) => {
                const finalNote = {
                  ...note,
                  notes_tag,
                  tags,
                };
                return finalNote;
              });
          });
      });
  },
  async updateNote(id, reqNote){

    const currentDatetime = new Date();
    const note = {
      title: reqNote.title,
      body: reqNote.body,
      updated_at: currentDatetime
    };
    const tags = reqNote.tags.map((tag) => tag.trim());
    const returnedNote = await knex("notes").where("id", id).update(note, "*");
    const oldNotesTags = await knex("notes_tag").where("note_id", id);

    const tagIds = oldNotesTags.map((tag) => tag.tag_id);
    const oldTags = await knex("tags").whereIn("id", tagIds);

    const oldTagsMapped = oldTags.map((tag) => tag.name);
    const tagsToDelete = oldTags.filter(
      (tag) => !tags.includes(tag.name)
    );
    const tagsToAdd = tags.filter(
      (tag) => !oldTagsMapped.includes(tag)
    );
    const tagTodo = {
      tagsDeletedFromNote:tagsToDelete,
      tagsAddedToNote: tagsToAdd
    }
    if (tagsToDelete.length > 0) {
      const tagsToDeleteIds = tagsToDelete.map((tag) => tag.id);
      const deletedTags = await knex("notes_tag")
        .where("note_id", id)
        .whereIn("tag_id", tagsToDeleteIds)
        .delete()
    }
    if(tagsToAdd.length>0){
      const addedTags = await manyToManyTags(tagsToAdd)
      const notes_tag = addedTags.map((tag) => ({
        note_id: returnedNote[0].id,
        tag_id: tag.id,
      }));
      const insertedTags = await knex("notes_tag").insert(notes_tag, "*")
    }
    const finalTags = await getTagsForNote(returnedNote[0].id);

    const finalRes = {
      ...returnedNote[0],
      tags: finalTags,
      ...tagTodo

    }
    return finalRes;
  },
  async deleteNote(id){
    await knex('notes_tag').where('note_id', id).delete()
    await knex('notes').where('id', id).delete()
    
    
    return {message: `Deleted the note with the ID: ${id}`}
  }
};
