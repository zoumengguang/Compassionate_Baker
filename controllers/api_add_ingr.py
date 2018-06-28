import tempfile
import time

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

# Here go your api methods.

# Check if ingredient is already in the database
def check_duplicate():
    item = None
    
    # make name of ingredient lowercase
    new_name = request.vars.name
    new_name = new_name.lower()
    new_name = " ".join(new_name.split())
    
    item = db(db.ingredients.name == new_name).select().first()
    
    # if item is not in database, add item to database and return true
    # else item is not in database and return false
    if item is None:
        i_id = db.ingredients.insert(name = new_name)
        return response.json(dict(dupe=False))
    else:
        return response.json(dict(dupe=True))
