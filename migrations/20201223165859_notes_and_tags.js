
exports.up = function(knex) {
    return knex.schema
    .createTable('notes', (table)=>{
        table.increments();
        table.text('title');
        table.text('body');
        table.timestamps(true, true)
    })
    .createTable('tags', (table)=>{
        table.increments();
        table.text('name').unique();
    })
    .createTable('notes_tag', (table)=>{
        table.increments();
        table.integer('note_id').references('id').inTable('notes');
        table.integer('tag_id').references('id').inTable('tags');
        table.unique(['note_id', 'tag_id']);
    })
};

exports.down = function(knex) {
    return knex.schema
    .dropTable('notes')
    .dropTable('tags')
    .dropTable('notes_tag')
};
