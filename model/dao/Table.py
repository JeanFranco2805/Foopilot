from model.db import db

class Mesa(db.Model):
    __tablename__ = 'Mesas'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)

    def __init__(self, nombre):
        self.nombre = nombre

