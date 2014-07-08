from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine
from sqlalchemy.orm.exc import NoResultFound



from sqlalchemy import Column, DateTime, String, Integer, ForeignKey, func
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Lists(Base):
    __tablename__ = 'lists'
    _id = Column(Integer, primary_key=True)
    id = Column(Integer, unique=True)
    name = Column(String)


engine = create_engine('sqlite:///orm_in_detail.sqlite')
#FIXME: unable to work
#engine = create_engine('sqlite:///:memory:', echo=True)
Base.metadata.create_all(engine)

Session = scoped_session(sessionmaker(bind=engine, autoflush=True, autocommit=False))#, expire_on_commit=True)

from MeteorClient import MeteorClient

def subscribed(subscription):
    print '* SUBSCRIBED {}'.format(subscription)

def unsubscribed(subscription):
    print '* UNSUBSCRIBED {}'.format(subscription)

def added(collection, id, fields):
    for key, value in fields.items():
        print '  - FIELD {} {}'.format(key, value)

    s = Session()
    try:
    	item = s.query(Lists).filter(Lists.id==id).one()
    except NoResultFound, e:
        item = Lists()
        print '* ADDING {} {}'.format(collection, id)
        
    for key, value in fields.items():
        print '  - FIELD {} {}'.format(key, value)
        setattr(item,key,value)

    setattr(item,'id', id)
    s.add(item)
    s.commit()
    print "DB Lists count", s.query(Lists).count()

    # query the data each time something has been added to
    # a collection to see the data `grow`
    all_lists = client.find('lists', selector={})
    print 'Lists: {}'.format(all_lists)
    print 'Num lists: {}'.format(len(all_lists))
    

    # if collection == 'list' you could subscribe to the list here
    # with something like
    # client.subscribe('todos', id)
    # all_todos = client.find('todos', selector={})
    # print 'Todos: {}'.format(all_todos)

def changed(collection, id, fields, cleared):
    print '* CHANGED {} {}'.format(collection, id)
    for key, value in fields.items():
        print '  - FIELD {} {}'.format(key, value)
    for key, value in cleared.items():
        print '  - CLEARED {} {}'.format(key, value)
    
    #FIXME:
    added(collection, id, fields)
    added(collection, id, cleared)

def removed(collection, id):
    print '* REMOVED {} {}'.format(collection, id)
    s = Session()
    try:
        s.delete(s.query(Lists).filter(Lists.id==id).one())
        s.commit()
    except NoResultFound, e:
        pass

def connected():
    print '* CONNECTED'

def subscription_callback(error):
    if error:
        print error



## now all calls to Session() will create a thread-local session
#some_session = Session()
#
## you can now use some_session to run multiple queries, etc.
## remember to close it when you're finished!
#Session.remove()

client = MeteorClient('ws://127.0.0.1:3000/websocket')
client.on('subscribed', subscribed)
client.on('unsubscribed', unsubscribed)
client.on('added', added)
client.on('connected', connected)
client.on('changed', changed)
client.on('removed', removed)

client.connect()
client.subscribe('lists')
# todos needs a list _id to subscribe to
# client.subscribe('todos')


# (sort of) hacky way to keep the client alive
# ctrl + c to kill the script
while True:
    try:
        client.ddp_client.run_forever()
    except KeyboardInterrupt:
        break

# Behind the scenes the client is getting data
# and updating a dictionary containing all the
# subscribed data. (currently) A query is only
# ran against the dictionary and is not
# reactive like a queryset. It's simply a snapshot.


