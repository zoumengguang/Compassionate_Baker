import tempfile
import time

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# get ingredients
def get_ingredients():
    ingr = []
    
    list = db().select(db.ingredients.ALL)
    
    for i, r in enumerate(list):
        temp = dict(id = r.id,
                    name = r.name)
        ingr.append(temp)
    
    return response.json(dict(ingredients = ingr))

# add recipe to database
@auth.requires_signature()
def add_recipe():
    id = db.recipes.insert(is_public = request.vars.is_public,
                           name = request.vars.name,
                           description = request.vars.description,
                           ingredients = request.vars.ingredients,
                           steps = request.vars.steps)
    return response.json(dict())
