# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user is not None else None

db.define_table('prev_yields',
                Field('user_id', 'reference auth_user', default=auth.user_id),
                Field('yields', 'string'),
                )

db.define_table('todays_recipes',
                Field('user_id', 'reference auth_user', default=auth.user_id),
                Field('yields', 'string')
                )

db.define_table('todays_ingredients',
                Field('user_id', 'reference auth_user', default=auth.user_id),
                Field('ingredients', 'string')
                )

db.define_table('ingredients',
                Field('name', 'text')
                )

db.define_table('recipes',
                Field('created_by', 'reference auth_user', default=auth.user_id),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_public', 'boolean', default=False),
                Field('name', 'text'),
                Field('description', 'text'),
                Field('ingredients', 'string'),
                Field('steps', 'string')
                )

# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
